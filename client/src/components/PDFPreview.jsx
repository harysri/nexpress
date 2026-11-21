import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { loadPdf } from "../lib/pdfjs";
import PdfPage from "./PdfPage";
import { GHOST_BUTTON } from "../lib/ui";

export default function PDFPreview({ file, onClose }) {
  const [doc, setDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const closeRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const loaded = await loadPdf(new Uint8Array(await file.arrayBuffer()));
        if (alive) setDoc(loaded);
        else loaded.destroy?.();
      } catch {
        if (alive) setError("This PDF could not be previewed.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [file]);

  useEffect(
    () => () => {
      doc?.destroy?.();
    },
    [doc],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const total = doc?.numPages ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${file.name}`}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {file.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {error || (total ? `Page ${pageNumber} of ${total}` : "Loading…")}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className={GHOST_BUTTON}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950/60">
          {error ? (
            <p className="py-16 text-center text-sm text-rose-700 dark:text-rose-300">{error}</p>
          ) : (
            <div className="flex justify-center">
              <PdfPage
                doc={doc}
                pageNumber={pageNumber}
                width={Math.round(620 * zoom)}
                className="h-auto rounded shadow-xl"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((value) => Math.max(value - 1, 1))}
              disabled={pageNumber <= 1}
              aria-label="Previous page"
              className={GHOST_BUTTON}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-[70px] text-center text-sm text-slate-600 dark:text-slate-300 tabular-nums">
              {pageNumber} / {total ?? "–"}
            </span>
            <button
              type="button"
              onClick={() =>
                setPageNumber((value) => Math.min(value + 1, total || value))
              }
              disabled={!total || pageNumber >= total}
              aria-label="Next page"
              className={GHOST_BUTTON}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(value - 0.2, 0.6))}
              aria-label="Zoom out"
              className={GHOST_BUTTON}
            >
              <ZoomOut className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-[46px] text-center text-sm text-slate-600 dark:text-slate-300 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(value + 0.2, 2.4))}
              aria-label="Zoom in"
              className={GHOST_BUTTON}
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
