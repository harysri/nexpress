import React, { useState } from "react";
import {
  Lock,
  Image,
  FileImage,
  Minimize2,
  Layers,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  PenTool,
  Images,
  Type, // Added for OCR
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import useDocumentMeta from "../hooks/useDocumentMeta";

const Home = () => {
  const [activeStep, setActiveStep] = useState(0);

  useDocumentMeta(
    "Free private PDF & OCR toolkit",
    "Eleven browser-based PDF tools: compress, merge, organize, split, protect, watermark, sign, extract images, convert and OCR. No uploads.",
  );

  // Animation Variants
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
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: "PDF Merger",
      description:
        "Upload multiple PDFs and combine them into a single document while preserving original formatting.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50",
    },
    {
      icon: <Minimize2 className="w-6 h-6" />,
      title: "Compress PDF",
      description:
        "Reduce PDF file size with adjustable compression levels without losing quality.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/50",
    },
    {
      icon: <Type className="w-6 h-6" />, // New OCR Feature
      title: "Image to Text (OCR)",
      description:
        "Extract editable text from scanned documents or images using advanced optical character recognition.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "hover:border-indigo-500/50",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Password Protection",
      description:
        "Encrypt your PDFs with password protection or remove existing passwords securely.",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/50",
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "Extract Images",
      description:
        "Extract all embedded images from your PDF documents in high quality.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/50",
    },
    {
      icon: <FileImage className="w-6 h-6" />,
      title: "Images to PDF",
      description:
        "Convert JPG/PNG images into new PDFs or append them to existing documents.",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
      border: "hover:border-violet-500/50",
    },
    {
      icon: <LayoutGrid className="w-6 h-6" />,
      title: "Organize & Split",
      description:
        "Reorder, rotate and delete pages visually, or split a document into parts by page range.",
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "hover:border-cyan-500/50",
    },
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "Sign & Watermark",
      description:
        "Draw a signature, stamp a watermark and add page numbers without leaving the browser.",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-500/10",
      border: "hover:border-pink-500/50",
    },
    {
      icon: <Images className="w-6 h-6" />,
      title: "PDF to Images",
      description:
        "Render any PDF page to a high-resolution JPG or PNG, then download them as a ZIP.",
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
      border: "hover:border-sky-500/50",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Files",
      description:
        "Drag and drop or click to upload your PDF files or images to NexPress.",
    },
    {
      number: "02",
      title: "Choose Operation",
      description:
        "Select the operation you want: compress, merge, encrypt, extract, or OCR.",
    },
    {
      number: "03",
      title: "Adjust Settings",
      description:
        "Customize compression levels, add passwords, or select OCR language settings.",
    },
    {
      number: "04",
      title: "Process & Download",
      description:
        "Click process and download your optimized result in seconds.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Decor - Animated */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/25 dark:bg-indigo-900/20 blur-[120px]"
        />
        <Motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/25 dark:bg-blue-900/10 blur-[120px]"
        />
      </div>

      {/* Hero Section */}
      <Motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 container mx-auto px-6 pt-32 pb-24 md:pt-40"
      >
        <div className="text-center max-w-4xl mx-auto mb-24">
          <Motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center p-2 mb-8 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full backdrop-blur-sm"
          >
            <span className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              NexPress OCR is now available! Convert images to text.
            </span>
          </Motion.div>

          <Motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight"
          >
            Next Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
              PDF & OCR Editor
            </span>
          </Motion.h1>

          <Motion.p
            variants={itemVariants}
            className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Compress, merge, protect, and extract text with professional-grade
            tools. Fast, secure, and completely free to use.
          </Motion.p>

          <Motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/pdf-edit">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex h-14  items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
              >
                <span className="mr-2 ml-2 pt-2 pb-2 ">Get Started Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Motion.button>
            </Link>
          </Motion.div>
        </div>

        {/* Features Grid */}
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <Motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
            >
              Powerful Features
            </Motion.h2>
            <Motion.p variants={itemVariants} className="text-slate-500 dark:text-slate-400">
              Everything you need to manage and transform your documents
            </Motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 ${feature.border}`}
              >
                <div
                  className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-lg flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        {/* How It Works */}
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-32"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <Motion.h2
                variants={itemVariants}
                className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
              >
                How It Works
              </Motion.h2>
              <Motion.p
                variants={itemVariants}
                className="text-slate-500 dark:text-slate-400 text-lg"
              >
                Transform your PDFs in just four simple steps
              </Motion.p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Motion.div
                key={index}
                variants={itemVariants}
                onMouseEnter={() => setActiveStep(index)}
                whileHover={{ scale: 1.02 }}
                className={`group relative p-6 rounded-xl border transition-all duration-300 cursor-default ${
                  activeStep === index
                    ? "bg-indigo-500/5 border-indigo-500/30"
                    : "bg-white/60 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`text-5xl font-bold mb-6 opacity-20 transition-colors ${
                    activeStep === index ? "text-indigo-500" : "text-slate-600"
                  }`}
                >
                  {step.number}
                </div>
                <h3
                  className={`text-lg font-bold mb-3 transition-colors ${
                    activeStep === index ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        {/* Tutorial Section - Split Layout */}
        <Motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden mb-24"
        >
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12 tracking-tight">
              Quick Tutorial
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <Motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                className="space-y-8"
              >
                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Optical Character Recognition (OCR)
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pl-8">
                    Upload any image or scanned PDF. NexPress will analyze the
                    visual data and convert it into selectable, editable text
                    that you can copy or export to a document instantly.
                  </p>
                </Motion.div>
                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Merging Multiple PDFs
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pl-8">
                    Upload multiple PDF files, drag to reorder them as needed,
                    and click merge. All original formatting, bookmarks, and
                    hyperlinks are preserved in the final document.
                  </p>
                </Motion.div>
              </Motion.div>

              <Motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                className="space-y-8"
              >
                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Adding Security
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pl-8">
                    Protect your documents by adding password encryption. You
                    can also remove passwords from PDFs by providing the correct
                    key. Your files are processed securely.
                  </p>
                </Motion.div>
                <Motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Compressing PDFs
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pl-8">
                    Upload your PDF and choose from three compression levels.
                    NexPress intelligently optimizes images and removes
                    redundant data while maintaining high readability.
                  </p>
                </Motion.div>
              </Motion.div>
            </div>
          </div>
        </Motion.div>

        {/* CTA Section */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/60 dark:from-indigo-900/50 to-blue-200/60 dark:to-blue-900/50" />
          <div className="relative px-6 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-xl mx-auto">
              Join thousands of users who trust NexPress for their PDF and OCR
              needs. No credit card required.
            </p>
            <Link to="/pdf-edit">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-slate-950 px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-200 transition-colors shadow-xl shadow-indigo-900/20"
              >
                Start Using NexPress
              </Motion.button>
            </Link>
          </div>
        </Motion.div>
      </Motion.div>
    </div>
  );
};

export default Home;
