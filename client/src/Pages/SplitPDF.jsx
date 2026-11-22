import { useEffect, useRef, useState } from "react";
import { Download, FileArchive, Scissors } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import {
  getPageCount,
  parsePageRanges,
  splitPDF,
} from "../utils/pdfCore";
import {
  bytesToFile,
  downloadFile,
  fileToBytes,
  formatFileSize,
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
    question: "How do I write page ranges?",
    answer:
      'Comma-separated ranges, 1-based. "1-3, 5, 8-" produces three files: pages 1 to 3, page 5, and pages 8 to the end.',
  },
  {
    id: 2,
    question: "Can I get one file per page?",
    answer:
      "Yes. Enter a range for every page you want, or use the Organize tool to export individual pages. Each range becomes its own PDF.",
  },
  {
    id: 3,
    question: "What if a range is out of bounds?",
    answer:
      "Ranges are clamped to the document, so a typo like 999 on a 10-page file gives you the last page instead of an error.",
  },
];

export default function SplitPDF() {
  useDocumentMeta(
    "Split PDF",
    "Split a PDF into multiple documents by page range and download them individually or as a ZIP.",
  );

  const tool = useFileTool({ kind: "pdf" });
  const [rangeInput, setRangeInput] = useState("1-");
  const [parts, setParts] = useState([]);
  const [zipping, setZipping] = useState(false);
  const partsRef = useRef([]);
  partsRef.current = parts;

  useEffect(
    () => () => {
      partsRef.current.forEach((part) => URL.revokeObjectURL(part.url));
    },
    [],
  );

  const clearParts = () => {
    parts.forEach((part) => URL.revokeObjectURL(part.url));
    setParts([]);
  };

  const handleSplit = () =>
    tool.run(async () => {
      clearParts();
      const bytes = await fileToBytes(tool.file);
      const total = await getPageCount(bytes);
      const ranges = parsePageRanges(rangeInput, total);
      if (!ranges.length) throw new Error("Enter at least one page range.");

      const results = await splitPDF(bytes, ranges);
      const base = tool.file.name.replace(/\.pdf$/i, "") || "document";
      const output = results.map((result) => {
        const file = bytesToFile(result.bytes, `${base}-${result.label}.pdf`);
        return {
          name: file.name,
          size: file.size,
          label: result.label,
          file,
          url: URL.createObjectURL(file),
        };
      });
      setParts(output);
      tool.setSuccess(
        `Split into ${output.length} document${output.length === 1 ? "" : "s"}.`,
      );
    });

  const handleZip = async () => {
    if (!parts.length) return;
    setZipping(true);
    try {
      const archive = await zipFiles(parts, "split-documents.zip");
      downloadFile(archive, archive.name);
      tool.setSuccess("ZIP with every part downloaded.");
    } catch (error) {
      tool.setError(error.message || "Could not build the ZIP.");
    } finally {
      setZipping(false);
    }
  };

  const resetAll = () => {
    clearParts();
    tool.reset();
  };

  return (
    <ToolShell
      icon={Scissors}
      title="Split PDF"
      subtitle="Cut one document into several PDFs using page ranges."
      tone="teal"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={(files) => {
          clearParts();
          tool.addFiles(files);
        }}
        label="Drop a PDF to split"
        description="then describe the page ranges"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <p className="mb-4 truncate text-sm text-slate-900 dark:text-white">{tool.file.name}</p>
          <label className={LABEL} htmlFor="split-ranges">
            Page ranges
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="split-ranges"
              value={rangeInput}
              onChange={(event) => setRangeInput(event.target.value)}
              placeholder="1-3, 4, 5-"
              className={INPUT}
            />
            <button
              type="button"
              onClick={handleSplit}
              disabled={tool.busy}
              className={PRIMARY_BUTTON}
            >
              <Scissors className="h-4 w-4" aria-hidden="true" />
              {tool.busy ? "Splitting…" : "Split"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            One file per range. Use “8-” to keep everything from page 8 to the
            end.
          </p>
        </div>
      )}

      <ToolStatus error={tool.error} success={tool.success} busy={tool.busy} />

      {parts.length > 0 && (
        <section className={CARD} aria-label="Split results">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {parts.length} document{parts.length === 1 ? "" : "s"}
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
          <ul className="space-y-2">
            {parts.map((part) => (
              <li
                key={part.name}
                className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-900 dark:text-white">{part.name}</p>
                  <p className="text-xs text-slate-500">
                    {part.label} · {formatFileSize(part.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadFile(part.file, part.name)}
                  className={GHOST_BUTTON}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={resetAll}
            className={`${GHOST_BUTTON} mt-4`}
          >
            Start over
          </button>
        </section>
      )}
    </ToolShell>
  );
}
