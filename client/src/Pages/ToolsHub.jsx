import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, WifiOff, Zap } from "lucide-react";
import { TOOLS, TONES } from "../data/tools";
import useDocumentMeta from "../hooks/useDocumentMeta";

const CATEGORIES = ["Optimize", "Organize", "Secure", "Edit", "Convert"];

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    text: "Files are read into memory and never uploaded. There is no backend to leak them.",
  },
  {
    icon: Zap,
    title: "Instant processing",
    text: "pdf.js and pdf-lib run in your tab, so there is no upload or download queue.",
  },
  {
    icon: WifiOff,
    title: "Installable",
    text: "The app shell, PDF engine and its worker are cached, so PDF tools keep working offline.",
  },
];

export default function ToolsHub() {
  useDocumentMeta(
    "All PDF & OCR tools",
    "Eleven browser-based PDF tools: compress, merge, organize, split, protect, watermark, sign, extract images, convert and OCR.",
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32">
        <header className="mb-14 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Pick a tool
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
            Eleven focused tools for PDFs and images. Every one runs locally in
            your browser.
          </p>
        </header>

        {CATEGORIES.map((category) => {
          const tools = TOOLS.filter((tool) => tool.category === category);
          if (!tools.length) return null;
          return (
            <section key={category} className="mb-12">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {category}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const tone = TONES[tool.tone] || TONES.indigo;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className={`group rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${tone.border}`}
                    >
                      <div
                        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg ${tone.bg} ${tone.text} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="mb-2 flex items-center justify-between gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {tool.name}
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                          aria-hidden="true"
                        />
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {tool.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="mt-16 grid gap-4 border-t border-slate-200 dark:border-slate-800 pt-12 sm:grid-cols-3">
          {GUARANTEES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/30 p-5">
                <Icon className="mb-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h2>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
