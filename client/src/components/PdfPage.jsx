import { useEffect, useRef } from "react";

/**
 * Renders a single pdf.js page into a canvas at a target CSS width.
 * `rotation` is added on top of the page's own rotation.
 */
export default function PdfPage({
  doc,
  pageNumber,
  width = 160,
  rotation = 0,
  className = "",
  onRendered,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!doc) return undefined;
    let cancelled = false;
    let task;

    (async () => {
      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = width / base.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const angle = (page.rotate + rotation) % 360;
      const viewport = page.getViewport({ scale: scale * dpr, rotation: angle });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      canvas.style.width = `${Math.round(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.round(viewport.height / dpr)}px`;

      task = page.render({ canvas, viewport });
      await task.promise;
      if (!cancelled) onRendered?.();
    })().catch(() => {});

    return () => {
      cancelled = true;
      task?.cancel?.();
    };
  }, [doc, pageNumber, width, rotation, onRendered]);

  return (
    <canvas
      ref={canvasRef}
      className={`block bg-white ${className}`}
      aria-hidden="true"
    />
  );
}
