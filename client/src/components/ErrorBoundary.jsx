import { Component } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main
        role="alert"
        className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center"
      >
        <AlertTriangle className="mb-5 h-10 w-10 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Something broke on this page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Your files are processed locally, so nothing was uploaded. Reload the
          page to start again.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reload
          </button>
          <Link
            to="/pdf-edit"
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:border-slate-500"
          >
            Back to tools
          </Link>
        </div>
      </main>
    );
  }
}
