// import React, { useState, useCallback } from "react";
// import {
//   Upload,
//   FileText,
//   Layers,
//   X,
//   Download,
//   AlertCircle,
//   CheckCircle,
//   Loader,
//   Eye,
//   ArrowUp,
//   ArrowDown,
// } from "lucide-react";
// import {
//   mergePDFs,
//   formatFileSize,
//   validateFiles,
//   downloadFile,
// } from "../utils/pdfUtils";
// import PDFPreview from "../components/PDFPreview";
// import FileUpload from "../components/FileUpload";

// const MergePDF = () => {
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [processing, setProcessing] = useState(false);
//   const [processedFile, setProcessedFile] = useState(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [previewFile, setPreviewFile] = useState(null);

//   const handleFiles = useCallback((files) => {
//     const { validFiles, errors } = validateFiles(files, ["pdf"], 100);

//     if (errors.length > 0) {
//       setError(errors[0]);
//       return;
//     }

//     const filesWithPreview = validFiles.map((file) => ({
//       file,
//       name: file.name,
//       size: file.size,
//       id: Math.random().toString(36).substr(2, 9),
//       previewUrl: URL.createObjectURL(file),
//     }));

//     setUploadedFiles((prev) => [...prev, ...filesWithPreview]);
//     setError("");
//   }, []);

//   const removeFile = (id) => {
//     setUploadedFiles((prev) => {
//       const fileToRemove = prev.find((f) => f.id === id);
//       if (fileToRemove?.previewUrl) {
//         URL.revokeObjectURL(fileToRemove.previewUrl);
//       }
//       return prev.filter((f) => f.id !== id);
//     });
//   };

//   const moveFile = (index, direction) => {
//     const newFiles = [...uploadedFiles];
//     if (direction === "up" && index > 0) {
//       [newFiles[index], newFiles[index - 1]] = [
//         newFiles[index - 1],
//         newFiles[index],
//       ];
//       setUploadedFiles(newFiles);
//     } else if (direction === "down" && index < newFiles.length - 1) {
//       [newFiles[index], newFiles[index + 1]] = [
//         newFiles[index + 1],
//         newFiles[index],
//       ];
//       setUploadedFiles(newFiles);
//     }
//   };

//   const handleMerge = async () => {
//     if (uploadedFiles.length < 2) {
//       setError("Please upload at least 2 PDF files to merge");
//       return;
//     }

//     setProcessing(true);
//     setError("");
//     setSuccess("");

//     try {
//       const files = uploadedFiles.map((f) => f.file);
//       const mergedFile = await mergePDFs(files);

//       setProcessedFile({
//         file: mergedFile,
//         name: mergedFile.name,
//         size: mergedFile.size,
//         previewUrl: URL.createObjectURL(mergedFile),
//       });

//       setSuccess(
//         `Successfully merged ${uploadedFiles.length} PDFs into one document!`
//       );
//     } catch (err) {
//       setError(err.message || "Failed to merge PDFs. Please try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleDownload = () => {
//     if (processedFile) {
//       downloadFile(processedFile.file, processedFile.name);
//     }
//   };

//   const resetAll = () => {
//     uploadedFiles.forEach((file) => {
//       if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
//     });
//     if (processedFile?.previewUrl)
//       URL.revokeObjectURL(processedFile.previewUrl);

//     setUploadedFiles([]);
//     setProcessedFile(null);
//     setError("");
//     setSuccess("");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-6 md:pt-28">
//       <div className="container mx-auto max-w-5xl">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
//             <Layers className="w-10 h-10 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold text-white mb-3">Merge PDFs</h1>
//           <p className="text-xl text-purple-200">
//             Combine multiple PDFs into a single document
//           </p>
//         </div>

//         <div className="space-y-6">
//           {/* Upload Area */}
//           <FileUpload
//             accept=".pdf"
//             onFilesSelected={handleFiles}
//             multiple={true}
//             label="Upload PDF Files"
//             description="Drag & drop or click to select multiple PDF files"
//           />

//           {/* Uploaded Files List */}
//           {uploadedFiles.length > 0 && (
//             <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
//               <h3 className="text-xl font-bold text-white mb-4">
//                 PDF Files to Merge ({uploadedFiles.length})
//               </h3>
//               <p className="text-purple-200 mb-4">
//                 Drag and drop files to reorder, or use the arrows to arrange the
//                 merge order
//               </p>

//               <div className="space-y-3">
//                 {uploadedFiles.map((file, index) => (
//                   <div
//                     key={file.id}
//                     className="bg-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="flex flex-col gap-1">
//                         <button
//                           onClick={() => moveFile(index, "up")}
//                           disabled={index === 0}
//                           className="p-1 text-purple-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
//                         >
//                           <ArrowUp className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => moveFile(index, "down")}
//                           disabled={index === uploadedFiles.length - 1}
//                           className="p-1 text-purple-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
//                         >
//                           <ArrowDown className="w-4 h-4" />
//                         </button>
//                       </div>

//                       <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
//                         <span className="text-purple-300 font-bold">
//                           {index + 1}
//                         </span>
//                       </div>

//                       <FileText className="w-10 h-10 text-purple-300" />
//                       <div>
//                         <p className="text-white font-medium">{file.name}</p>
//                         <p className="text-purple-200">
//                           {formatFileSize(file.size)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <button
//                         onClick={() => setPreviewFile(file.file)}
//                         className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg hover:bg-purple-600/50 transition-colors"
//                       >
//                         <Eye className="w-4 h-4" />
//                         Preview
//                       </button>
//                       <button
//                         onClick={() => removeFile(file.id)}
//                         className="p-2 text-red-400 hover:text-red-300 transition-colors"
//                       >
//                         <X className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Total Size */}
//               <div className="mt-6 pt-6 border-t border-white/10">
//                 <div className="flex items-center justify-between">
//                   <span className="text-purple-200">Total Files:</span>
//                   <span className="text-white font-bold">
//                     {uploadedFiles.length} PDFs
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between mt-2">
//                   <span className="text-purple-200">Total Size:</span>
//                   <span className="text-white font-bold">
//                     {formatFileSize(
//                       uploadedFiles.reduce((acc, f) => acc + f.size, 0)
//                     )}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Error Message */}
//           {error && (
//             <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
//               <AlertCircle className="w-5 h-5 text-red-300" />
//               <p className="text-red-200">{error}</p>
//             </div>
//           )}

//           {/* Merge Button */}
//           {uploadedFiles.length >= 2 && !processedFile && (
//             <button
//               onClick={handleMerge}
//               disabled={processing}
//               className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
//             >
//               {processing ? (
//                 <>
//                   <Loader className="w-5 h-5 animate-spin" />
//                   Merging PDFs...
//                 </>
//               ) : (
//                 <>
//                   <Layers className="w-5 h-5" />
//                   Merge {uploadedFiles.length} PDFs
//                 </>
//               )}
//             </button>
//           )}

//           {/* Results */}
//           {processedFile && (
//             <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
//               <h3 className="text-xl font-bold text-white mb-6">
//                 Merge Complete!
//               </h3>

//               <div className="space-y-6">
//                 {/* Success Message */}
//                 {success && (
//                   <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
//                     <CheckCircle className="w-5 h-5 text-green-300" />
//                     <p className="text-green-200">{success}</p>
//                   </div>
//                 )}

//                 {/* Original Files Summary */}
//                 <div className="bg-white/5 rounded-xl p-4">
//                   <h4 className="text-purple-300 font-semibold mb-2">
//                     Merged Files:
//                   </h4>
//                   <div className="space-y-2">
//                     {uploadedFiles.map((file, index) => (
//                       <div
//                         key={file.id}
//                         className="flex items-center justify-between text-sm"
//                       >
//                         <span className="text-purple-200">
//                           {index + 1}. {file.name}
//                         </span>
//                         <span className="text-purple-300">
//                           {formatFileSize(file.size)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Processed File */}
//                 <div className="bg-white/5 rounded-xl p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <FileText className="w-10 h-10 text-green-300" />
//                       <div>
//                         <p className="text-white font-medium">
//                           {processedFile.name}
//                         </p>
//                         <p className="text-purple-200">
//                           {formatFileSize(processedFile.size)}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <button
//                         onClick={() => setPreviewFile(processedFile.file)}
//                         className="flex items-center gap-2 px-4 py-2 bg-green-600/30 text-green-300 rounded-lg hover:bg-green-600/50 transition-colors"
//                       >
//                         <Eye className="w-4 h-4" />
//                         Preview
//                       </button>
//                       <button
//                         onClick={handleDownload}
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
//                       >
//                         <Download className="w-5 h-5" />
//                         Download Merged PDF
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-4">
//                   <button
//                     onClick={resetAll}
//                     className="flex-1 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
//                   >
//                     Merge More Files
//                   </button>
//                   <button
//                     onClick={() => window.location.reload()}
//                     className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
//                   >
//                     Try Another Tool
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* PDF Preview Modal */}
//         {previewFile && (
//           <PDFPreview file={previewFile} onClose={() => setPreviewFile(null)} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default MergePDF;

import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Layers,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MousePointerClick,
  Move,
} from "lucide-react";
import {
  mergePDFs,
  formatFileSize,
  validateFiles,
  downloadFile,
} from "../utils/pdfUtils";
import PDFPreview from "../components/PDFPreview";
import FileUpload from "../components/FileUpload";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MergePDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How many PDFs can I merge at once?",
      answer:
        "You can merge up to 20 PDF files at once. Each file can be up to 100MB. For larger batches, consider merging in multiple steps.",
    },
    {
      id: 2,
      question: "How is the merge order determined?",
      answer:
        "PDFs are merged in the order they appear in the list. You can reorder files using the arrow buttons or by drag-and-drop.",
    },
    {
      id: 3,
      question: "Will the merged PDF keep bookmarks and links?",
      answer:
        "Yes, bookmarks and internal links are preserved during merging. However, external links and form fields may require verification.",
    },
    {
      id: 4,
      question: "Is there any quality loss during merging?",
      answer:
        "No, merging is lossless. All content, including images and vector graphics, is preserved at original quality.",
    },
    {
      id: 5,
      question: "Can I merge password-protected PDFs?",
      answer:
        "Currently, password-protected PDFs need to be unlocked first. Use our Password Protection tool to remove passwords before merging.",
    },
    {
      id: 6,
      question: "How long does merging take?",
      answer:
        "Merging is typically instant for small files. Larger files (over 50MB) may take a few seconds. Processing happens locally in your browser.",
    },
  ];

  const handleFiles = useCallback((files) => {
    const { validFiles, errors } = validateFiles(files, ["pdf"], 100);

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

  const moveFile = (index, direction) => {
    const newFiles = [...uploadedFiles];
    if (direction === "up" && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [
        newFiles[index - 1],
        newFiles[index],
      ];
      setUploadedFiles(newFiles);
    } else if (direction === "down" && index < newFiles.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [
        newFiles[index + 1],
        newFiles[index],
      ];
      setUploadedFiles(newFiles);
    }
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
      const newFiles = [...uploadedFiles];
      const dragged = newFiles[draggedItem];
      newFiles.splice(draggedItem, 1);
      newFiles.splice(index, 0, dragged);
      setUploadedFiles(newFiles);
    }
    setDraggedItem(null);
  };

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) {
      setError("Please upload at least 2 PDF files to merge");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const files = uploadedFiles.map((f) => f.file);
      const mergedFile = await mergePDFs(files);

      setProcessedFile({
        file: mergedFile,
        name: `merged_${new Date().getTime()}.pdf`,
        size: mergedFile.size,
        previewUrl: URL.createObjectURL(mergedFile),
      });

      setSuccess(`Successfully merged ${uploadedFiles.length} PDF files!`);
    } catch (err) {
      setError(err.message || "Failed to merge PDFs. Please try again.");
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

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const clearAll = () => {
    uploadedFiles.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
    setUploadedFiles([]);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
            <Layers className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Merge PDF Files
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Combine multiple PDF documents into one. Reorder pages and maintain
            original quality.
          </p>
        </div> */}

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
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4 sm:mb-6"
          >
            <Layers className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Merge PDF Files
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Combine multiple PDF documents into one. Reorder pages and maintain
            original quality.
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
              Upload PDFs
            </h2>
            <FileUpload
              accept=".pdf"
              onFilesSelected={handleFiles}
              multiple={true}
              label="Drop PDFs here or click to browse"
              description="Select multiple PDF files to merge (max 20 files, 100MB each)"
            />
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                    PDF Files to Merge
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-400 font-semibold">
                      {uploadedFiles.length} files
                    </span>
                    <span className="text-slate-400">
                      {formatFileSize(
                        uploadedFiles.reduce((acc, f) => acc + f.size, 0)
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/20 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              <p className="text-slate-400 mb-6 text-sm">
                Files will be merged in the order shown below. Reorder using
                arrows or drag-and-drop.
              </p>

              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className={`group bg-slate-800/50 rounded-lg border ${
                      draggedItem === index
                        ? "border-blue-500/50"
                        : "border-slate-700"
                    } p-4 hover:border-blue-500/30 hover:bg-slate-800/70 transition-colors cursor-move`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveFile(index, "up")}
                            disabled={index === 0}
                            className="p-1 text-slate-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveFile(index, "down")}
                            disabled={index === uploadedFiles.length - 1}
                            className="p-1 text-slate-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold">
                          {index + 1}
                        </div>

                        <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-400" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewFile(file.file)}
                          className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                          title="Preview PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drag & Drop Hint */}
              {uploadedFiles.length > 1 && (
                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                  <p className="text-blue-400 text-sm flex items-center justify-center gap-2">
                    <Move className="w-4 h-4" />
                    Drag and drop files to reorder, or use arrows for precise
                    control
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

          {/* Merge Button */}
          {uploadedFiles.length >= 2 && !processedFile && (
            <div className="space-y-4">
              <button
                onClick={handleMerge}
                disabled={processing}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Layers className="w-5 h-5" />
                    Merge {uploadedFiles.length} PDF Files
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
                Merge Complete!
              </h3>

              <div className="space-y-8">
                {/* Success Message */}
                {success && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <p className="text-blue-300">{success}</p>
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">
                      Files Merged
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {uploadedFiles.length}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">
                      Total Pages
                    </p>
                    <p className="text-white text-2xl font-bold">
                      Estimated: {uploadedFiles.length * 5}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
                    <p className="text-blue-300 text-sm mb-2 uppercase tracking-wider">
                      Merged Size
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {formatFileSize(processedFile.size)}
                    </p>
                  </div>
                </div>

                {/* Original Files Summary */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">
                    Original Files:
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400 font-bold w-6">
                            {index + 1}.
                          </span>
                          <span className="text-slate-300 truncate max-w-xs">
                            {file.name}
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processed File */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-400" />
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
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                      >
                        <Download className="w-5 h-5" />
                        Download Merged PDF
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
                    Merge More Files
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
                  to: "/compress",
                  label: "Compress PDFs",
                  mobileWidth: "w-full",
                  mobilePadding: "py-3",
                },
                {
                  to: "/protect",
                  label: "Protect PDFs",
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

export default MergePDF;
