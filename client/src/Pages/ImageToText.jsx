import { useState } from "react";
import { Check, Copy, Download, Type } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import {
  copyToClipboard,
  downloadFile,
  formatFileSize,
  performOCR,
  SUPPORTED_LANGUAGES,
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
    question: "Which languages are supported?",
    answer:
      "Twelve OCR models are bundled in the picker, including English, French, German, Spanish, Russian, Hindi, Malayalam, Korean, Japanese and Simplified Chinese.",
  },
  {
    id: 2,
    question: "Why is the first run slow?",
    answer:
      "Tesseract downloads the trained language model the first time you use a language, then reuses your browser cache. Recognition itself runs locally.",
  },
  {
    id: 3,
    question: "How accurate is it?",
    answer:
      "Clean, high-contrast scans work well. Handwriting, stylised fonts and skewed photos produce errors — edit the text before relying on it. The confidence score is a rough guide, not a guarantee.",
  },
];

export default function ImageToText() {
  useDocumentMeta(
    "Image to Text (OCR)",
    "Extract editable text from images with local OCR in twelve languages.",
  );

  const tool = useFileTool({ kind: "image" });
  const [language, setLanguage] = useState("eng");
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleRecognise = () =>
    tool.run(async () => {
      setText("");
      setConfidence(null);
      const result = await performOCR(
        tool.file,
        tool.setProgress,
        language,
      );
      setText(result.text.trim());
      setConfidence(result.confidence);
      const characters = result.text.trim().length;
      if (!characters) {
        tool.setSuccess(
          "No text was recognised. Try a sharper image or another language.",
        );
      } else {
        tool.setSuccess(`Recognised ${characters} characters.`);
      }
    });

  const handleCopy = async () => {
    if (await copyToClipboard(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const base = (tool.file?.name || "ocr").replace(/\.[^.]+$/, "");
    downloadFile(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
      `${base}.txt`,
    );
  };

  const resetAll = () => {
    tool.reset();
    setText("");
    setConfidence(null);
  };

  return (
    <ToolShell
      icon={Type}
      title="Image to Text (OCR)"
      subtitle="Read text out of a photo or scan. The result is editable before you copy it."
      tone="indigo"
      faqs={FAQS}
    >
      <FileUpload
        kind="image"
        onFilesSelected={tool.addFiles}
        label="Drop an image to read"
        description="JPG, PNG, GIF, WebP or BMP"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="flex max-h-64 items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950/50 p-2">
                <img
                  src={tool.files[0].url}
                  alt={tool.file.name}
                  className="max-h-60 max-w-full object-contain"
                />
              </div>
              <p className="mt-2 truncate text-xs text-slate-500">
                {tool.file.name} · {formatFileSize(tool.file.size)}
              </p>
            </div>

            <div>
              <label className={LABEL} htmlFor="ocr-language">
                Language
              </label>
              <select
                id="ocr-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className={INPUT}
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleRecognise}
                disabled={tool.busy}
                className={`${PRIMARY_BUTTON} mt-4`}
              >
                <Type className="h-4 w-4" aria-hidden="true" />
                {tool.busy ? "Reading…" : "Extract text"}
              </button>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                The language model is fetched once, then cached by your browser.
                Recognition runs locally.
              </p>
            </div>
          </div>
        </div>
      )}

      <ToolStatus
        error={tool.error}
        success={tool.success}
        busy={tool.busy}
        progress={tool.progress}
      />

      {(text || confidence !== null) && (
        <section className={CARD} aria-label="Extracted text">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Extracted text
              {confidence !== null && (
                <span className="ml-2 normal-case tracking-normal text-slate-500">
                  confidence {Math.round(confidence)}%
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!text}
                className={GHOST_BUTTON}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!text}
                className={GHOST_BUTTON}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                .txt
              </button>
            </div>
          </div>

          <label className="sr-only" htmlFor="ocr-output">
            Recognised text
          </label>
          <textarea
            id="ocr-output"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={10}
            placeholder="No text recognised yet."
            className={`${INPUT} font-mono text-xs leading-relaxed`}
          />

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
