import { loadPdf, pdfjsLib } from "../lib/pdfjs";
import {
  imagesToPdf as buildImagePdf,
  imagesToPdfExact,
  losslessRewrite,
} from "./pdfCore";

export const KINDS = {
  pdf: {
    types: ["pdf"],
    maxSizeMB: 100,
    accept: "application/pdf,.pdf",
    noun: "PDF",
  },
  image: {
    types: ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
    maxSizeMB: 50,
    accept: "image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp",
    noun: "image",
  },
};

export const COMPRESSION_LEVELS = [
  {
    value: 0,
    label: "Low",
    hint: "Structural cleanup only. Text stays selectable.",
    scale: 2,
    quality: 0.9,
  },
  {
    value: 1,
    label: "Medium",
    hint: "Pages are re-encoded as JPEG. Text becomes an image.",
    scale: 1.6,
    quality: 0.78,
  },
  {
    value: 2,
    label: "High",
    hint: "Smaller file, softer images and text.",
    scale: 1.2,
    quality: 0.6,
  },
  {
    value: 3,
    label: "Aggressive",
    hint: "Smallest file. Use for previews, not for printing.",
    scale: 0.9,
    quality: 0.45,
  },
];

export const SUPPORTED_LANGUAGES = {
  eng: "English",
  fra: "French",
  deu: "German",
  spa: "Spanish",
  ita: "Italian",
  por: "Portuguese",
  rus: "Russian",
  hin: "Hindi",
  mal: "Malayalam",
  kor: "Korean",
  jpn: "Japanese",
  chi_sim: "Chinese (Simplified)",
};

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

export const validateFiles = (incoming, kind = "pdf", maxSizeMB) => {
  const spec = KINDS[kind] || KINDS.pdf;
  const limit = maxSizeMB ?? spec.maxSizeMB;
  const errors = [];
  const validFiles = [];

  for (const file of Array.from(incoming || [])) {
    const extension = (file.name.split(".").pop() || "").toLowerCase();
    const type = (file.type || "").toLowerCase();
    const accepted =
      kind === "pdf"
        ? extension === "pdf" || type === "application/pdf"
        : spec.types.includes(extension) || type.startsWith("image/");

    if (!accepted) {
      errors.push(`${file.name} is not a supported ${spec.noun}.`);
      continue;
    }
    if (!file.size) {
      errors.push(`${file.name} is empty.`);
      continue;
    }
    if (file.size > limit * 1024 * 1024) {
      errors.push(`${file.name} is larger than ${limit} MB.`);
      continue;
    }
    validFiles.push(file);
  }

  return { validFiles, errors };
};

export const downloadFile = (data, filename) => {
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const fileToBytes = async (file) =>
  new Uint8Array(await file.arrayBuffer());

export const bytesToFile = (bytes, name, type = "application/pdf") =>
  new File([bytes], name, { type, lastModified: Date.now() });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const renderPageToCanvas = async (page, scale) => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, viewport, background: "#ffffff" }).promise;
  return canvas;
};

/**
 * Compress a PDF. Every level produces a candidate file; the smallest wins.
 * Levels 1-3 rasterise pages (honest trade-off: text is no longer selectable).
 */
export async function compressPDF(file, level = 1, onProgress) {
  const original = await fileToBytes(file);
  const setting =
    COMPRESSION_LEVELS.find((item) => item.value === level) ??
    COMPRESSION_LEVELS[1];

  const structural = await losslessRewrite(original);
  if (level === 0) {
    onProgress?.(100);
    return { bytes: structural, strategy: "structural", original };
  }

  const doc = await loadPdf(original);
  const items = [];
  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: setting.scale });
      const canvas = await renderPageToCanvas(page, setting.scale);
      const blob = await canvasToBlob(canvas, "image/jpeg", setting.quality);
      if (blob) {
        items.push({
          bytes: new Uint8Array(await blob.arrayBuffer()),
          width: viewport.width,
          height: viewport.height,
        });
      }
      onProgress?.(Math.round((pageNumber / doc.numPages) * 100));
    }
  } finally {
    doc.destroy?.();
  }

  if (!items.length) {
    return { bytes: structural, strategy: "structural", original };
  }

  const rasterized = await imagesToPdfExact(items);
  return rasterized.length < structural.length
    ? { bytes: rasterized, strategy: "rasterized", original }
    : { bytes: structural, strategy: "structural", original };
}

export async function extractImagesFromPDF(file, onProgress) {
  const doc = await loadPdf(await fileToBytes(file));
  const base = file.name.replace(/\.pdf$/i, "") || "document";
  const extracted = [];

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const operators = await page.getOperatorList();
      const objectIds = new Set();
      const inlineImages = [];

      for (let index = 0; index < operators.fnArray.length; index++) {
        const fn = operators.fnArray[index];
        const args = operators.argsArray[index];
        if (fn === pdfjsLib.OPS.paintImageXObject) {
          if (typeof args?.[0] === "string") objectIds.add(args[0]);
        } else if (fn === pdfjsLib.OPS.paintInlineImageXObject) {
          if (args?.[0]?.width) inlineImages.push(args[0]);
        } else if (fn === pdfjsLib.OPS.paintImageMaskXObject) {
          if (typeof args?.[0] === "string") objectIds.add(args[0]);
        }
      }

      const pageImages = [...inlineImages];
      for (const objectId of objectIds) {
        const data = await readImageObject(page, objectId);
        if (data?.width) pageImages.push(data);
      }

      let kept = 0;
      for (const data of pageImages) {
        if (data.width < 24 || data.height < 24) continue;
        const imageData = toImageData(data);
        if (!imageData) continue;
        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        canvas.getContext("2d").putImageData(imageData, 0, 0);
        const blob = await canvasToBlob(canvas, "image/png");
        if (!blob) continue;
        kept += 1;
        extracted.push({
          file: new File(
            [blob],
            `${base}-page-${pageNumber}-image-${kept}.png`,
            { type: "image/png" },
          ),
          page: pageNumber,
          width: imageData.width,
          height: imageData.height,
          pageRender: false,
        });
      }

      // Pages made of vector/text have no raster images: render the page itself
      // so the tool still returns something useful for every page.
      if (!kept) {
        const canvas = await renderPageToCanvas(page, 1.6);
        const blob = await canvasToBlob(canvas, "image/png");
        if (blob) {
          extracted.push({
            file: new File([blob], `${base}-page-${pageNumber}.png`, {
              type: "image/png",
            }),
            page: pageNumber,
            width: canvas.width,
            height: canvas.height,
            pageRender: true,
          });
        }
      }

      onProgress?.(Math.round((pageNumber / doc.numPages) * 100));
    }
  } finally {
    doc.destroy?.();
  }

  if (!extracted.length) {
    throw new Error(
      "No images could be extracted from this PDF. It may be corrupted or empty.",
    );
  }
  return extracted;
}

function readImageObject(page, objectId) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value || null);
    };
    try {
      const sync = page.objs.get(objectId);
      if (sync?.width) finish(sync);
    } catch {
      // Not resolved yet: fall through to the callback API.
    }
    try {
      page.objs.get(objectId, finish);
    } catch {
      finish(null);
    }
    setTimeout(() => finish(null), 3000);
  });
}

function toImageData(data) {
  const { width, height } = data;
  const raw = data.data;
  if (!width || !height || !raw?.length) return null;
  const expected = width * height * 4;

  if (raw.length >= expected) {
    return new ImageData(new Uint8ClampedArray(raw.slice(0, expected)), width, height);
  }
  if (raw.length >= width * height * 3) {
    const pixels = new Uint8ClampedArray(expected);
    for (let source = 0, target = 0; target < expected; source += 3, target += 4) {
      pixels[target] = raw[source];
      pixels[target + 1] = raw[source + 1];
      pixels[target + 2] = raw[source + 2];
      pixels[target + 3] = 255;
    }
    return new ImageData(pixels, width, height);
  }
  return null;
}

export async function pdfToImages(
  file,
  { format = "jpeg", scale = 2, quality = 0.9, onProgress } = {},
) {
  const doc = await loadPdf(await fileToBytes(file));
  const base = file.name.replace(/\.pdf$/i, "") || "document";
  const extension = format === "png" ? "png" : "jpg";
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const images = [];

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const canvas = await renderPageToCanvas(page, scale);
      const blob = await canvasToBlob(canvas, mime, quality);
      if (blob) {
        images.push({
          file: new File([blob], `${base}-page-${pageNumber}.${extension}`, {
            type: mime,
          }),
          page: pageNumber,
          width: canvas.width,
          height: canvas.height,
        });
      }
      onProgress?.(Math.round((pageNumber / doc.numPages) * 100));
    }
  } finally {
    doc.destroy?.();
  }

  if (!images.length) throw new Error("This PDF produced no pages.");
  return images;
}

/** Rasterise images that pdf-lib cannot embed directly (GIF/WebP/BMP). */
async function normaliseImage(file) {
  const isJpeg = /jpe?g$/i.test(file.name) || file.type === "image/jpeg";
  const isPng = /png$/i.test(file.name) || file.type === "image/png";
  if (isJpeg) return { bytes: await fileToBytes(file), type: "jpg" };
  if (isPng) return { bytes: await fileToBytes(file), type: "png" };

  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    element.src = URL.createObjectURL(file);
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(image.src);
  const blob = await canvasToBlob(canvas, "image/png");
  if (!blob) throw new Error(`Could not convert ${file.name}.`);
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: "png" };
}

export async function createPdfFromImages(
  files,
  { layout = "portrait", pageSize = "a4", onProgress } = {},
) {
  const images = [];
  for (const [index, file] of files.entries()) {
    images.push(await normaliseImage(file));
    onProgress?.(Math.round(((index + 1) / (files.length + 1)) * 100));
  }
  const bytes = await buildImagePdf(images, { layout, pageSize });
  return { bytes, imageCount: images.length };
}

export async function zipFiles(entries, archiveName, onProgress) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.file.name, entry.file);
  }
  const blob = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (metadata) => onProgress?.(Math.round(metadata.percent)),
  );
  return new File([blob], archiveName, { type: "application/zip" });
}

export async function performOCR(file, onProgress, languages = "eng") {
  const languageString = Array.isArray(languages)
    ? languages.join("+")
    : languages;
  const invalid = languageString
    .split("+")
    .filter((code) => !SUPPORTED_LANGUAGES[code]);
  if (invalid.length) {
    throw new Error(`Unsupported language code(s): ${invalid.join(", ")}`);
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(languageString, 1, {
    logger: (message) => {
      if (message.status === "recognizing text") {
        onProgress?.(Math.round(message.progress * 100));
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    onProgress?.(100);
    return { text: data.text || "", confidence: data.confidence ?? null };
  } finally {
    await worker.terminate();
  }
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** Trim transparent padding from a signature canvas before embedding. */
export async function trimCanvasToBlob(canvas) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const { data } = context.getImageData(0, 0, width, height);
  let top = height;
  let left = width;
  let right = 0;
  let bottom = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 12) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (right <= left || bottom <= top) {
    throw new Error("Draw your signature first.");
  }

  const padding = 8;
  const cropWidth = Math.min(width, right - left + 1 + padding * 2);
  const cropHeight = Math.min(height, bottom - top + 1 + padding * 2);
  const output = document.createElement("canvas");
  output.width = cropWidth;
  output.height = cropHeight;
  output
    .getContext("2d")
    .drawImage(
      canvas,
      left - padding,
      top - padding,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );
  const blob = await canvasToBlob(output, "image/png");
  if (!blob) throw new Error("Could not export the signature.");
  return new Uint8Array(await blob.arrayBuffer());
}
