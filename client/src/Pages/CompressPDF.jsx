import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Minimize2,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MousePointerClick,
} from "lucide-react";
import {
  compressPDF,
  formatFileSize,
  validateFiles,
  downloadFile,
} from "../utils/pdfUtils";
import PDFPreview from "../components/PDFPreview";
import FileUpload from "../components/FileUpload";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CompressPDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);

  const compressionLevels = [
    {
      value: 0,
      label: "Low",
      description: "Minimal compression, best quality",
      color: "from-emerald-400 to-emerald-500",
    },
    {
      value: 1,
      label: "Medium",
      description: "Balanced quality and size",
      color: "from-blue-400 to-blue-500",
    },
    {
      value: 2,
      label: "High",
      description: "Good compression, decent quality",
      color: "from-violet-400 to-violet-500",
    },
    {
      value: 3,
      label: "Aggressive",
      description: "Maximum compression",
      color: "from-rose-400 to-rose-500",
    },
  ];

  const faqs = [
    {
      id: 1,
      question: "How does PDF compression work?",
      answer:
        "PDF compression works by reducing the file size through various techniques including image optimization, font subsetting, and removing unnecessary metadata. Our tool uses lossless and lossy compression methods depending on your selected quality level.",
    },
    {
      id: 2,
      question: "Will compression affect the quality of my PDF?",
      answer:
        "The quality impact depends on the compression level. Low compression maintains original quality, while aggressive compression may reduce image quality. Text and vector graphics remain sharp at all levels.",
    },
    {
      id: 3,
      question: "What's the maximum file size I can compress?",
      answer:
        "You can compress PDF files up to 100MB. For larger files, consider using our desktop version or splitting the PDF first.",
    },
    {
      id: 4,
      question: "Is my data secure during compression?",
      answer:
        "Yes! All processing happens locally in your browser. Your files never leave your device, ensuring complete privacy and security.",
    },
    {
      id: 5,
      question: "Can I compress multiple PDFs at once?",
      answer:
        "Currently, our tool processes one PDF at a time. For batch compression, you can use our Merge PDF tool first, then compress the merged file.",
    },
    {
      id: 6,
      question: "What compression level should I choose?",
      answer:
        "Choose Low for maximum quality, Medium for sharing via email, High for web uploads, and Aggressive for minimal file size when quality isn't critical.",
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
      setOriginalSize(filesWithPreview[0].size);
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

  const handleCompress = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload a PDF file first");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const file = uploadedFiles[0].file;
      const compressedFile = await compressPDF(file, compressionLevel);

      setCompressedSize(compressedFile.size);
      setProcessedFile({
        file: compressedFile,
        name: compressedFile.name,
        size: compressedFile.size,
        previewUrl: URL.createObjectURL(compressedFile),
      });

      const reduction = Math.round(
        (1 - compressedFile.size / originalSize) * 100,
      );
      setSuccess(
        `Successfully compressed by ${reduction}% while maintaining quality!`,
      );
    } catch (err) {
      setError(err.message || "Failed to compress PDF. Please try again.");
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
    setCompressionLevel(2);
    setOriginalSize(0);
    setCompressedSize(0);
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

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 md:pt-40 max-w-5xl">
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
        {/* <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
            <Minimize2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Compress PDF Files
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Reduce PDF file size while maintaining quality. Perfect for sharing,
            emailing, and saving storage space.
          </p>
        </div> */}

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
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 sm:mb-6"
          >
            <Minimize2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Compress PDF Files
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto px-4">
            Reduce PDF file size while maintaining quality. Perfect for sharing,
            emailing, and saving storage space
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
              Upload PDF
            </h2>
            <FileUpload
              accept=".pdf"
              onFilesSelected={handleFiles}
              multiple={false}
              label="Drop PDF here or click to browse"
              description="Supports PDF files up to 100MB"
            />
          </div>

          {/* Uploaded File */}
          {uploadedFiles.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
                Original File
              </h3>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
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
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 transition-colors hover:bg-slate-800 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compression Options */}
          {uploadedFiles.length > 0 && !processedFile && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
                Compression Settings
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-slate-300 font-medium">
                      Compression Level
                    </label>
                    <span className="text-emerald-400 font-semibold">
                      {
                        compressionLevels.find(
                          (l) => l.value === compressionLevel,
                        )?.label
                      }
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={compressionLevel}
                    onChange={(e) =>
                      setCompressionLevel(parseInt(e.target.value))
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-emerald-500 [&::-webkit-slider-thumb]:to-emerald-600"
                  />
                  <div className="grid grid-cols-4 gap-3 mt-6">
                    {compressionLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setCompressionLevel(level.value)}
                        className={`text-center p-4 rounded-lg transition-all border ${
                          compressionLevel === level.value
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className={`font-semibold ${
                            compressionLevel === level.value
                              ? "text-emerald-300"
                              : "text-slate-300"
                          }`}
                        >
                          {level.label}
                        </div>
                        <div className="text-xs mt-2 text-slate-400">
                          {level.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <p className="text-rose-300 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCompress}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      Compress PDF
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {processedFile && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-8 tracking-tight">
                Compression Results
              </h3>

              <div className="space-y-8">
                {/* File Size Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">
                      Original Size
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {formatFileSize(originalSize)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">
                      Compressed Size
                    </p>
                    <p className="text-emerald-400 text-2xl font-bold">
                      {formatFileSize(compressedSize)}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
                    <p className="text-emerald-300 text-sm mb-2 uppercase tracking-wider">
                      Savings
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {Math.round((1 - compressedSize / originalSize) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-emerald-300">{success}</p>
                  </div>
                )}

                {/* Processed File */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-400" />
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
                        Preview
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
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
                    Compress Another File
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
                  to: "/images-to-pdf",
                  label: "Images to PDF",
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

export default CompressPDF;
