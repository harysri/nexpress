import React, { useState } from "react";
import {
  Lock,
  Image,
  FileImage,
  Minimize2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Type, // Added for OCR
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [activeStep, setActiveStep] = useState(0);

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
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50",
    },
    {
      icon: <Minimize2 className="w-6 h-6" />,
      title: "Compress PDF",
      description:
        "Reduce PDF file size with adjustable compression levels without losing quality.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/50",
    },
    {
      icon: <Type className="w-6 h-6" />, // New OCR Feature
      title: "Image to Text (OCR)",
      description:
        "Extract editable text from scanned documents or images using advanced optical character recognition.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "hover:border-indigo-500/50",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Password Protection",
      description:
        "Encrypt your PDFs with password protection or remove existing passwords securely.",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/50",
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "Extract Images",
      description:
        "Extract all embedded images from your PDF documents in high quality.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/50",
    },
    {
      icon: <FileImage className="w-6 h-6" />,
      title: "Images to PDF",
      description:
        "Convert JPG/PNG images into new PDFs or append them to existing documents.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "hover:border-violet-500/50",
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
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Decor - Animated */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]"
        />
      </div>

      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 container mx-auto px-6 pt-32 pb-24 md:pt-40"
      >
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center p-2 mb-8 bg-slate-900/50 border border-slate-800 rounded-full backdrop-blur-sm"
          >
            <span className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              NexPress OCR is now available! Convert images to text.
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight"
          >
            Next Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              PDF & OCR Editor
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Compress, merge, protect, and extract text with professional-grade
            tools. Fast, secure, and completely free to use.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/pdf-edit">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex h-14  items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span className="mr-2 ml-2 pt-2 pb-2 ">Get Started Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-white mb-4 tracking-tight"
            >
              Powerful Features
            </motion.h2>
            <motion.p variants={itemVariants} className="text-slate-400">
              Everything you need to manage and transform your documents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 transition-colors duration-300 hover:bg-slate-800/50 ${feature.border}`}
              >
                <div
                  className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-lg flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-32"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold text-white mb-4 tracking-tight"
              >
                How It Works
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-slate-400 text-lg"
              >
                Transform your PDFs in just four simple steps
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                onMouseEnter={() => setActiveStep(index)}
                whileHover={{ scale: 1.02 }}
                className={`group relative p-6 rounded-xl border transition-all duration-300 cursor-default ${
                  activeStep === index
                    ? "bg-indigo-500/5 border-indigo-500/30"
                    : "bg-slate-900/20 border-slate-800 hover:border-slate-700"
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
                    activeStep === index ? "text-white" : "text-slate-200"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tutorial Section - Split Layout */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-24"
        >
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white text-center mb-12 tracking-tight">
              Quick Tutorial
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                className="space-y-8"
              >
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Optical Character Recognition (OCR)
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Upload any image or scanned PDF. NexPress will analyze the
                    visual data and convert it into selectable, editable text
                    that you can copy or export to a document instantly.
                  </p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Merging Multiple PDFs
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Upload multiple PDF files, drag to reorder them as needed,
                    and click merge. All original formatting, bookmarks, and
                    hyperlinks are preserved in the final document.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                className="space-y-8"
              >
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Adding Security
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Protect your documents by adding password encryption. You
                    can also remove passwords from PDFs by providing the correct
                    key. Your files are processed securely.
                  </p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    Compressing PDFs
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Upload your PDF and choose from three compression levels.
                    NexPress intelligently optimizes images and removes
                    redundant data while maintaining high readability.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden border border-slate-800"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-blue-900/50" />
          <div className="relative px-6 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
              Join thousands of users who trust NexPress for their PDF and OCR
              needs. No credit card required.
            </p>
            <Link to="/pdf-edit">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-slate-950 px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-200 transition-colors shadow-xl shadow-indigo-900/20"
              >
                Start Using NexPress
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
