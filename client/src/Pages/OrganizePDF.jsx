import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  RotateCw,
  Trash2,
  Undo2,
} from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import ResultCard from "../components/ResultCard";
import PDFPreview from "../components/PDFPreview";
import PdfPage from "../components/PdfPage";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { loadPdf } from "../lib/pdfjs";
import { organizePDF } from "../utils/pdfCore";
import { bytesToFile, fileToBytes } from "../utils/pdfTools";
import { CARD, GHOST_BUTTON, PRIMARY_BUTTON } from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "What can I change here?",
    answer:
      "Reorder pages, rotate them in 90° steps, and delete ones you don't need. The export contains only the pages left in the grid, in the order shown.",
  },
  {
    id: 2,
    question: "Does deleting a page remove it from my original file?",
    answer:
      "No. NexPress builds a new PDF; the file on your disk is never modified.",
  },
  {
    id: 3,
    question: "Why does a page show a rotated thumbnail?",
    answer:
      "The thumbnail applies your pending rotation so you can see the result before exporting. The original page rotation is preserved and your rotation is added on top.",
  },
];

export default function OrganizePDF() {
  useDocumentMeta(
    "Organize PDF Pages",
    "Reorder, rotate, delete and export PDF pages visually, all in your browser.",
  );

  const tool = useFileTool({ kind: "pdf" });
  const [doc, setDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFiles = (incoming) => {
    setDoc(null);
    setPages([]);
    setLoadError("");
    tool.addFiles(incoming);
  };

  useEffect(() => {
    const file = tool.file;
    let alive = true;
    if (!file) return undefined;

    (async () => {
      try {
        const loaded = await loadPdf(new Uint8Array(await file.arrayBuffer()));
        if (!alive) {
          loaded.destroy?.();
          return;
        }
        setDoc(loaded);
        setPages(
          Array.from({ length: loaded.numPages }, (_, index) => ({
            original: index,
            rotation: 0,
            keep: true,
          })),
        );
      } catch {
        if (alive) setLoadError("This PDF could not be opened for preview.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [tool.file]);

  useEffect(
    () => () => {
      doc?.destroy?.();
    },
    [doc],
  );

  const update = (original, patch) =>
    setPages((previous) =>
      previous.map((page) =>
        page.original === original ? { ...page, ...patch } : page,
      ),
    );

  const move = (index, direction) =>
    setPages((previous) => {
      const target = index + direction;
      if (target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const kept = pages.filter((page) => page.keep);

  const handleExport = () =>
    tool.run(async () => {
      const rotations = {};
      for (const page of kept) {
        if (page.rotation) rotations[page.original] = page.rotation;
      }
      const bytes = await organizePDF(await fileToBytes(tool.file), {
        order: kept.map((page) => page.original),
        rotations,
      });
      tool.setOutput(
        bytesToFile(
          bytes,
          `${tool.file.name.replace(/\.pdf$/i, "")}-organized.pdf`,
        ),
        `${kept.length} pages`,
      );
      tool.setSuccess(
        `Exported ${kept.length} page${kept.length === 1 ? "" : "s"}.`,
      );
    });

  return (
    <ToolShell
      icon={LayoutGrid}
      title="Organize Pages"
      subtitle="See every page, then reorder, rotate or remove them before exporting."
      tone="cyan"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={handleFiles}
        label="Drop a PDF to organize"
        description="thumbnails appear below"
        disabled={tool.busy}
      />

      {loadError && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
          {loadError}
        </p>
      )}

      {tool.files.length > 0 && pages.length > 0 && (
        <div className={CARD}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {kept.length} of {pages.length} pages kept · blue outline means
              rotated
            </p>
            <button
              type="button"
              onClick={() => setPages((previous) => previous.map((page) => ({ ...page, rotation: 0, keep: true })))}
              className={GHOST_BUTTON}
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pages.map((page, index) => (
              <li
                key={page.original}
                className={`rounded-lg border p-2 transition-colors ${
                  page.keep
                    ? "border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60"
                    : "border-rose-500/30 bg-rose-500/5 opacity-60"
                }`}
              >
                <div className="relative flex justify-center overflow-hidden rounded bg-white/70 dark:bg-slate-950/40 p-1">
                  <PdfPage
                    doc={doc}
                    pageNumber={page.original + 1}
                    rotation={page.rotation}
                    width={120}
                    className="h-auto max-w-full rounded"
                  />
                  <span className="absolute left-1 top-1 rounded bg-slate-900/75 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-slate-950/80 dark:text-slate-200">
                    {page.original + 1}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move page ${page.original + 1} earlier`}
                    className={GHOST_BUTTON}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => update(page.original, { rotation: (page.rotation + 90) % 360 })}
                    aria-label={`Rotate page ${page.original + 1}`}
                    className={GHOST_BUTTON}
                  >
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => update(page.original, { keep: !page.keep })}
                    aria-label={
                      page.keep
                        ? `Delete page ${page.original + 1}`
                        : `Restore page ${page.original + 1}`
                    }
                    className={GHOST_BUTTON}
                  >
                    {page.keep ? (
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === pages.length - 1}
                    aria-label={`Move page ${page.original + 1} later`}
                    className={GHOST_BUTTON}
                  >
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleExport}
              disabled={tool.busy || kept.length === 0}
              className={PRIMARY_BUTTON}
            >
              {kept.length === 0
                ? "Keep at least one page"
                : `Export ${kept.length} page${kept.length === 1 ? "" : "s"}`}
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
        downloadLabel="Download organized PDF"
      />

      {preview && (
        <PDFPreview file={preview} onClose={() => setPreview(null)} />
      )}
    </ToolShell>
  );
}
