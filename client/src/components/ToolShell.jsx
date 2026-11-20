import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { TONES } from "../data/tools";

function Faq({ items }) {
  const [open, setOpen] = useState(null);

  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">
        Frequently asked questions
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const expanded = open === item.id;
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40"
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`faq-${item.id}`}
                onClick={() => setOpen(expanded ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
              >
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                id={`faq-${item.id}`}
                hidden={!expanded}
                className="px-5 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ToolShell({
  icon: Icon,
  title,
  subtitle,
  tone = "indigo",
  faqs = [],
  children,
}) {
  const styles = TONES[tone] || TONES.indigo;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-200">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/25 dark:bg-indigo-900/20 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-300/25 dark:bg-blue-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <Link
          to="/pdf-edit"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          All tools
        </Link>

        <header className="mb-10 text-center">
          {Icon && (
            <div
              className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border ${styles.chip}`}
            >
              <Icon className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </header>

        <div className="space-y-6">{children}</div>

        {faqs.length > 0 && <Faq items={faqs} />}
      </div>
    </main>
  );
}
