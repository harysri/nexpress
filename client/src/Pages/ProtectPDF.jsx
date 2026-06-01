import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Lock,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  Shield,
  Key,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MousePointerClick,
  ShieldAlert,
} from "lucide-react";
import {
  protectPDF,
  formatFileSize,
  validateFiles,
  downloadFile,
} from "../utils/pdfUtils";
import PDFPreview from "../components/PDFPreview";
import FileUpload from "../components/FileUpload";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProtectPDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const faqs = [
    {
      id: 1,
      question: "Is my password secure?",
      answer:
        "Yes! Password protection uses AES-256 encryption, the same standard used by banks and governments. Your password is never transmitted to our servers.",
    },
    {
      id: 2,
      question: "Can I remove the password later?",
      answer:
        "Yes, but you'll need to use our Password Protection tool again and enter the current password to unlock it before removing protection.",
    },
    {
      id: 3,
      question: "What happens if I forget the password?",
      answer:
        "We cannot recover forgotten passwords. We recommend saving your password in a secure password manager. The encryption is designed to be irreversible without the password.",
    },
    {
      id: 4,
      question: "Does protection affect PDF content?",
      answer:
        "No, encryption is applied without modifying the actual PDF content. All text, images, and formatting remain exactly as in the original.",
    },
    {
      id: 5,
      question: "Can I set different permissions?",
      answer:
        "Currently, we support full document encryption. Future updates will include options for restricting printing, copying, or editing.",
    },
    {
      id: 6,
      question: "What's the maximum file size?",
      answer:
        "You can protect PDF files up to 100MB. Larger files may take longer to encrypt but will be processed locally in your browser.",
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

  const handleProtect = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload a PDF file first");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const file = uploadedFiles[0].file;
      const protectedFile = await protectPDF(file, password);

      setProcessedFile({
        file: protectedFile,
        name: `protected_${uploadedFiles[0].name}`,
        size: protectedFile.size,
        previewUrl: URL.createObjectURL(protectedFile),
      });

      setSuccess("PDF encrypted successfully with AES-256 protection!");
    } catch (err) {
      setError(err.message || "Failed to protect PDF. Please try again.");
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
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const getPasswordStrength = () => {
    if (!password) return { width: "w-0", color: "bg-slate-500", text: "None" };
    if (password.length < 4)
      return { width: "w-1/4", color: "bg-rose-500", text: "Weak" };
    if (password.length < 6)
      return { width: "w-1/2", color: "bg-amber-500", text: "Fair" };
    if (password.length < 8)
      return { width: "w-3/4", color: "bg-blue-500", text: "Good" };
    return { width: "w-full", color: "bg-emerald-500", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength();

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
        {/* Header
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6">
            <Lock className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Password Protect PDF
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Secure your PDF documents with military-grade AES-256 encryption.
            Protect sensitive information from unauthorized access.
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
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4 sm:mb-6"
          >
            <Lock className="w-8 h-8 text-rose-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Password Protect PDF
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Secure your PDF documents with military-grade AES-256 encryption.
            Protect sensitive information from unauthorized access.
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
                        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-rose-400" />
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

          {/* Password Settings */}
          {uploadedFiles.length > 0 && !processedFile && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
                Security Settings
              </h3>

              <div className="space-y-8">
                {/* Security Info */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-rose-300 font-semibold mb-2">
                        Important Security Notes
                      </h4>
                      <ul className="text-rose-300/90 text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          <span>
                            We cannot recover forgotten passwords. Store it
                            securely.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          <span>
                            Encryption uses AES-256 standard - bank-level
                            security
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          <span>
                            Processing happens locally in your browser for
                            privacy
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Password Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="text-slate-300 mb-2 flex items-center gap-2 text-sm font-medium">
                      <Key className="w-4 h-4" />
                      Set Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter strong password"
                        className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition-colors pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-rose-400 text-xs mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-300 mb-2 block text-sm font-medium">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition-colors"
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-300 text-sm font-medium">
                        Password Strength
                      </label>
                      <span
                        className={`text-xs font-semibold ${passwordStrength.color.replace(
                          "bg-",
                          "text-",
                        )}`}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.width} ${passwordStrength.color}`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>Weak</span>
                      <span>Fair</span>
                      <span>Good</span>
                      <span>Strong</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <p className="text-rose-300 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleProtect}
                  disabled={processing || !password || !confirmPassword}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Encrypting PDF...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Protect PDF with AES-256
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
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">
                PDF Secured Successfully!
              </h3>

              <div className="space-y-8">
                {/* Success Message */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-rose-300 font-semibold">
                        AES-256 Encryption Applied
                      </h4>
                      <p className="text-rose-300/90 text-sm mt-1">
                        Your document is now protected with military-grade
                        encryption
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-rose-500/5 rounded-lg border border-rose-500/20">
                    <p className="text-rose-400 text-sm font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Critical: Save Your Password
                    </p>
                    <p className="text-rose-300/90 text-sm mt-1">
                      We cannot recover lost passwords. Store it in a secure
                      password manager. Without the password, the file cannot be
                      opened.
                    </p>
                  </div>
                </div>

                {/* Processed File */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {processedFile.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                          <span>{formatFileSize(processedFile.size)}</span>
                          <span>•</span>
                          <span className="text-rose-400">
                            Password Protected
                          </span>
                          <span>•</span>
                          <span>AES-256 Encrypted</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        disabled
                        title="Preview disabled for encrypted PDFs"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-500 rounded-lg cursor-not-allowed"
                      >
                        <Eye className="w-4 h-4" />
                        Preview Locked
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300"
                      >
                        <Download className="w-5 h-5" />
                        Download Protected PDF
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
                    Protect Another File
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

export default ProtectPDF;
