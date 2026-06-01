import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  Grid,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MousePointerClick,
  Grid3x3,
  List,
} from "lucide-react";
import {
  extractImagesFromPDF,
  formatFileSize,
  validateFiles,
  downloadFile,
} from "../utils/pdfUtils";
import PDFPreview from "../components/PDFPreview";
import FileUpload from "../components/FileUpload";
import { Link } from "react-router-dom";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";

const ExtractImages = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [extractedCount, setExtractedCount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "What image formats are extracted from PDFs?",
      answer:
        "Our tool extracts images in their original format (JPEG, PNG, TIFF, BMP, etc.) as preserved in the PDF. Most images are extracted as JPEG or PNG files.",
    },
    {
      id: 2,
      question: "Will the image quality be preserved?",
      answer:
        "Yes! Images are extracted at their original resolution and quality. No compression or quality loss occurs during extraction.",
    },
    {
      id: 3,
      question: "What's the maximum PDF size for extraction?",
      answer:
        "You can extract images from PDF files up to 100MB. For larger files, consider compressing the PDF first or splitting it into smaller parts.",
    },
    {
      id: 4,
      question: "Are vector graphics (SVG) extracted?",
      answer:
        "Vector graphics embedded in PDFs are converted to high-resolution PNG images during extraction, preserving their quality at any size.",
    },
    {
      id: 5,
      question: "How are extracted images named?",
      answer:
        "Images are automatically named with the PDF filename, page number, and image sequence (e.g., document-page1-image1.jpg).",
    },
    {
      id: 6,
      question: "Can I preview images before downloading?",
      answer:
        "Yes! All extracted images can be previewed in grid or list view. You can download individual images or all images as a ZIP file.",
    },
  ];

  const handleFiles = useCallback((files) => {
    const { validFiles, errors } = validateFiles(files, ["pdf"], 100);

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    if (validFiles.length > 0) {
      const filesWithPreview = validFiles.map((file) => ({
        file,
        name: file.name,
        size: file.size,
        id: Math.random().toString(36).substr(2, 9),
        previewUrl: URL.createObjectURL(file),
      }));

      setUploadedFiles(filesWithPreview);
      setError("");
    }
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

  const handleExtract = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload a PDF file first");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");
    setProcessedFiles([]);
    setExtractedCount(0);

    try {
      const file = uploadedFiles[0].file;
      const extractedImages = await extractImagesFromPDF(file);

      const processed = extractedImages.map((imgFile, index) => ({
        file: imgFile,
        name: imgFile.name,
        size: imgFile.size,
        previewUrl: URL.createObjectURL(imgFile),
        page: index + 1,
      }));

      setProcessedFiles(processed);
      setExtractedCount(processed.length);
      setSuccess(
        `Successfully extracted ${processed.length} high-quality images!`,
      );
    } catch (err) {
      setError(err.message || "Failed to extract images. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSingle = (imageFile) => {
    downloadFile(imageFile.file, imageFile.name);
  };

  const handleDownloadAll = async () => {
    if (processedFiles.length === 0) {
      setError("No images to download");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // Create a new ZIP instance
      const zip = new JSZip();
      const folder = zip.folder("extracted_images");

      // Add each image to the ZIP
      processedFiles.forEach((image, index) => {
        if (image.file && image.file instanceof File) {
          // Use meaningful file names
          const fileName = image.name || `image_${index + 1}.png`;
          folder.file(fileName, image.file);
        } else if (image.previewUrl) {
          // If we only have preview URL, fetch it
          const fileName = `image_${index + 1}.png`;
          folder.file(fileName, image.previewUrl.split(",")[1], {
            base64: true,
          });
        }
      });

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      // Download the ZIP file
      downloadFile(zipBlob, `extracted_images_${Date.now()}.zip`);

      setSuccess(`Downloaded ${processedFiles.length} images as ZIP file`);
    } catch (error) {
      console.error("ZIP creation failed:", error);
      setError(
        "Failed to create ZIP file. Try downloading images individually.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const resetAll = () => {
    uploadedFiles.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
    processedFiles.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });

    setUploadedFiles([]);
    setProcessedFiles([]);
    setExtractedCount(0);
    setError("");
    setSuccess("");
  };

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
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

  const slideInVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const imageCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (index) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: index * 0.05,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-12 sm:pb-20 md:pt-40 max-w-6xl">
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

        {/* Header */}
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
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 sm:mb-6"
          >
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Extract Images from PDF
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto px-4">
            Extract high-quality images from PDF documents. Preserve original
            resolution and format with one click.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 sm:space-y-8"
        >
          {/* Upload Area */}
          <motion.div variants={itemVariants}>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
                Upload PDF
              </h2>
              <FileUpload
                accept=".pdf"
                onFilesSelected={handleFiles}
                multiple={false}
                label="Drop PDF here or click to browse"
                description="Supports PDF files up to 100MB with images"
              />
            </div>
          </motion.div>

          {/* Uploaded File */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
                    Original PDF
                  </h3>
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {file.name}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setPreviewFile(file.file)}
                              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm w-full sm:w-auto justify-center"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                Preview PDF
                              </span>
                            </button>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-2 text-rose-400 hover:text-rose-300 transition-colors hover:bg-slate-800 rounded-lg"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extract Button */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && processedFiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                      <p className="text-rose-300 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExtract}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Extracting Images...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5" />
                      <span>Extract Images from PDF</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extracted Images */}
          <AnimatePresence>
            {processedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                        Extracted Images
                      </h3>
                      <div className="flex items-center gap-3 sm:gap-4 text-sm">
                        <span className="text-amber-400 font-semibold">
                          {extractedCount} images
                        </span>
                        <span className="text-slate-400">
                          {formatFileSize(
                            processedFiles.reduce((acc, f) => acc + f.size, 0),
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewMode("grid")}
                          className={`p-2 rounded transition-colors ${
                            viewMode === "grid"
                              ? "bg-amber-500/20 text-amber-400"
                              : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          <Grid3x3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewMode("list")}
                          className={`p-2 rounded transition-colors ${
                            viewMode === "list"
                              ? "bg-amber-500/20 text-amber-400"
                              : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          <List className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Download All Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadAll}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 text-sm sm:text-base"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden xs:inline">Download All</span>
                        <span className="xs:hidden">All (.zip)</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Success Message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                          <p className="text-amber-300 text-sm sm:text-base">
                            {success}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Images Grid View */}
                  <AnimatePresence mode="wait">
                    {viewMode === "grid" && (
                      <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                          {processedFiles.map((image, index) => (
                            <motion.div
                              key={index}
                              custom={index}
                              variants={imageCardVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ scale: 1.05 }}
                              className="group relative bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-amber-500/50 transition-all duration-300"
                            >
                              <div className="aspect-square relative overflow-hidden bg-slate-900">
                                <motion.img
                                  src={image.previewUrl}
                                  alt={image.name}
                                  className="w-full h-full object-cover"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.3 }}
                                  onError={(e) => {
                                    e.target.src = `data:image/svg+xml;base64,${btoa(`
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#f59e0b">
                                      <rect width="100" height="100" fill="#0f172a" />
                                      <path d="M30,30 L70,30 L80,50 L70,70 L30,70 L20,50 Z" fill="#f59e0b" opacity="0.2" />
                                      <circle cx="50" cy="40" r="15" fill="#f59e0b" opacity="0.5" />
                                      <text x="50" y="85" text-anchor="middle" fill="#fbbf24" font-size="8" font-family="monospace">
                                        ${image.name.substring(0, 8)}...
                                      </text>
                                    </svg>
                                  `)}`;
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                                    <p className="text-white text-xs font-medium truncate">
                                      {image.name}
                                    </p>
                                    <p className="text-amber-300 text-xs mt-0.5 sm:mt-1">
                                      Page {image.page}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <motion.div
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                whileHover={{ scale: 1.1 }}
                              >
                                <button
                                  onClick={() => handleDownloadSingle(image)}
                                  className="p-1.5 bg-amber-500 rounded-full hover:bg-amber-600 transition-colors shadow-lg"
                                >
                                  <Download className="w-3.5 h-3.5 text-white" />
                                </button>
                              </motion.div>
                              <div className="absolute top-2 left-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 sm:px-2 sm:py-1 rounded">
                                {index + 1}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Images List View */}
                    {viewMode === "list" && (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-3">
                          {processedFiles.map((image, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 5 }}
                              className="group bg-slate-800/50 rounded-lg border border-slate-700 p-3 sm:p-4 hover:border-amber-500/30 hover:bg-slate-800/70 transition-colors"
                            >
                              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                                    <img
                                      src={image.previewUrl}
                                      alt={image.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-1 left-1 bg-slate-900 text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded">
                                      {index + 1}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-white font-medium text-sm truncate max-w-[200px] sm:max-w-xs">
                                        {image.name}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                      <span>{formatFileSize(image.size)}</span>
                                      <span className="hidden xs:inline">
                                        •
                                      </span>
                                      <span>Page {image.page}</span>
                                      <span className="hidden sm:inline">
                                        •
                                      </span>
                                      <span className="text-amber-400 hidden sm:inline">
                                        PNG/JPEG
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 self-end xs:self-center">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      window.open(image.previewUrl, "_blank")
                                    }
                                    className="p-1.5 sm:p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                    title="View full size"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDownloadSingle(image)}
                                    className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                                    title="Download image"
                                  >
                                    <Download className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetAll}
                      className="flex-1 bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-all duration-300 border border-slate-700 text-sm sm:text-base"
                    >
                      Extract from Another PDF
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <motion.div
                    key={faq.id}
                    layout
                    className="border border-slate-800 rounded-lg overflow-hidden"
                  >
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-slate-300 font-medium text-sm sm:text-base pr-4">
                        {faq.question}
                      </span>
                      {openFAQ === faq.id ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0" />
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {openFAQ === faq.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/30 border-t border-slate-800">
                            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              More PDF Tools Available
            </h3>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base px-4">
              Explore our complete suite of PDF utilities
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {[
                { to: "/images-to-pdf", label: "Images to PDF" },
                { to: "/merge", label: "Merge PDFs" },
                {
                  to: "/pdf-edit",
                  label: "All Tools",
                  icon: MousePointerClick,
                  gradient: true,
                },
              ].map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.to}
                    className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 ${
                      link.gradient
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    } rounded-lg font-medium transition-all duration-300 text-sm sm:text-base`}
                  >
                    {link.icon && (
                      <link.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* PDF Preview Modal */}
        <AnimatePresence>
          {previewFile && (
            <PDFPreview
              file={previewFile}
              onClose={() => setPreviewFile(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExtractImages;
