import { useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { GHOST_BUTTON } from "../lib/ui";

/**
 * Transparent signature canvas. The parent owns the ref so it can export the
 * strokes as a PNG.
 */
export default function SignaturePad({ canvasRef, onInkChange }) {
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const [hasInk, setHasInk] = useState(false);

  const pointFrom = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const start = (event) => {
    event.preventDefault();
    drawing.current = true;
    lastPoint.current = pointFrom(event);
    canvasRef.current.setPointerCapture?.(event.pointerId);
  };

  const draw = (event) => {
    if (!drawing.current) return;
    event.preventDefault();
    const context = canvasRef.current.getContext("2d");
    const point = pointFrom(event);
    context.strokeStyle = "#0f172a";
    context.lineWidth = 7;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPoint.current = point;
    if (!hasInk) {
      setHasInk(true);
      onInkChange?.(true);
    }
  };

  const end = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onInkChange?.(false);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={1200}
        height={360}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        className="h-44 w-full touch-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white"
        aria-label="Signature drawing area"
        role="img"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {hasInk ? "Signature captured." : "Draw your signature above."}
        </p>
        <button type="button" onClick={clear} className={GHOST_BUTTON}>
          <Eraser className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>
    </div>
  );
}
