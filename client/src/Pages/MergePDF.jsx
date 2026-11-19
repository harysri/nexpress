import { useState } from "react";
import { Layers } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import ToolStatus from "../components/ToolStatus";
import ResultCard from "../components/ResultCard";
import PDFPreview from "../components/PDFPreview";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { bytesToFile, fileToBytes, formatFileSize } from "../utils/pdfTools";
import { getPageCount, mergePDFs } from "../utils/pdfCore";
import { CARD, PRIMARY_BUTTON } from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "In what order are files merged?",
    answer:
      "Exactly the order shown in the list. Drag the rows, or use the arrow buttons, to rearrange them before merging.",
  },
  {
    id: 2,
    question: "Are bookmarks and links preserved?",
    answer:
      "Page content, fonts and images are copied intact. Document-level outlines and some interactive annotations are not copied by pdf-lib, so treat merged bookmarks as unsupported.",
  },
  {
    id: 3,
    question: "How many files can I merge?",
    answer:
      "Up to 20 PDFs of 100 MB each in one pass. The work happens in this tab, so merging hundreds of pages may take a moment.",
  },
];

export default function MergePDF() {
  useDocumentMeta(
    "Merge PDF",
    "Combine multiple PDFs into one document in any order, entirely in your browser.",
  );

  const tool = useFileTool({ kind: "pdf", multiple: true, maxFiles: 20 });
  const [preview, setPreview] = useState(null);

  const handleMerge = () =>
    tool.run(async () => {
      const sources = tool.files.map((item) => item.file);
      const list = [];
      for (const [index, file] of sources.entries()) {
        list.push(await fileToBytes(file));
        tool.setProgress(Math.round(((index + 1) / (sources.length + 1)) * 60));
      }
      const bytes = await mergePDFs(list);
      const pages = await getPageCount(bytes);
      tool.setProgress(100);
      tool.setOutput(
        bytesToFile(bytes, `merged-${sources.length}-files.pdf`),
        `${pages} pages from ${sources.length} files`,
      );
      tool.setSuccess(
        `Merged ${sources.length} files into a ${pages}-page document.`,
      );
    });

  return (
    <ToolShell
      icon={Layers}
      title="Merge PDF"
      subtitle="Combine PDFs in exactly the order you choose. Drag rows to reorder."
      tone="blue"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        multiple
        onFilesSelected={tool.addFiles}
        label="Drop PDFs to merge"
        description="add as many as you need, then arrange the order"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {tool.files.length} file{tool.files.length === 1 ? "" : "s"} ·
              drag to reorder
            </h2>
            <span className="text-xs text-slate-500">
              {formatFileSize(
                tool.files.reduce((total, item) => total + item.size, 0),
              )}{" "}
              total
            </span>
          </div>

          <FileList
            files={tool.files}
            onRemove={tool.removeFile}
            onMove={tool.moveFile}
            reorder
            draggable
          />

          <div className="mt-5">
            <button
              type="button"
              onClick={handleMerge}
              disabled={tool.busy || tool.files.length < 2}
              className={PRIMARY_BUTTON}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              {tool.busy
                ? "Merging…"
                : tool.files.length < 2
                  ? "Add at least two PDFs"
                  : `Merge ${tool.files.length} PDFs`}
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
        downloadLabel="Download merged PDF"
      />

      {preview && (
        <PDFPreview file={preview} onClose={() => setPreview(null)} />
      )}
    </ToolShell>
  );
}
