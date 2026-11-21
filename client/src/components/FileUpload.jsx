import { useId, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { KINDS } from "../utils/pdfTools";

export default function FileUpload({
  kind = "pdf",
  multiple = false,
  onFilesSelected,
  label = "Drop your file here",
  description = "or click to browse",
  disabled = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const spec = KINDS[kind] || KINDS.pdf;

  const handleFiles = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFilesSelected(files);
    // Allow choosing the same file again.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
      }}
      className={`rounded-xl border border-dashed p-8 text-center transition-colors ${
        dragging
          ? "border-indigo-500 bg-indigo-500/5"
          : "border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-600"
      }`}
    >
      <UploadCloud
        className="mx-auto mb-4 h-12 w-12 text-indigo-600 dark:text-indigo-400"
        aria-hidden="true"
      />
      <p className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{label}</p>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{description}</p>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={spec.accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className={`inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-within:ring-2 focus-within:ring-indigo-400 ${
          disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
        }`}
      >
        Choose {multiple ? "files" : "file"}
      </label>

      <p className="mt-4 text-xs text-slate-500">
        {multiple ? "Select one or more files" : "Select a single file"} · up to{" "}
        {spec.maxSizeMB} MB · processed in your browser
      </p>
    </div>
  );
}
