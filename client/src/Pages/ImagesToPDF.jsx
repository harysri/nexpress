import { useState } from "react";
import { FileImage } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import ToolStatus from "../components/ToolStatus";
import ResultCard from "../components/ResultCard";
import PDFPreview from "../components/PDFPreview";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import {
  bytesToFile,
  createPdfFromImages,
  formatFileSize,
} from "../utils/pdfTools";
import { CARD, INPUT, LABEL, PRIMARY_BUTTON } from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "Which image formats are supported?",
    answer:
      "JPG and PNG are embedded directly. GIF, WebP and BMP are converted through a canvas first, and transparency is flattened onto white.",
  },
  {
    id: 2,
    question: "Will my images be stretched?",
    answer:
      "No. Images keep their aspect ratio and are centred on the page. “Fit to image” makes the page exactly the size of each picture instead of forcing A4.",
  },
  {
    id: 3,
    question: "How many images can I convert?",
    answer:
      "Up to 50 per batch, 50 MB each. Reorder them by dragging before converting; the PDF follows the list order.",
  },
];

export default function ImagesToPDF() {
  useDocumentMeta(
    "Images to PDF",
    "Convert JPG, PNG, GIF, WebP and BMP images into a PDF with proper aspect ratio.",
  );

  const tool = useFileTool({ kind: "image", multiple: true, maxFiles: 50 });
  const [layout, setLayout] = useState("portrait");
  const [pageSize, setPageSize] = useState("a4");
  const [preview, setPreview] = useState(null);

  const handleConvert = () =>
    tool.run(async () => {
      const files = tool.files.map((item) => item.file);
      const { bytes, imageCount } = await createPdfFromImages(files, {
        layout,
        pageSize,
        onProgress: tool.setProgress,
      });
      const file = bytesToFile(bytes, `images-${imageCount}-pages.pdf`);
      tool.setOutput(
        file,
        `${imageCount} image${imageCount === 1 ? "" : "s"} · ${
          pageSize === "fit" ? "page fits image" : `A4 ${layout}`
        }`,
      );
      tool.setSuccess(
        `Created a ${imageCount}-page PDF (${formatFileSize(file.size)}).`,
      );
    });

  return (
    <ToolShell
      icon={FileImage}
      title="Images to PDF"
      subtitle="Combine photos and scans into one PDF without squashing them."
      tone="violet"
      faqs={FAQS}
    >
      <FileUpload
        kind="image"
        multiple
        onFilesSelected={tool.addFiles}
        label="Drop images to convert"
        description="JPG, PNG, GIF, WebP or BMP"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {tool.files.length} image{tool.files.length === 1 ? "" : "s"}
            </h2>
            <span className="text-xs text-slate-500">drag to reorder</span>
          </div>

          <FileList
            files={tool.files}
            onRemove={tool.removeFile}
            onMove={tool.moveFile}
            reorder
            draggable
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="images-layout">
                Page orientation
              </label>
              <select
                id="images-layout"
                value={layout}
                onChange={(event) => setLayout(event.target.value)}
                className={INPUT}
                disabled={pageSize === "fit"}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="images-page-size">
                Page size
              </label>
              <select
                id="images-page-size"
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
                className={INPUT}
              >
                <option value="a4">A4 with margins</option>
                <option value="fit">Fit to each image</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleConvert}
              disabled={tool.busy}
              className={PRIMARY_BUTTON}
            >
              <FileImage className="h-4 w-4" aria-hidden="true" />
              {tool.busy ? "Converting…" : "Create PDF"}
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

      <ResultCard
        result={tool.result}
        onPreview={setPreview}
        onReset={tool.reset}
        downloadLabel="Download PDF"
      />

      {preview && (
        <PDFPreview file={preview} onClose={() => setPreview(null)} />
      )}
    </ToolShell>
  );
}
