import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react";

// ✅ CORRECT worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFPreview = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  if (!file || !url) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-white font-bold">{file.name}</h3>
            <p className="text-sm text-slate-400">
              Page {pageNumber} of {numPages ?? "--"}
            </p>
          </div>
          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-auto flex justify-center p-4">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            error={<p className="text-red-400">Invalid PDF</p>}
            loading={<p className="text-white">Loading PDF…</p>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-white/10 flex justify-between">
          <div className="flex gap-3">
            <button onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}>
              <ChevronLeft className="text-white" />
            </button>
            <span className="text-white">
              {pageNumber}/{numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
            >
              <ChevronRight className="text-white" />
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}>
              <ZoomOut className="text-white" />
            </button>
            <span className="text-white">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((s) => Math.min(s + 0.25, 3))}>
              <ZoomIn className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
