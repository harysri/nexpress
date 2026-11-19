import { useState } from "react";
import { Eye, EyeOff, Lock, LockOpen, ShieldCheck } from "lucide-react";
import ToolShell from "../components/ToolShell";
import FileUpload from "../components/FileUpload";
import ToolStatus from "../components/ToolStatus";
import ResultCard from "../components/ResultCard";
import PDFPreview from "../components/PDFPreview";
import useFileTool from "../hooks/useFileTool";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { protectPDF, unlockPDF } from "../utils/pdfCore";
import { bytesToFile, fileToBytes, formatFileSize } from "../utils/pdfTools";
import {
  CARD,
  INPUT,
  LABEL,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../lib/ui";

const FAQS = [
  {
    id: 1,
    question: "How strong is the encryption?",
    answer:
      "NexPress applies the PDF standard security handler through pdf-lib, with a separate owner password. That is real password-based encryption, but it is not the same as a modern end-to-end encrypted container — use a long, unique password for anything sensitive.",
  },
  {
    id: 2,
    question: "Can I remove a password later?",
    answer:
      "Yes, on the Remove password tab, as long as you know the current password. There is no recovery path if you forget it.",
  },
  {
    id: 3,
    question: "Where is my password sent?",
    answer:
      "Nowhere. Encryption happens in this tab. The password is never stored, logged or transmitted.",
  },
  {
    id: 4,
    question: "Can I restrict printing and copying?",
    answer:
      "You can set permissions when protecting. Note that permissions are enforced by PDF viewers, not cryptography, so a determined reader can bypass them.",
  },
];

const strengthFor = (value) => {
  if (!value) return { label: "Empty", width: "0%", color: "bg-slate-700" };
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  const levels = [
    { label: "Weak", width: "25%", color: "bg-rose-500" },
    { label: "Fair", width: "50%", color: "bg-amber-500" },
    { label: "Good", width: "75%", color: "bg-blue-500" },
    { label: "Strong", width: "100%", color: "bg-emerald-500" },
  ];
  return levels[Math.max(0, score - 1)];
};

export default function ProtectPDF() {
  useDocumentMeta(
    "Password Protect PDF",
    "Add or remove a password on a PDF locally in your browser. No uploads.",
  );

  const tool = useFileTool({ kind: "pdf" });
  const [mode, setMode] = useState("protect");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [preview, setPreview] = useState(null);

  const strength = strengthFor(password);
  const protecting = mode === "protect";

  const handleSubmit = () =>
    tool.run(async () => {
      const source = tool.file;
      const bytes = await fileToBytes(source);
      const base = source.name.replace(/\.pdf$/i, "");

      if (protecting) {
        if (password.length < 6) {
          throw new Error("Use a password with at least 6 characters.");
        }
        if (password !== confirmation) {
          throw new Error("The two passwords do not match.");
        }
        const ownerPassword = Array.from(
          crypto.getRandomValues(new Uint8Array(16)),
        )
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        const protectedBytes = await protectPDF(bytes, {
          userPassword: password,
          ownerPassword,
          permissions: {
            printing: allowPrinting ? "highResolution" : false,
            copying: allowCopying,
          },
        });
        const file = bytesToFile(protectedBytes, `${base}-protected.pdf`);
        tool.setOutput(file, "Encrypted");
        tool.setSuccess(
          `Encrypted ${formatFileSize(file.size)} PDF. Store the password safely — it cannot be recovered.`,
        );
      } else {
        if (!password) throw new Error("Enter the current password.");
        const unlocked = await unlockPDF(bytes, password);
        const file = bytesToFile(unlocked, `${base}-unlocked.pdf`);
        tool.setOutput(file, "Password removed");
        tool.setSuccess("Password removed. The PDF now opens without one.");
      }
    });

  return (
    <ToolShell
      icon={Lock}
      title="Password Protection"
      subtitle="Encrypt a PDF with a password, or remove one you already know."
      tone="rose"
      faqs={FAQS}
    >
      <FileUpload
        kind="pdf"
        onFilesSelected={tool.addFiles}
        label="Drop a PDF to protect"
        description="or click to browse"
        disabled={tool.busy}
      />

      {tool.files.length > 0 && (
        <div className={CARD}>
          <div
            role="tablist"
            aria-label="Password mode"
            className="mb-5 flex gap-2 rounded-lg bg-slate-950/60 p-1"
          >
            {[
              { id: "protect", label: "Protect", icon: Lock },
              { id: "remove", label: "Remove password", icon: LockOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setMode(tab.id);
                    setPassword("");
                    setConfirmation("");
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-rose-500/15 text-rose-200"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <p className="mb-4 truncate text-sm text-slate-400">
            {tool.file.name} · {formatFileSize(tool.file.size)}
          </p>

          <div className="space-y-4">
            <div>
              <label className={LABEL} htmlFor="pdf-password">
                {protecting ? "New password" : "Current password"}
              </label>
              <div className="relative">
                <input
                  id="pdf-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  className={`${INPUT} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {protecting && password && (
                <div className="mt-2">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Strength: {strength.label}
                  </p>
                </div>
              )}
            </div>

            {protecting && (
              <>
                <div>
                  <label className={LABEL} htmlFor="pdf-password-confirm">
                    Confirm password
                  </label>
                  <input
                    id="pdf-password-confirm"
                    type={showPassword ? "text" : "password"}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    autoComplete="new-password"
                    className={INPUT}
                  />
                </div>

                <fieldset className="space-y-2">
                  <legend className={LABEL}>Permissions</legend>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={allowPrinting}
                      onChange={(event) => setAllowPrinting(event.target.checked)}
                      className="accent-rose-500"
                    />
                    Allow printing
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={allowCopying}
                      onChange={(event) => setAllowCopying(event.target.checked)}
                      className="accent-rose-500"
                    />
                    Allow copying text
                  </label>
                </fieldset>
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={tool.busy}
              className={protecting ? PRIMARY_BUTTON : SECONDARY_BUTTON}
            >
              {protecting ? (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <LockOpen className="h-4 w-4" aria-hidden="true" />
              )}
              {tool.busy
                ? "Working…"
                : protecting
                  ? "Encrypt PDF"
                  : "Remove password"}
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
        onPreview={protecting ? undefined : setPreview}
        onReset={tool.reset}
        downloadLabel="Download PDF"
      />

      {preview && (
        <PDFPreview file={preview} onClose={() => setPreview(null)} />
      )}
    </ToolShell>
  );
}
