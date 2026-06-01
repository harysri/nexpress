import React, { useCallback, useState } from "react";
import { Upload } from "lucide-react";

const FileUpload = ({
  accept,
  onFilesSelected,
  multiple = false,
  label,
  description,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border transition-all duration-300 ${
        dragActive
          ? "border-indigo-500/50 bg-indigo-500/5"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="text-center fade-in-up">
        <Upload className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">{label}</h3>
        <p className="text-slate-400 mb-6">{description}</p>
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold cursor-pointer hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
        >
          Choose Files
        </label>
        <p className="text-slate-400 text-sm mt-4">
          {multiple ? "Select multiple files" : "Select a single file"}
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
