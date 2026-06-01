import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileImage,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  Image as ImageIcon,
  Trash2,
  Grid3x3,
  List,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MousePointerClick,
  Maximize2,
  Move,
} from "lucide-react";
import {
  imagesToPDF,
  formatFileSize,
  validateFiles,
  downloadFile,
} from "../utils/pdfUtils";
import FileUpload from "../components/FileUpload";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ImagesToPDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [layout, setLayout] = useState("portrait");
  const [openFAQ, setOpenFAQ] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "What image formats are supported?",
      answer:
        "We support all common image formats: JPG, JPEG, PNG, GIF, WebP, BMP, and TIFF. Images are converted to PDF while preserving quality.",
    },
    {
      id: 2,
      question: "How are images arranged in the PDF?",
      answer:
        "Images are arranged in the order you upload them. You can reorder them by drag-and-drop in grid view or list view.",
    },
    {
      id: 3,
      question: "What's the maximum file size per image?",
      answer:
        "Each image can be up to 50MB. For optimal performance, we recommend images under 10MB each.",
    },
    {
      id: 4,
      question: "Can I adjust the page layout?",
      answer:
        "Yes! You can choose between Portrait (vertical) and Landscape (horizontal) layouts. The layout applies to all pages in the PDF.",
    },
    {
      id: 5,
      question: "Will image quality be preserved?",
      answer:
        "Yes, images are embedded in the PDF at their original resolution. No compression or quality loss occurs during conversion.",
    },
    {
      id: 6,
      question: "How many images can I convert at once?",
      answer:
        "You can convert up to 50 images at once. For more images, consider splitting them into multiple batches.",
    },
  ];

  const handleFiles = useCallback((files) => {
    const { validFiles, errors } = validateFiles(
      files,
      ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
      50,
    );

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    const filesWithPreview = validFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      id: Math.random().toString(36).substr(2, 9),
      previewUrl: URL.createObjectURL(file),
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...filesWithPreview]);
    setError("");
  }, []);

  const removeFile = (id) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const moveFile = (dragIndex, hoverIndex) => {
    const draggedItem = uploadedFiles[dragIndex];
    const newFiles = [...uploadedFiles];
    newFiles.splice(dragIndex, 1);
    newFiles.splice(hoverIndex, 0, draggedItem);
    setUploadedFiles(newFiles);
  };

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const imageFiles = uploadedFiles.map((f) => f.file);
      const pdfFile = await imagesToPDF(imageFiles, layout);

      setProcessedFile({
        file: pdfFile,
        name: `images_converted_${new Date().getTime()}.pdf`,
        size: pdfFile.size,
        previewUrl: URL.createObjectURL(pdfFile),
      });

      setSuccess(
        `Successfully created PDF with ${uploadedFiles.length} images!`,
      );
    } catch (err) {
      setError(
        err.message || "Failed to convert images to PDF. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedFile) {
      downloadFile(processedFile.file, processedFile.name);
    }
  };

  const resetAll = () => {
    uploadedFiles.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
    if (processedFile?.previewUrl)
      URL.revokeObjectURL(processedFile.previewUrl);

    setUploadedFiles([]);
    setProcessedFile(null);
    setError("");
    setSuccess("");
  };

  const clearAll = () => {
    uploadedFiles.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
    setUploadedFiles([]);
  };

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== index) {
      moveFile(draggedItem, index);
    }
    setDraggedItem(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans">
      {/* Background Decor */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/10 blur-[120px]"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-900/10 blur-[120px]"
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5,
          }}
        />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 md:pt-40 max-w-6xl">
        {/* --- BACK LINK SECTION --- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8 flex justify-start"
        >
          <Link
            to="/pdf-edit"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors duration-200"
          >
            <ArrowRight className="w-4 h-4 transform rotate-180 transition-transform group-hover:-translate-x-1" />
            Back to Tools
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16  bg-violot-500/10 border border-violet-500/20 rounded-xl mb-4 sm:mb-6"
          >
            <FileImage className="w-8 h-8 text-violet-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Images to PDF Converter
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto px-4">
            Convert multiple images into a professional PDF document. Reorder,
            preview, and customize layout instantly.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 sm:space-y-8"
        ></motion.div>

        <div className="space-y-8">
          {/* Upload Area */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
              Upload Images
            </h2>
            <FileUpload
              accept="image/*"
              onFilesSelected={handleFiles}
              multiple={true}
              label="Drop images here or click to browse"
              description="Supports JPG, PNG, GIF, WebP, BMP up to 50MB each"
            />
          </div>

          {/* Uploaded Images */}
          {uploadedFiles.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                    Selected Images
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-violet-400 font-semibold">
                      {uploadedFiles.length} images
                    </span>
                    <span className="text-slate-400">
                      {formatFileSize(
                        uploadedFiles.reduce((acc, f) => acc + f.size, 0),
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid"
                          ? "bg-violet-500/20 text-violet-400"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list"
                          ? "bg-violet-500/20 text-violet-400"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Layout Options */}
                  <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setLayout("portrait")}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        layout === "portrait"
                          ? "bg-violet-500/20 text-violet-400"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => setLayout("landscape")}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        layout === "landscape"
                          ? "bg-violet-500/20 text-violet-400"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Landscape
                    </button>
                  </div>

                  <button
                    onClick={clearAll}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Images Display */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className={`group relative bg-slate-800/50 rounded-lg border ${
                        draggedItem === index
                          ? "border-violet-500/50"
                          : "border-slate-700"
                      } overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:scale-[1.02] cursor-move`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="aspect-square relative overflow-hidden bg-slate-900">
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#8b5cf6">
                              <rect width="100" height="100" fill="#0f172a" />
                              <rect x="25" y="25" width="50" height="50" fill="#8b5cf6" opacity="0.2" />
                              <circle cx="50" cy="40" r="15" fill="#8b5cf6" opacity="0.5" />
                              <text x="50" y="85" text-anchor="middle" fill="#c4b5fd" font-size="8" font-family="monospace">
                                ${file.name.substring(0, 8)}...
                              </text>
                            </svg>
                          `)}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-xs font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-violet-300 text-xs mt-1">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1.5 bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors shadow-lg"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-slate-900 border border-slate-700 text-violet-400 text-xs font-bold px-2 py-1 rounded">
                        {index + 1}
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Move className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className={`group bg-slate-800/50 rounded-lg border ${
                        draggedItem === index
                          ? "border-violet-500/50"
                          : "border-slate-700"
                      } p-4 hover:border-violet-500/30 hover:bg-slate-800/70 transition-colors cursor-move`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-slate-900 text-violet-400 text-xs font-bold px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-medium text-sm truncate max-w-xs">
                                {file.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>
                                {file.type.split("/")[1].toUpperCase()}
                              </span>
                              <span>•</span>
                              <Move className="w-3 h-3" />
                              <span className="text-violet-400">
                                Drag to reorder
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              window.open(file.previewUrl, "_blank")
                            }
                            className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                            title="View image"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Drag & Drop Hint */}
              {uploadedFiles.length > 1 && (
                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                  <p className="text-violet-400 text-sm flex items-center justify-center gap-2">
                    <Move className="w-4 h-4" />
                    Drag and drop images to reorder them in the PDF
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          {/* Convert Button */}
          {uploadedFiles.length > 0 && !processedFile && (
            <div className="space-y-4">
              <button
                onClick={handleConvert}
                disabled={processing}
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating PDF...
                  </>
                ) : (
                  <>
                    <FileImage className="w-5 h-5" />
                    Convert {uploadedFiles.length} Images to PDF
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {processedFile && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">
                PDF Created Successfully!
              </h3>

              <div className="space-y-8">
                {/* Success Message */}
                {success && (
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    <p className="text-violet-300">{success}</p>
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">
                      Images Converted
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {uploadedFiles.length}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">
                      PDF Pages
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {uploadedFiles.length}
                    </p>
                  </div>
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-5">
                    <p className="text-violet-300 text-sm mb-2 uppercase tracking-wider">
                      PDF Size
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {formatFileSize(processedFile.size)}
                    </p>
                  </div>
                </div>

                {/* Processed File */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {processedFile.name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {formatFileSize(processedFile.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => setPreviewFile(processedFile.file)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview PDF
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={resetAll}
                    className="flex-1 bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-all duration-300 border border-slate-700"
                  >
                    Convert More Images
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 sm:p-8 border border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 tracking-tight text-center sm:text-left">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-slate-800 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left 
                     hover:bg-slate-800/50 transition-colors 
                     active:scale-[0.98]"
                  >
                    <span className="text-slate-300 font-medium text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>

                    {openFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      openFAQ === faq.id
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-6 py-4 bg-slate-800/30 border-t border-slate-800">
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* CTA Section */}
          <div className="text-center px-2 sm:px-0">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              More PDF Tools Available
            </h3>

            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base px-4 sm:px-0">
              Explore our complete suite of PDF utilities
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {[
                {
                  to: "/extract-images",
                  label: "Extract Images",
                  mobileWidth: "w-full",
                  mobilePadding: "py-3",
                },
                {
                  to: "/merge",
                  label: "Merge PDFs",
                  mobileWidth: "w-11/12",
                  mobilePadding: "py-2.5",
                },
                {
                  to: "/pdf-edit",
                  label: "All Tools",
                  icon: MousePointerClick,
                  gradient: true,
                  mobileWidth: "w-10/12",
                  mobilePadding: "py-2",
                },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
          ${link.mobileWidth} sm:w-auto
          inline-flex justify-center items-center gap-2
          px-4 sm:px-6 ${link.mobilePadding} sm:py-3
          ${
            link.gradient
              ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/20"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }
          rounded-lg font-medium transition-all duration-300
          text-sm sm:text-base
        `}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Preview Modal */}
        {previewFile && (
          <PDFPreview file={previewFile} onClose={() => setPreviewFile(null)} />
        )}
      </div>
    </div>
  );
};

export default ImagesToPDF;
