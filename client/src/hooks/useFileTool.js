import { useCallback, useEffect, useRef, useState } from "react";
import { validateFiles } from "../utils/pdfTools";

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

/**
 * Shared state for every tool page: uploaded files (with preview URLs that are
 * always revoked), busy/progress, the output file and error/success messages.
 *
 * Side effects (object URL revocation) deliberately live outside setState
 * updaters: React may invoke updaters twice in StrictMode.
 */
export default function useFileTool({
  kind = "pdf",
  multiple = false,
  maxFiles = 50,
  maxSizeMB,
} = {}) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const filesRef = useRef([]);
  const resultRef = useRef(null);

  filesRef.current = files;
  resultRef.current = result;

  useEffect(
    () => () => {
      filesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
      if (resultRef.current?.url) URL.revokeObjectURL(resultRef.current.url);
    },
    [],
  );

  const clearResult = useCallback(() => {
    if (resultRef.current?.url) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setResult(null);
  }, []);

  const addFiles = useCallback(
    (incoming) => {
      const { validFiles, errors } = validateFiles(incoming, kind, maxSizeMB);
      if (errors.length) {
        setError(errors[0]);
        return;
      }

      const mapped = validFiles.map((file) => ({
        id: newId(),
        file,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      }));

      let next;
      if (multiple) {
        next = [...filesRef.current, ...mapped];
      } else {
        filesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
        next = mapped.slice(0, 1);
      }

      setError("");
      setSuccess("");
      clearResult();

      if (next.length > maxFiles) {
        next.slice(maxFiles).forEach((item) => URL.revokeObjectURL(item.url));
        next = next.slice(0, maxFiles);
        setError(`Only the first ${maxFiles} files are kept.`);
      }

      setFiles(next);
    },
    [kind, maxSizeMB, maxFiles, multiple, clearResult],
  );

  const removeFile = useCallback(
    (id) => {
      const target = filesRef.current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      setFiles((previous) => previous.filter((item) => item.id !== id));
      clearResult();
      setSuccess("");
    },
    [clearResult],
  );

  const moveFile = useCallback((from, to) => {
    setFiles((previous) => {
      if (from === to || from < 0 || to < 0) return previous;
      const next = [...previous];
      const [moved] = next.splice(from, 1);
      if (!moved) return previous;
      next.splice(Math.min(to, next.length), 0, moved);
      return next;
    });
  }, []);

  const clearFiles = useCallback(() => {
    filesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    setFiles([]);
  }, []);

  const setOutput = useCallback((file, meta) => {
    if (resultRef.current?.url) URL.revokeObjectURL(resultRef.current.url);
    const next = {
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      meta,
    };
    resultRef.current = next;
    setResult(next);
  }, []);

  const reset = useCallback(() => {
    filesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    if (resultRef.current?.url) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = null;
    setFiles([]);
    setResult(null);
    setError("");
    setSuccess("");
    setProgress(0);
  }, []);

  const run = useCallback(async (task) => {
    setBusy(true);
    setError("");
    setSuccess("");
    setProgress(0);
    try {
      await task();
    } catch (caught) {
      setError(caught?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }, []);

  return {
    files,
    file: files[0]?.file,
    addFiles,
    removeFile,
    moveFile,
    clearFiles,
    busy,
    progress,
    setProgress,
    result,
    setOutput,
    reset,
    error,
    success,
    setError,
    setSuccess,
    run,
  };
}
