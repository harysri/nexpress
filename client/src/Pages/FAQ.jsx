import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  Search,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";
import useDocumentMeta from "../hooks/useDocumentMeta";

const CATEGORIES = {
  "Getting started": [
    {
      id: "what-is-nexpress",
      question: "What is NexPress?",
      answer:
        "NexPress is an all-in-one PDF and image toolkit. It can compress, merge, organize, split, protect, watermark, sign, convert and OCR documents directly in your browser.",
    },
    {
      id: "cost",
      question: "Is NexPress free to use?",
      answer: "Yes. NexPress tools are free to use, with no account required.",
    },
    {
      id: "account",
      question: "Do I need to create an account?",
      answer:
        "No. Select a tool, add your files and process them. There is no account or sign-in step.",
    },
  ],
  Privacy: [
    {
      id: "privacy",
      question: "Are my files uploaded to a server?",
      answer:
        "No. PDF and image processing runs locally in your browser. NexPress does not send your document contents to a backend.",
    },
    {
      id: "storage",
      question: "Does NexPress store or keep my files?",
      answer:
        "No server copy is created. Files remain in your device's browser memory for the current session and browser object URLs are cleaned up when the tool is reset or the page is closed.",
    },
    {
      id: "password",
      question: "Where is my PDF password sent?",
      answer:
        "Nowhere. The password is used locally for PDF encryption or unlocking and is not stored or transmitted.",
    },
  ],
  "Formats & limits": [
    {
      id: "pdf-formats",
      question: "Which PDF files can I use?",
      answer:
        "NexPress accepts standard .pdf files. Processing encrypted PDFs is not guaranteed until you remove or unlock the password first.",
    },
    {
      id: "image-formats",
      question: "Which image formats are supported?",
      answer:
        "JPG, JPEG, PNG, GIF, WebP and BMP are supported. When creating a PDF, GIF animations are added as a static frame.",
    },
    {
      id: "size-limit",
      question: "Is there a file size limit?",
      answer:
        "PDF files can be up to 100 MB each. Image files can be up to 50 MB each. Processing large documents is limited by available device memory.",
    },
    {
      id: "file-count",
      question: "How many files can I process at once?",
      answer:
        "Merge and Images to PDF support up to 20 PDFs or 50 images respectively, depending on the tool. Split and Extract Images work with one source document at a time.",
    },
  ],
  "PDF tools": [
    {
      id: "compress",
      question: "How does PDF compression work?",
      answer:
        "Low compression cleans the PDF structure while preserving selectable text. Medium, High and Aggressive render pages as JPEG images and choose the smallest resulting file.",
    },
    {
      id: "not-smaller",
      question: "Why did compression not reduce my PDF?",
      answer:
        "The PDF may already be optimized or contain mostly efficiently encoded images. NexPress keeps the cleanest result and does not return a larger file.",
    },
    {
      id: "merge",
      question: "How do I merge PDFs?",
      answer:
        "Open Merge PDF, add two or more PDFs, drag the file list into the desired order, and start the merge.",
    },
    {
      id: "organize",
      question: "What can I do with Organize Pages?",
      answer:
        "You can preview a PDF, reorder pages, rotate pages left or right, remove unwanted pages and export the result.",
    },
    {
      id: "split",
      question: "How do I split a PDF?",
      answer:
        "Enter page ranges such as 1-3, 5, 8-10. NexPress creates each range as a separate PDF and offers individual downloads or a ZIP.",
    },
    {
      id: "watermark",
      question: "Can I add page numbers and watermarks?",
      answer:
        "Yes. Watermark & Page Numbers lets you add text across pages and control page-number position and formatting.",
    },
    {
      id: "sign",
      question: "Can I place a signature on only one page?",
      answer:
        "Yes. Draw or add your signature, choose a page, and place or resize it before exporting. You can also apply it to every page.",
    },
  ],
  "Images & OCR": [
    {
      id: "images-to-pdf",
      question: "How do I convert images to PDF?",
      answer:
        "Open Images to PDF, select JPG, PNG, GIF, WebP or BMP files, arrange them if needed and create the PDF.",
    },
    {
      id: "pdf-to-images",
      question: "What formats can PDF pages become?",
      answer:
        "PDF pages can be rendered as JPG or PNG. Choose the output format and resolution, then download pages individually or as a ZIP.",
    },
    {
      id: "extract-images",
      question: "Can I extract every image from a PDF?",
      answer:
        "Yes. Open Extract Images, process the PDF and download embedded images individually or together in a ZIP.",
    },
    {
      id: "ocr-languages",
      question: "Which OCR languages are supported?",
      answer:
        "NexPress includes English, French, German, Spanish, Italian, Portuguese, Russian, Hindi, Malayalam, Korean, Japanese and Simplified Chinese.",
    },
    {
      id: "ocr-accuracy",
      question: "Why did OCR read my text incorrectly?",
      answer:
        "OCR works best with sharp, high-contrast, correctly oriented text. Handwriting, decorative fonts, blur, shadows and low resolution can reduce accuracy.",
    },
  ],
  "Browser & downloads": [
    {
      id: "browsers",
      question: "Which browsers are supported?",
      answer:
        "Use a current desktop or mobile version of Chrome, Edge, Firefox or Safari. Keep the browser updated for the best PDF rendering and memory support.",
    },
    {
      id: "offline",
      question: "Does NexPress work offline?",
      answer:
        "After the app and required PDF engine resources have been cached by the browser, supported tools can continue to work offline. Large language OCR models may need to download once.",
    },
    {
      id: "download",
      question: "Where does my downloaded file go?",
      answer:
        "Your browser sends the result to its configured Downloads folder. If a download is blocked, allow downloads for the NexPress site and try again.",
    },
    {
      id: "error",
      question: "A tool failed or showed an error. What should I do?",
      answer:
        "Check that the file is not damaged or password-protected, refresh the page and try a smaller file. Closing unused browser tabs can also free memory for large PDFs.",
    },
  ],
};

const CATEGORY_ICONS = {
  "Getting started": CircleHelp,
  Privacy: ShieldCheck,
  "Formats & limits": Wrench,
  "PDF tools": Zap,
  "Images & OCR": Search,
  "Browser & downloads": LockKeyhole,
};

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(null);

  useDocumentMeta(
    "Frequently Asked Questions",
    "Answers about NexPress PDF tools, privacy, file limits, formats, compression, OCR, passwords, downloads and browser support.",
  );

  const allItems = useMemo(
    () =>
      Object.entries(CATEGORIES).flatMap(([group, items]) =>
        items.map((item) => ({ ...item, group })),
      ),
    [],
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "nexpress-faq-schema";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: allItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [allItems]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = allItems.filter((item) => {
    const matchesCategory = category === "All" || item.group === category;
    const matchesQuery =
      !normalizedQuery ||
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answer.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-700 dark:bg-slate-950 dark:text-slate-200">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/25 blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-300/20 blur-[120px] dark:bg-cyan-900/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <CircleHelp className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500 dark:text-slate-400">
            Find answers about NexPress tools, privacy, formats, downloads and
            troubleshooting.
          </p>

          <label className="relative mx-auto mt-8 block max-w-2xl">
            <span className="sr-only">Search frequently asked questions</span>
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for an answer..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
            />
          </label>
        </header>

        <div
          className="mb-8 flex flex-wrap justify-center gap-2"
          aria-label="FAQ categories"
        >
          {["All", ...Object.keys(CATEGORIES)].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                category === name
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white/70 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-indigo-400"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const expanded = open === item.id;
              const Icon = CATEGORY_ICONS[item.group] || CircleHelp;
              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`faq-${item.id}`}
                    onClick={() => setOpen(expanded ? null : item.id)}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 sm:px-5 sm:py-5 dark:text-white dark:hover:bg-slate-800/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="flex-1">{item.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    id={`faq-${item.id}`}
                    hidden={!expanded}
                    className="border-t border-slate-100 px-4 pb-5 pt-4 text-sm leading-7 text-slate-500 sm:px-5 sm:pl-[4.25rem] dark:border-slate-800 dark:text-slate-400"
                  >
                    {item.answer}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white">
              No answers found
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try a different search or choose “All” categories.
            </p>
          </div>
        )}

        <aside className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white/70 p-6 text-center sm:flex-row sm:text-left dark:border-slate-800 dark:bg-slate-900/50">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Need to process a document?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Browse all eleven browser-based PDF and OCR tools.
            </p>
          </div>
          <Link
            to="/pdf-edit"
            className="shrink-0 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            View all tools
          </Link>
        </aside>
      </div>
    </main>
  );
}
