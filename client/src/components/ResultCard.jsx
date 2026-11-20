import { Download, Eye, FileCheck2, RotateCcw } from "lucide-react";
import { downloadFile, formatFileSize } from "../utils/pdfTools";
import { GHOST_BUTTON, PRIMARY_BUTTON } from "../lib/ui";

export default function ResultCard({
  result,
  onPreview,
  onReset,
  downloadLabel = "Download",
}) {
  if (!result) return null;
  const canPreview = Boolean(onPreview) && /\.pdf$/i.test(result.name);

  return (
    <section
      aria-label="Result"
      className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <FileCheck2
            className="h-8 w-8 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {result.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatFileSize(result.size)}
              {result.meta ? ` · ${result.meta}` : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canPreview && (
            <button
              type="button"
              onClick={() => onPreview(result.file)}
              className={GHOST_BUTTON}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Preview
            </button>
          )}
          <button
            type="button"
            onClick={() => downloadFile(result.file, result.name)}
            className={PRIMARY_BUTTON}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {downloadLabel}
          </button>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Start over"
              className={GHOST_BUTTON}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
