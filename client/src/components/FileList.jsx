import { useState } from "react";
import { ArrowDown, ArrowUp, FileText, GripVertical, X } from "lucide-react";
import { formatFileSize } from "../utils/pdfTools";
import { GHOST_BUTTON } from "../lib/ui";

export default function FileList({
  files,
  onRemove,
  onMove,
  reorder = false,
  draggable = false,
  extra,
}) {
  const [dragging, setDragging] = useState(null);
  if (!files.length) return null;

  return (
    <ul className="space-y-2">
      {files.map((item, index) => (
        <li
          key={item.id}
          draggable={draggable}
          onDragStart={
            draggable
              ? (event) => {
                  setDragging(index);
                  event.dataTransfer.effectAllowed = "move";
                }
              : undefined
          }
          onDragOver={draggable ? (event) => event.preventDefault() : undefined}
          onDrop={
            draggable
              ? (event) => {
                  event.preventDefault();
                  if (dragging !== null) onMove?.(dragging, index);
                  setDragging(null);
                }
              : undefined
          }
          onDragEnd={draggable ? () => setDragging(null) : undefined}
          className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
            dragging === index
              ? "border-indigo-500/60 bg-indigo-500/5"
              : "border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50"
          }`}
        >
          {draggable && (
            <GripVertical
              className="h-4 w-4 shrink-0 cursor-grab text-slate-500"
              aria-hidden="true"
            />
          )}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {index + 1}
          </span>
          <FileText
            className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-xs text-slate-500">
              {formatFileSize(item.size)}
              {extra ? ` · ${extra(item)}` : ""}
            </p>
          </div>

          {reorder && onMove && (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onMove(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${item.name} up`}
                className={GHOST_BUTTON}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, index + 1)}
                disabled={index === files.length - 1}
                aria-label={`Move ${item.name} down`}
                className={GHOST_BUTTON}
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
              className={GHOST_BUTTON}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
