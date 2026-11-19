import { useState } from "react";
import { Stamp } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import ResultCard from "../components/ResultCard";
import PDFPreview from "../components/PDFPreview";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { pageNumbersPDF, watermarkPDF } from "../utils/pdfCore";
import { bytesToFile, fileToBytes, formatFileSize } from "../utils/pdfTools";
import {
  CARD,
  INPUT,
  LABEL,
  PRIMARY_BUTTON,
  SECTION_TITLE,
} from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "Is the watermark removable?",
    answer:
      "The text is drawn into the page content stream, so it is baked into the PDF rather than added as a movable annotation. It is not a security feature and a determined editor can still alter the file.",
  },
  {
    id: 2,
    question: "Can I add page numbers only?",
    answer:
      "Yes. Clear the watermark text and enable page numbers, or use both together — the numbering starts at 1 by default and follows the exported order.",
  },
  {
    id: 3,
    question: "Why does the watermark look faint on some pages?",
    answer:
      "Opacity is applied uniformly; very dark pages can make grey text hard to see. Raise the size or opacity, or use a light document instead.",
  },
];

const POSITIONS = [
  { value: "bottom-center", label: "Bottom centre" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-center", label: "Top centre" },
  { value: "top-left", label: "Top left" },
];

export default function WatermarkPDF() {
  useDocumentMeta(
    "Watermark PDF & Add Page Numbers",
    "Stamp text watermarks and page numbers onto a PDF locally in your browser.",
  );

  const tool = useFileTool({ kind: "pdf" });
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.22);
  const [size, setSize] = useState(46);
  const [rotation, setRotation] = useState(45);
  const [firstPageOnly, setFirstPageOnly] = useState(false);
  const [addNumbers, setAddNumbers] = useState(false);
  const [position, setPosition] = useState("bottom-center");
  const [preview, setPreview] = useState(null);

  const handleApply = () =>
    tool.run(async () => {
      const hasText = Boolean(text.trim());
      if (!hasText && !addNumbers) {
        throw new Error("Add watermark text or enable page numbers.");
      }

      let bytes = await fileToBytes(tool.file);
      const applied = [];

      if (hasText) {
        bytes = await watermarkPDF(bytes, {
          text,
          opacity,
          size,
          rotation,
          firstPageOnly,
        });
        applied.push("watermark");
      }
      if (addNumbers) {
        bytes = await pageNumbersPDF(bytes, { position });
        applied.push("page numbers");
      }

      const file = bytesToFile(
        bytes,
        `${tool.file.name.replace(/\.pdf$/i, "")}-stamped.pdf`,
      );
      tool.setOutput(
        file,
        `${applied.join(" + ")} · ${formatFileSize(file.size)}`,
      );
      tool.setSuccess(`Applied ${applied.join(" and ")}.`);
    });

  return (
    <ToolShell
      icon={Stamp}
      title="Watermark & Page Numbers"
      subtitle="Stamp a repeating text watermark and add page numbering in one pass."
      tone="orange"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={tool.addFiles}
        label="Drop a PDF to stamp"
        description="or click to browse"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <p className="mb-5 truncate text-sm text-slate-400">
            {tool.file.name} · {formatFileSize(tool.file.size)}
          </p>

          <div className="space-y-5">
            <div>
              <label className={LABEL} htmlFor="watermark-text">
                Watermark text
              </label>
              <input
                id="watermark-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Leave empty to skip the watermark"
                className={INPUT}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="watermark-opacity">
                  Opacity — {Math.round(opacity * 100)}%
                </label>
                <input
                  id="watermark-opacity"
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.01"
                  value={opacity}
                  onChange={(event) => setOpacity(Number(event.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="watermark-size">
                  Font size — {size}pt
                </label>
                <input
                  id="watermark-size"
                  type="range"
                  min="12"
                  max="120"
                  step="2"
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="watermark-rotation">
                  Angle
                </label>
                <select
                  id="watermark-rotation"
                  value={rotation}
                  onChange={(event) => setRotation(Number(event.target.value))}
                  className={INPUT}
                >
                  <option value={0}>Horizontal</option>
                  <option value={45}>Diagonal up</option>
                  <option value={-45}>Diagonal down</option>
                  <option value={90}>Vertical</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={firstPageOnly}
                  onChange={(event) => setFirstPageOnly(event.target.checked)}
                  className="accent-orange-500"
                />
                First page only
              </label>
            </div>

            <fieldset className="border-t border-slate-800 pt-5">
              <legend className={SECTION_TITLE}>Page numbers</legend>
              <label className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={addNumbers}
                  onChange={(event) => setAddNumbers(event.target.checked)}
                  className="accent-orange-500"
                />
                Add “{`{page} / {total}`}” to every page
              </label>
              {addNumbers && (
                <div>
                  <label className={LABEL} htmlFor="watermark-position">
                    Position
                  </label>
                  <select
                    id="watermark-position"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className={INPUT}
                  >
                    {POSITIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </fieldset>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleApply}
              disabled={tool.busy}
              className={PRIMARY_BUTTON}
            >
              <Stamp className="h-4 w-4" aria-hidden="true" />
              {tool.busy ? "Applying…" : "Apply"}
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
        downloadLabel="Download stamped PDF"
      />

      {preview && (
        <PDFPreview file={preview} onClose={() => setPreview(null)} />
      )}
    </ToolShell>
  );
}
