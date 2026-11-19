import { useState } from "react";
import { Minimize2 } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import ToolStatus from "../components/ToolStatus";
import ResultCard from "../components/ResultCard";
import PDFPreview from "../components/PDFPreview";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import {
  COMPRESSION_LEVELS,
  bytesToFile,
  compressPDF,
  formatFileSize,
} from "../utils/pdfTools";
import { CARD, PRIMARY_BUTTON, SECTION_TITLE } from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "How does compression work?",
    answer:
      "Low rewrites the PDF structure only, so text stays selectable. Medium, High and Aggressive re-render every page as a JPEG, which shrinks scanned documents a lot but turns text into an image. NexPress builds both candidates and keeps whichever file is smaller.",
  },
  {
    id: 2,
    question: "Why didn't my file get smaller?",
    answer:
      "If a PDF is already optimised, re-encoding can add size. In that case NexPress keeps the cleaned structural version and tells you no reduction was possible instead of handing back a bigger file.",
  },
  {
    id: 3,
    question: "Are my files uploaded anywhere?",
    answer:
      "No. pdf-lib and pdf.js run inside this tab. There is no backend and no network request carrying your document.",
  },
  {
    id: 4,
    question: "What is the size limit?",
    answer:
      "100 MB per file. Large files take longer because every page is rendered on your device, and the progress bar shows which page is being processed.",
  },
];

export default function CompressPDF() {
  useDocumentMeta(
    "Compress PDF",
    "Reduce PDF file size in your browser with four compression levels. No uploads, no server.",
  );

  const tool = useFileTool({ kind: "pdf" });
  const [level, setLevel] = useState(1);
  const [preview, setPreview] = useState(null);

  const handleCompress = () =>
    tool.run(async () => {
      const source = tool.file;
      const { bytes, strategy, original } = await compressPDF(
        source,
        level,
        tool.setProgress,
      );
      const file = bytesToFile(
        bytes,
        `${source.name.replace(/\.pdf$/i, "")}-compressed.pdf`,
      );
      const saved = source.size - file.size;

      tool.setOutput(
        file,
        `${strategy === "rasterized" ? "Pages re-encoded" : "Structure only"} · was ${formatFileSize(original.length)}`,
      );

      if (saved > 0) {
        tool.setSuccess(
          `Saved ${formatFileSize(saved)} (${Math.round((saved / source.size) * 100)}% smaller).`,
        );
      } else {
        tool.setSuccess(
          "This PDF was already optimised. The cleanest version is ready to download — it could not be made smaller without visible quality loss.",
        );
      }
    });

  return (
    <ToolShell
      icon={Minimize2}
      title="Compress PDF"
      subtitle="Shrink a PDF without guessing. Every level is measured and the smaller result wins."
      tone="emerald"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={tool.addFiles}
        label="Drop a PDF to compress"
        description="or click to browse"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <div className="mb-5">
            <FileList files={tool.files} onRemove={tool.removeFile} />
          </div>

          <fieldset>
            <legend className={SECTION_TITLE}>Compression level</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {COMPRESSION_LEVELS.map((option) => {
                const selected = level === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      selected
                        ? "border-emerald-500/60 bg-emerald-500/5"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <input
                        type="radio"
                        name="compression-level"
                        value={option.value}
                        checked={selected}
                        onChange={() => setLevel(option.value)}
                        className="accent-emerald-500"
                      />
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                      {option.hint}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleCompress}
              disabled={tool.busy}
              className={PRIMARY_BUTTON}
            >
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
              {tool.busy ? "Compressing…" : "Compress PDF"}
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
        downloadLabel="Download compressed PDF"
      />

      {preview && (
        <PDFPreview file={preview} onClose={() => setPreview(null)} />
      )}
    </ToolShell>
  );
}
