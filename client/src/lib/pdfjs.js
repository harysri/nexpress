import * as pdfjsLib from "pdfjs-dist";
// Vite bundles the worker as a local asset (no unpkg CDN dependency),
// which is what makes offline/PWA use possible.
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Load a PDF from bytes. The buffer is copied because pdf.js transfers
 * ownership of the data it receives.
 */
export const loadPdf = (data) =>
  pdfjsLib.getDocument({
    data: data instanceof Uint8Array ? data.slice() : data,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;

export { pdfjsLib };
