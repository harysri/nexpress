// import React, { useState, useCallback } from "react";
// import {
//   Upload,
//   Type,
//   X,
//   Copy,
//   Check,
//   AlertCircle,
//   Loader,
//   ArrowRight,
//   Trash2,
//   FileText,
// } from "lucide-react";
// import { performOCR, copyToClipboard } from "../utils/pdfUtils";
// import FileUpload from "../components/FileUpload";
// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// const ImageToText = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [extractedText, setExtractedText] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState("");
//   const [copied, setCopied] = useState(false);

//   const handleFiles = useCallback((files) => {
//     const file = files[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       setError("Please upload a valid image file.");
//       return;
//     }

//     setSelectedFile({
//       file,
//       previewUrl: URL.createObjectURL(file),
//       name: file.name,
//     });
//     setExtractedText("");
//     setError("");
//   }, []);

//   const handleStartOCR = async () => {
//     if (!selectedFile) return;

//     setIsProcessing(true);
//     setError("");
//     setProgress(0);

//     try {
//       const text = await performOCR(selectedFile.file, setProgress);
//       setExtractedText(text);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCopy = async () => {
//     const success = await copyToClipboard(extractedText);
//     if (success) {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const reset = () => {
//     if (selectedFile?.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
//     setSelectedFile(null);
//     setExtractedText("");
//     setError("");
//     setProgress(0);
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
//       {/* Background Decor */}
//       <div className="fixed inset-0 z-0 pointer-events-none">
//         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
//       </div>

//       <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 max-w-5xl">
//         {/* Back Link */}
//         <Link
//           to="/pdf-edit"
//           className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 mb-8 transition-colors"
//         >
//           <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
//           Back to Tools
//         </Link>

//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6">
//             <Type className="w-8 h-8 text-indigo-400" />
//           </div>
//           <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
//             Image to Text (OCR)
//           </h1>
//           <p className="text-slate-400 max-w-2xl mx-auto">
//             Extract editable text from images using advanced Optical Character
//             Recognition. Perfect for scanned documents, receipts, and notes.
//           </p>
//         </div>

//         <div className="space-y-8">
//           {/* Upload Section */}
//           {!selectedFile ? (
//             <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
//               <FileUpload
//                 accept="image/*"
//                 onFilesSelected={handleFiles}
//                 multiple={false}
//                 label="Drop image here or click to browse"
//                 description="Supports JPG, PNG, WebP up to 20MB"
//               />
//             </div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="grid grid-cols-1 md:grid-cols-2 gap-6"
//             >
//               {/* Image Preview */}
//               <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-white">
//                     Source Image
//                   </h3>
//                   <button
//                     onClick={reset}
//                     className="text-slate-400 hover:text-rose-400 transition-colors"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </div>
//                 <div className="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black/40">
//                   <img
//                     src={selectedFile.previewUrl}
//                     alt="Preview"
//                     className="w-full h-full object-contain"
//                   />
//                 </div>
//                 {!extractedText && (
//                   <button
//                     onClick={handleStartOCR}
//                     disabled={isProcessing}
//                     className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {isProcessing ? (
//                       <Loader className="w-5 h-5 animate-spin" />
//                     ) : (
//                       <Type className="w-5 h-5" />
//                     )}
//                     {isProcessing
//                       ? `Processing (${progress}%)`
//                       : "Extract Text"}
//                   </button>
//                 )}
//               </div>

//               {/* Text Result */}
//               <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 flex flex-col">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-white">
//                     Extracted Text
//                   </h3>
//                   {extractedText && (
//                     <button
//                       onClick={handleCopy}
//                       className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-indigo-400 rounded-md hover:bg-slate-700 transition-colors text-sm border border-slate-700"
//                     >
//                       {copied ? (
//                         <Check className="w-4 h-4 text-emerald-400" />
//                       ) : (
//                         <Copy className="w-4 h-4" />
//                       )}
//                       {copied ? "Copied!" : "Copy"}
//                     </button>
//                   )}
//                 </div>

//                 <div className="flex-grow relative">
//                   {isProcessing ? (
//                     <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
//                       <div className="w-full max-w-[200px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
//                         <motion.div
//                           className="h-full bg-indigo-500"
//                           initial={{ width: 0 }}
//                           animate={{ width: `${progress}%` }}
//                         />
//                       </div>
//                       <p className="text-slate-500 text-sm animate-pulse">
//                         Reading characters...
//                       </p>
//                     </div>
//                   ) : (
//                     <textarea
//                       readOnly
//                       placeholder="Extracted text will appear here..."
//                       className="w-full h-full min-h-[300px] bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-slate-300 focus:outline-none resize-none font-mono text-sm leading-relaxed"
//                       value={extractedText}
//                     />
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* Error Message */}
//           <AnimatePresence>
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//               >
//                 <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3">
//                   <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
//                   <p className="text-rose-300 text-sm">{error}</p>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Tips Section */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-800">
//             <div className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
//               <div className="text-indigo-400 mb-2">
//                 <Check className="w-5 h-5" />
//               </div>
//               <h4 className="text-white font-medium mb-1">High Resolution</h4>
//               <p className="text-xs text-slate-500">
//                 Clearer images result in much higher text accuracy.
//               </p>
//             </div>
//             <div className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
//               <div className="text-indigo-400 mb-2">
//                 <FileText className="w-5 h-5" />
//               </div>
//               <h4 className="text-white font-medium mb-1">Standard Fonts</h4>
//               <p className="text-xs text-slate-500">
//                 Printed text is recognized better than handwriting.
//               </p>
//             </div>
//             <div className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
//               <div className="text-indigo-400 mb-2">
//                 <Upload className="w-5 h-5" />
//               </div>
//               <h4 className="text-white font-medium mb-1">Good Lighting</h4>
//               <p className="text-xs text-slate-500">
//                 Avoid shadows or glare on the document for best results.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageToText;
import React, { useState, useCallback } from "react";
import {
  Upload,
  Type,
  Copy,
  Check,
  AlertCircle,
  Loader,
  ArrowRight,
  Trash2,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  performOCR,
  SUPPORTED_LANGUAGES,
  copyToClipboard,
} from "../utils/pdfUtils";
import FileUpload from "../components/FileUpload";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants used across the page (stagger + item entrance)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

const FAQ_ITEMS = [
  {
    question: "What image formats are supported?",
    answer:
      "The tool supports all common image formats including JPG/JPEG, PNG, WebP, BMP, GIF, and TIFF. For best results, use PNG or high-quality JPG files with a resolution of at least 300 DPI.",
  },
  {
    question: "How accurate is the text extraction?",
    answer:
      "Accuracy depends on image quality and clarity. High-resolution images with clear, printed text typically achieve 95–99% accuracy. Handwritten text, low-resolution images, or images with heavy noise/shadows may have reduced accuracy.",
  },
  {
    question: "Can I extract text from multiple languages at once?",
    answer:
      "Yes — automatically! The tool runs OCR across all 26 supported languages simultaneously without any configuration needed. Whether your document is in English, Japanese, Arabic, or a mix of languages, it will detect and extract all recognizable text.",
  },
  {
    question: "Is my image uploaded to a server?",
    answer:
      "No. All OCR processing is done entirely in your browser using Tesseract.js. Your images never leave your device, ensuring complete privacy.",
  },
  {
    question: "Why is the extracted text inaccurate?",
    answer:
      "Common causes include low image resolution, skewed or rotated text, poor lighting or shadows, decorative/handwritten fonts, or selecting the wrong language. Try improving image quality or ensuring the correct language is selected.",
  },
  {
    question: "What languages are supported?",
    answer:
      "26 languages are supported and all are applied automatically: English, Spanish, French, German, Chinese (Simplified & Traditional), Japanese, Korean, Arabic, Hindi, Russian, Italian, Portuguese, Turkish, Dutch, Polish, Swedish, Norwegian, Danish, Finnish, Hebrew, Thai, Vietnamese, Ukrainian, Czech, and Romanian.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "The recommended maximum file size is 20MB. Larger files may slow down processing. If you have a large image, consider compressing it or cropping it to the relevant area before uploading.",
  },
  {
    question: "Can it read handwritten text?",
    answer:
      "Tesseract.js has limited support for handwriting. It works best with clearly printed, typed, or typeset text. For handwriting, consider using a dedicated handwriting recognition service for better results.",
  },
];

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 backdrop-blur-sm"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-800/40 transition-colors group"
      >
        <span className="text-slate-200 font-medium pr-4 group-hover:text-white transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-indigo-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 border-t border-slate-800/60">
              <p className="text-slate-400 text-sm leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ImageToText = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  // Always use all supported languages automatically
  const allLanguages = Object.keys(SUPPORTED_LANGUAGES);

  const handleFiles = useCallback((files) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setSelectedFile({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    });
    setExtractedText("");
    setError("");
  }, []);

  const handleStartOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");
    setProgress(0);

    try {
      const text = await performOCR(
        selectedFile.file,
        setProgress,
        allLanguages,
      );
      setExtractedText(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(extractedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    if (selectedFile?.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
    setSelectedFile(null);
    setExtractedText("");
    setError("");
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Decor */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"
          animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]"
          animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5,
          }}
        />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            to="/pdf-edit"
            className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Link>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.16,
            }}
            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6"
          >
            <Type className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Image to Text (OCR)
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Extract editable text from images using advanced Optical Character
            Recognition. Supports 26+ languages. Perfect for scanned documents,
            receipts, and notes.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Upload Section */}
          {!selectedFile ? (
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800"
            >
              <FileUpload
                accept="image/*"
                onFilesSelected={handleFiles}
                multiple={false}
                label="Drop image here or click to browse"
                description="Supports JPG, PNG, WebP up to 20MB"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Image Preview */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Source Image
                  </h3>
                  <button
                    onClick={reset}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black/40">
                  <img
                    src={selectedFile.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                {!extractedText && (
                  <button
                    onClick={handleStartOCR}
                    disabled={isProcessing}
                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Type className="w-5 h-5" />
                    )}
                    {isProcessing
                      ? `Processing (${progress}%)`
                      : "Extract Text"}
                  </button>
                )}
              </div>

              {/* Text Result */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Extracted Text
                  </h3>
                  {extractedText && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-indigo-400 rounded-md hover:bg-slate-700 transition-colors text-sm border border-slate-700"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>

                <div className="flex-grow relative">
                  {isProcessing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <div className="w-full max-w-[200px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-slate-500 text-sm animate-pulse">
                        Reading characters...
                      </p>
                    </div>
                  ) : (
                    <textarea
                      readOnly
                      placeholder="Extracted text will appear here..."
                      className="w-full h-full min-h-[300px] bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-slate-300 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                      value={extractedText}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <p className="text-rose-300 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-800"
          >
            <div className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
              <div className="text-indigo-400 mb-2">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-white font-medium mb-1">High Resolution</h4>
              <p className="text-xs text-slate-500">
                Clearer images result in much higher text accuracy.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
              <div className="text-indigo-400 mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-white font-medium mb-1">Standard Fonts</h4>
              <p className="text-xs text-slate-500">
                Printed text is recognized better than handwriting.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
              <div className="text-indigo-400 mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-white font-medium mb-1">Good Lighting</h4>
              <p className="text-xs text-slate-500">
                Avoid shadows or glare on the document for best results.
              </p>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            variants={itemVariants}
            className="pt-12 border-t border-slate-800"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Everything you need to know about the OCR tool, language
                support, accuracy, and privacy.
              </p>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => (
                <FAQItem
                  key={index}
                  index={index}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImageToText;
