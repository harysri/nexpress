import { useRef, useState } from "react";
import { PenTool } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import ResultCard from "../components/ResultCard";
import PDFPreview from "../components/PDFPreview";
import SignaturePad from "../components/SignaturePad";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { getPageCount, signPDF } from "../utils/pdfCore";
import {
  bytesToFile,
  fileToBytes,
  trimCanvasToBlob,
} from "../utils/pdfTools";
import { CARD, INPUT, LABEL, PRIMARY_BUTTON, SECTION_TITLE } from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "Is this a legally binding e-signature?",
    answer:
      "It is a visual signature embedded as an image. NexPress does not add a cryptographic certificate or audit trail, so it is fine for internal documents but not a qualified digital signature.",
  },
  {
    id: 2,
    question: "Where is the signature placed?",
    answer:
      "At the bottom of the page you choose, sized relative to the page width. Sign the last page for contracts, or all pages for initialled documents.",
  },
  {
    id: 3,
    question: "Is my signature stored?",
    answer:
      "No. It lives in the canvas until you export, and it is written straight into the new PDF. Nothing is uploaded and nothing is saved after you leave the page.",
  },
];

export default function SignPDF() {
  useDocumentMeta(
    "Sign PDF",
    "Draw a signature and place it on any or every page of a PDF, entirely offline.",
  );

  const tool = useFileTool({ kind: "pdf" });
  const signatureRef = useRef(null);
  const [hasInk, setHasInk] = useState(false);
  const [scope, setScope] = useState("last");
  const [placement, setPlacement] = useState("right");
  const [widthRatio, setWidthRatio] = useState(0.26);
  const [preview, setPreview] = useState(null);

  const handleSign = () =>
    tool.run(async () => {
      if (!hasInk) throw new Error("Draw your signature first.");
      const pngBytes = await trimCanvasToBlob(signatureRef.current);
      const source = await fileToBytes(tool.file);
      const total = await getPageCount(source);
      const pageIndex =
        scope === "all" ? -1 : scope === "last" ? Math.max(total - 1, 0) : 0;
      const xRatio =
        placement === "left" ? 0.3 : placement === "center" ? 0.5 : 0.7;

      const bytes = await signPDF(source, {
        pngBytes,
        pageIndex,
        widthRatio,
        xRatio,
        yRatio: 0.07,
      });

      tool.setOutput(
        bytesToFile(bytes, `${tool.file.name.replace(/\.pdf$/i, "")}-signed.pdf`),
        scope === "all"
          ? `signature on ${total} pages`
          : scope === "last"
            ? "signature on last page"
            : "signature on first page",
      );
      tool.setSuccess(
        `Signature added to ${scope === "all" ? "every page" : scope === "last" ? "the last page" : "the first page"}.`,
      );
    });

  return (
    <ToolShell
      icon={PenTool}
      title="Sign PDF"
      subtitle="Draw a signature once, then stamp it onto the pages you choose."
      tone="pink"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={tool.addFiles}
        label="Drop the PDF to sign"
        description="or click to browse"
        disabled={tool.busy}
      />

      <div className={CARD}>
        <h2 className={SECTION_TITLE}>Your signature</h2>
        <SignaturePad canvasRef={signatureRef} onInkChange={setHasInk} />
      </div>

      {tool.files.length > 0 && (
        <div className={CARD}>
          <p className="mb-5 truncate text-sm text-slate-500 dark:text-slate-400">{tool.file.name}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="sign-scope">
                Pages
              </label>
              <select
                id="sign-scope"
                value={scope}
                onChange={(event) => setScope(event.target.value)}
                className={INPUT}
              >
                <option value="last">Last page</option>
                <option value="first">First page</option>
                <option value="all">Every page</option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="sign-placement">
                Horizontal placement
              </label>
              <select
                id="sign-placement"
                value={placement}
                onChange={(event) => setPlacement(event.target.value)}
                className={INPUT}
              >
                <option value="right">Right</option>
                <option value="center">Centre</option>
                <option value="left">Left</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className={LABEL} htmlFor="sign-size">
              Signature size — {Math.round(widthRatio * 100)}% of page width
            </label>
            <input
              id="sign-size"
              type="range"
              min="0.1"
              max="0.6"
              step="0.02"
              value={widthRatio}
              onChange={(event) => setWidthRatio(Number(event.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSign}
              disabled={tool.busy || !hasInk}
              className={PRIMARY_BUTTON}
            >
              <PenTool className="h-4 w-4" aria-hidden="true" />
              {tool.busy
                ? "Signing…"
                : hasInk
                  ? "Sign PDF"
                  : "Draw your signature first"}
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
        downloadLabel="Download signed PDF"
      />

      {preview && (
        <PDFPreview file={preview} onClose={() => setPreview(null)} />
      )}
    </ToolShell>
  );
}
