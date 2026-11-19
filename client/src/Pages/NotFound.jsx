import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function NotFound() {
  useDocumentMeta(
    "Page not found",
    "That page does not exist. Browse the NexPress PDF and OCR tools instead.",
  );

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-black text-indigo-500/80">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">This page is blank</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        The link you followed does not point to a tool. Everything is still
        here — pick a tool and carry on.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/pdf-edit"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Compass className="h-4 w-4" aria-hidden="true" />
          Browse tools
        </Link>
        <Link
          to="/"
          className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
