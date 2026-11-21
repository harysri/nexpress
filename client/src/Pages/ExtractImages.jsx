import { useEffect, useRef, useState } from "react";
import { Download, FileArchive, Image as ImageIcon } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import {
  downloadFile,
  extractImagesFromPDF,
  formatFileSize,
  zipFiles,
} from "../utils/pdfTools";
import { CARD, GHOST_BUTTON, PRIMARY_BUTTON } from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "Why do some results look like whole pages?",
    answer:
      "Pages made only of text or vector graphics have no embedded raster images. NexPress renders those pages to PNG so you still get a usable output, and marks them as page renders.",
  },
  {
    id: 2,
    question: "Is the original image quality preserved?",
    answer:
      "Embedded images are decoded and written as PNG, so there is no extra JPEG loss. They are re-encoded once from the decoded pixels, which keeps detail but may not match the exact original byte stream.",
  },
  {
    id: 3,
    question: "What are the images named?",
    answer:
      "Source-file-page-number-image-number, for example report-page-3-image-2.png. Page renders use source-file-page-number.png.",
  },
];

export default function ExtractImages() {
  useDocumentMeta(
    "Extract Images from PDF",
    "Pull embedded images out of a PDF and download them individually or as a ZIP.",
  );

  const tool = useFileTool({ kind: "pdf" });
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

  const handleExtract = () =>
    tool.run(async () => {
      clearImages();
      const extracted = await extractImagesFromPDF(
        tool.file,
        tool.setProgress,
      );
      setImages(
        extracted.map((item) => ({
          ...item,
          url: URL.createObjectURL(item.file),
        })),
      );
      const pages = new Set(extracted.map((item) => item.page)).size;
      tool.setSuccess(
        `Found ${extracted.length} image${extracted.length === 1 ? "" : "s"} across ${pages} page${pages === 1 ? "" : "s"}.`,
      );
    });

  const handleZip = async () => {
    if (!images.length) return;
    setZipping(true);
    try {
      const archive = await zipFiles(images, "extracted-images.zip");
      downloadFile(archive, archive.name);
    } catch (error) {
      tool.setError(error.message || "Could not build the ZIP.");
    } finally {
      setZipping(false);
    }
  };

  return (
    <ToolShell
      icon={ImageIcon}
      title="Extract Images"
      subtitle="Every embedded image in the PDF, plus a render of any page that has none."
      tone="amber"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={(files) => {
          clearImages();
          tool.addFiles(files);
        }}
        label="Drop a PDF to extract images"
        description="or click to browse"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <p className="mb-4 truncate text-sm text-slate-500 dark:text-slate-400">
            {tool.file.name} · {formatFileSize(tool.file.size)}
          </p>
          <button
            type="button"
            onClick={handleExtract}
            disabled={tool.busy}
            className={PRIMARY_BUTTON}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            {tool.busy ? "Extracting…" : "Extract images"}
          </button>
        </div>
      )}

      <ToolStatus
        error={tool.error}
        success={tool.success}
        busy={tool.busy}
        progress={tool.progress}
      />

      {images.length > 0 && (
        <section className={CARD} aria-label="Extracted images">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {images.length} image{images.length === 1 ? "" : "s"}
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
                className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60"
              >
                <div className="flex h-32 items-center justify-center bg-white/70 dark:bg-slate-950/50 p-2">
                  <img
                    src={image.url}
                    alt={`Extracted from page ${image.page}`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="flex items-center justify-between gap-1 text-xs text-slate-600 dark:text-slate-300">
                    <span>Page {image.page}</span>
                    {image.pageRender && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                        page
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
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
