import { useEffect, useRef, useState } from "react";
import { Download, FileArchive, Images } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import {
  downloadFile,
  formatFileSize,
  pdfToImages,
  zipFiles,
} from "../utils/pdfTools";
import {
  CARD,
  GHOST_BUTTON,
  INPUT,
  LABEL,
  PRIMARY_BUTTON,
} from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "What resolution should I choose?",
    answer:
      "Scale 1× matches the PDF's own point size. 2× is a good default for screens and documents; 3× is better for printing but produces much larger files.",
  },
  {
    id: 2,
    question: "JPG or PNG?",
    answer:
      "JPG is smaller and fine for photos or scanned pages. PNG is lossless and better for diagrams, screenshots and text-heavy pages.",
  },
  {
    id: 3,
    question: "Can I convert a password-protected PDF?",
    answer:
      "Not directly. Remove the password first with the Password Protection tool, then render the pages here.",
  },
];

export default function PDFToImages() {
  useDocumentMeta(
    "PDF to Images",
    "Convert every PDF page to a JPG or PNG in your browser, with adjustable resolution.",
  );

  const tool = useFileTool({ kind: "pdf" });
  const [format, setFormat] = useState("jpeg");
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.9);
  const [images, setImages] = useState([]);
  const [zipping, setZipping] = useState(false);
  const imagesRef = useRef([]);
  imagesRef.current = images;

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    },
    [],
  );

  const clearImages = () => {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    setImages([]);
  };

  const handleConvert = () =>
    tool.run(async () => {
      clearImages();
      const rendered = await pdfToImages(tool.file, {
        format,
        scale,
        quality,
        onProgress: tool.setProgress,
      });
      setImages(
        rendered.map((item) => ({
          ...item,
          url: URL.createObjectURL(item.file),
        })),
      );
      tool.setSuccess(
        `Rendered ${rendered.length} page${rendered.length === 1 ? "" : "s"}.`,
      );
    });

  const handleZip = async () => {
    if (!images.length) return;
    setZipping(true);
    try {
      const archive = await zipFiles(images, "pdf-pages.zip");
      downloadFile(archive, archive.name);
    } catch (error) {
      tool.setError(error.message || "Could not build the ZIP.");
    } finally {
      setZipping(false);
    }
  };

  return (
    <ToolShell
      icon={Images}
      title="PDF to Images"
      subtitle="Turn pages into JPG or PNG files you can drop into slides, docs or the web."
      tone="sky"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={(files) => {
          clearImages();
          tool.addFiles(files);
        }}
        label="Drop a PDF to render"
        description="or click to browse"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <p className="mb-5 truncate text-sm text-slate-400">
            {tool.file.name} · {formatFileSize(tool.file.size)}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL} htmlFor="render-format">
                Format
              </label>
              <select
                id="render-format"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
                className={INPUT}
              >
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="render-scale">
                Resolution
              </label>
              <select
                id="render-scale"
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
                className={INPUT}
              >
                <option value={1}>1× (screen)</option>
                <option value={2}>2× (recommended)</option>
                <option value={3}>3× (print)</option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="render-quality">
                JPG quality — {Math.round(quality * 100)}%
              </label>
              <input
                id="render-quality"
                type="range"
                min="0.4"
                max="1"
                step="0.05"
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                disabled={format === "png"}
                className="w-full accent-sky-500 disabled:opacity-40"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleConvert}
              disabled={tool.busy}
              className={PRIMARY_BUTTON}
            >
              <Images className="h-4 w-4" aria-hidden="true" />
              {tool.busy ? "Rendering…" : "Render pages"}
            </button>
          </div>
        </div>
      )}

      <ToolStatus
        error={tool.error}
        success={tool.success}
        busy={tool.busy}
        progress={tool.progress}
      />

      {images.length > 0 && (
        <section className={CARD} aria-label="Rendered pages">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {images.length} page{images.length === 1 ? "" : "s"}
            </h2>
            <button
              type="button"
              onClick={handleZip}
              disabled={zipping}
              className={GHOST_BUTTON}
            >
              <FileArchive className="h-4 w-4" aria-hidden="true" />
              {zipping ? "Zipping…" : "Download all as ZIP"}
            </button>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => (
              <li
                key={image.file.name}
                className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60"
              >
                <div className="flex h-32 items-center justify-center bg-slate-950/50 p-2">
                  <img
                    src={image.url}
                    alt={`Page ${image.page}`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-300">Page {image.page}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(image.file.size)} · {image.width}×
                    {image.height}
                  </p>
                  <button
                    type="button"
                    onClick={() => downloadFile(image.file, image.file.name)}
                    className={`${GHOST_BUTTON} mt-1 w-full justify-center`}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ToolShell>
  );
}
