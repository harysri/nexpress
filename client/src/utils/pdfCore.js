import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export const A4 = [595.28, 841.89];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const bytesOf = (value) =>
  value instanceof Uint8Array ? value : new Uint8Array(value);

export function friendlyPdfError(error) {
  const message = String(error?.message || error || "");
  if (/encrypted|password|EncryptedPDF/i.test(message)) {
    return "This PDF is password protected. Use Password Protection → Remove password first.";
  }
  if (/Invalid PDF|not a PDF|Expected instance|Unable to parse|parse/i.test(message)) {
    return "That file could not be read as a valid PDF.";
  }
  return `Could not process this PDF: ${message}`;
}

async function open(bytes, password) {
  try {
    return await PDFDocument.load(bytesOf(bytes), password ? { password } : undefined);
  } catch (error) {
    throw new Error(friendlyPdfError(error));
  }
}

export async function getPageCount(bytes) {
  const doc = await open(bytes);
  return doc.getPageCount();
}

export async function mergePDFs(list) {
  if (!list?.length) throw new Error("Add at least one PDF to merge.");
  const out = await PDFDocument.create();
  for (const bytes of list) {
    const source = await open(bytes);
    const pages = await out.copyPages(source, source.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  return out.save({ useObjectStreams: true });
}

export async function extractPages(bytes, indices) {
  const source = await open(bytes);
  const total = source.getPageCount();
  if (!indices?.length) throw new Error("Select at least one page to keep.");
  const wanted = indices.map((index) => clamp(index, 0, total - 1));
  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, wanted);
  pages.forEach((page) => out.addPage(page));
  return out.save({ useObjectStreams: true });
}

/**
 * Build a new PDF from a list of page indices.
 * `rotations` is keyed by the *source* page index and adds to any rotation
 * the page already carries.
 */
export async function organizePDF(bytes, { order, rotations = {} } = {}) {
  const source = await open(bytes);
  const total = source.getPageCount();
  const wanted = (order?.length ? order : source.getPageIndices()).map((index) =>
    clamp(index, 0, total - 1),
  );
  if (!wanted.length) throw new Error("Keep at least one page.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, wanted);
  pages.forEach((page, position) => {
    const extra = rotations[wanted[position]] || 0;
    if (extra) {
      const angle = ((page.getRotation().angle + extra) % 360 + 360) % 360;
      page.setRotation(degrees(angle));
    }
    out.addPage(page);
  });
  return out.save({ useObjectStreams: true });
}

/** Parse input like "1-3, 5, 8-" into 1-based inclusive ranges. */
export function parsePageRanges(input, total) {
  const text = String(input || "").trim();
  if (!text) return [];
  const ranges = [];
  for (const chunk of text.split(",")) {
    const part = chunk.trim();
    if (!part) continue;
    const isRange = part.includes("-");
    const [rawFrom, rawTo] = part.split("-").map((value) => value.trim());
    const from = clamp(parseInt(rawFrom, 10) || 1, 1, total);
    const to =
      isRange && (rawTo === undefined || rawTo === "")
        ? total
        : isRange
          ? clamp(parseInt(rawTo, 10) || from, 1, total)
          : from;
    ranges.push({ from: Math.min(from, to), to: Math.max(from, to) });
  }
  return ranges;
}

export async function splitPDF(bytes, ranges) {
  const source = await open(bytes);
  const total = source.getPageCount();
  const results = [];
  for (const [index, range] of (ranges || []).entries()) {
    const from = clamp(range.from, 1, total);
    const to = clamp(range.to ?? range.from, 1, total);
    const indices = [];
    for (let page = Math.min(from, to); page <= Math.max(from, to); page++) {
      indices.push(page - 1);
    }
    const out = await PDFDocument.create();
    const pages = await out.copyPages(source, indices);
    pages.forEach((page) => out.addPage(page));
    results.push({
      label: range.label || `pages-${from}${to !== from ? `-${to}` : ""}`,
      bytes: await out.save({ useObjectStreams: true }),
    });
    if (!results[index]) throw new Error("Could not split this PDF.");
  }
  if (!results.length) throw new Error("Enter at least one page range.");
  return results;
}

/**
 * Upstream pdf-lib has no encryption support at all, so the secure paths use
 * @cantoo/pdf-lib (AES-256 revision 6). It is imported lazily to keep it out of
 * the bundle for every other tool.
 */
async function secureDocument() {
  const { PDFDocument: SecurePDFDocument } = await import("@cantoo/pdf-lib");
  return SecurePDFDocument;
}

export async function protectPDF(
  bytes,
  { userPassword, ownerPassword, permissions = {} },
) {
  if (!userPassword) throw new Error("Enter a password.");
  const SecurePDF = await secureDocument();
  let doc;
  try {
    doc = await SecurePDF.load(bytesOf(bytes));
  } catch (error) {
    throw new Error(friendlyPdfError(error));
  }

  const finalPermissions = {
    printing: "highResolution",
    modifying: false,
    copying: false,
    annotating: false,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: false,
    ...permissions,
  };

  doc.encrypt({ userPassword, ownerPassword, permissions: finalPermissions });
  return doc.save({ useObjectStreams: false });
}

export async function unlockPDF(bytes, password) {
  const SecurePDF = await secureDocument();
  let doc;
  try {
    doc = await SecurePDF.load(bytesOf(bytes), { password });
  } catch (error) {
    const message = String(error?.message || error);
    if (/encrypt|password|decrypt/i.test(message)) {
      throw new Error("That password does not open this PDF.");
    }
    throw new Error(friendlyPdfError(error));
  }
  return doc.save({ useObjectStreams: true });
}

export async function watermarkPDF(
  bytes,
  { text, opacity = 0.22, size = 46, rotation = 45, color = [0.45, 0.45, 0.45], firstPageOnly = false } = {},
) {
  const label = String(text || "").trim();
  if (!label) throw new Error("Enter watermark text.");
  const doc = await open(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const targets = firstPageOnly ? pages.slice(0, 1) : pages;
  const radians = (rotation * Math.PI) / 180;

  for (const page of targets) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, size);
    // Centre the rotated text on the page rather than its baseline.
    const x = width / 2 - (textWidth / 2) * Math.cos(radians) + size * 0.35 * Math.sin(radians);
    const y = height / 2 - (textWidth / 2) * Math.sin(radians) - size * 0.35 * Math.cos(radians);
    page.drawText(label, {
      x,
      y,
      size,
      font,
      opacity,
      rotate: degrees(rotation),
      color: rgb(color[0], color[1], color[2]),
    });
  }
  return doc.save({ useObjectStreams: true });
}

export async function pageNumbersPDF(
  bytes,
  { startAt = 1, size = 10, margin = 26, position = "bottom-center", format = "{page} / {total}" } = {},
) {
  const doc = await open(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  pages.forEach((page, index) => {
    const label = String(format)
      .replace("{page}", String(startAt + index))
      .replace("{total}", String(total));
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, size);
    const x = position.endsWith("left")
      ? margin
      : position.endsWith("right")
        ? width - margin - textWidth
        : (width - textWidth) / 2;
    const y = position.startsWith("top") ? height - margin - size : margin;
    page.drawText(label, {
      x,
      y,
      size,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
  });
  return doc.save({ useObjectStreams: true });
}

export async function signPDF(
  bytes,
  { pngBytes, pageIndex = -1, widthRatio = 0.26, xRatio = 0.72, yRatio = 0.08 } = {},
) {
  const doc = await open(bytes);
  const image = await doc.embedPng(bytesOf(pngBytes));
  const pages = doc.getPages();
  const targets =
    pageIndex < 0 ? pages : [pages[clamp(pageIndex, 0, pages.length - 1)]];
  const aspect = image.height / image.width;
  for (const page of targets) {
    const { width, height } = page.getSize();
    const drawWidth = width * clamp(widthRatio, 0.05, 0.9);
    const drawHeight = drawWidth * aspect;
    page.drawImage(image, {
      x: width * xRatio - drawWidth / 2,
      y: height * yRatio,
      width: drawWidth,
      height: drawHeight,
    });
  }
  return doc.save({ useObjectStreams: true });
}

/**
 * Images → PDF. Aspect ratio is always preserved and images are centred.
 * `pageSize: "fit"` creates pages exactly the size of each image.
 */
export async function imagesToPdf(
  images,
  { layout = "portrait", pageSize = "a4", margin = 24 } = {},
) {
  const doc = await PDFDocument.create();
  for (const image of images) {
    const embedded =
      image.type === "png"
        ? await doc.embedPng(bytesOf(image.bytes))
        : await doc.embedJpg(bytesOf(image.bytes));
    if (pageSize === "fit") {
      const page = doc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, {
        x: 0,
        y: 0,
        width: embedded.width,
        height: embedded.height,
      });
      continue;
    }
    const [pageWidth, pageHeight] =
      layout === "landscape" ? [A4[1], A4[0]] : A4;
    const page = doc.addPage([pageWidth, pageHeight]);
    const scale = Math.min(
      (pageWidth - margin * 2) / embedded.width,
      (pageHeight - margin * 2) / embedded.height,
    );
    const width = embedded.width * scale;
    const height = embedded.height * scale;
    page.drawImage(embedded, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    });
  }
  if (!doc.getPageCount()) throw new Error("No images could be embedded.");
  return doc.save({ useObjectStreams: true });
}

/** One JPEG per page, page sized exactly to the image (used by compression). */
export async function imagesToPdfExact(items) {
  const doc = await PDFDocument.create();
  for (const item of items) {
    const embedded = await doc.embedJpg(bytesOf(item.bytes));
    const page = doc.addPage([item.width, item.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: item.width,
      height: item.height,
    });
  }
  return doc.save({ useObjectStreams: true });
}

/** Rewrite the file structure without touching page content (lossless). */
export async function losslessRewrite(bytes) {
  const doc = await open(bytes);
  return doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });
}
