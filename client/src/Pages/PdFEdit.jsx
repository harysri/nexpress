// import React, { useState, useEffect } from "react";
// import {
//   Minimize2,
//   Layers,
//   Lock,
//   FileImage,
//   Image,
//   ArrowRight,
//   MousePointerClick,
// } from "lucide-react";

// const PDFEdit = () => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   // Tools updated to match the Home page color schema exactly for consistency
//   const tools = [
//     {
//       id: "compress",
//       path: "/compress",
//       name: "Compress PDF",
//       icon: <Minimize2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
//       description: "Reduce PDF file size with adjustable compression levels",
//       color: "text-emerald-400",
//       bg: "bg-emerald-500/10",
//       border: "hover:border-emerald-500/50",
//       hoverText: "group-hover:text-emerald-300",
//     },
//     {
//       id: "merge",
//       path: "/merge",
//       name: "Merge PDFs",
//       icon: <Layers className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
//       description: "Combine multiple PDFs into one document",
//       color: "text-blue-400",
//       bg: "bg-blue-500/10",
//       border: "hover:border-blue-500/50",
//       hoverText: "group-hover:text-blue-300",
//     },
//     {
//       id: "protect",
//       path: "/protect",
//       name: "Password Protection",
//       icon: <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
//       description: "Protect your PDF with password encryption",
//       color: "text-rose-400",
//       bg: "bg-rose-500/10",
//       border: "hover:border-rose-500/50",
//       hoverText: "group-hover:text-rose-300",
//     },
//     {
//       id: "extract",
//       path: "/extract-images",
//       name: "Extract Images",
//       icon: <Image className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
//       description: "Extract all images from your PDF",
//       color: "text-amber-400",
//       bg: "bg-amber-500/10",
//       border: "hover:border-amber-500/50",
//       hoverText: "group-hover:text-amber-300",
//     },
//     {
//       id: "convert",
//       path: "/images-to-pdf",
//       name: "Images to PDF",
//       icon: <FileImage className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
//       description: "Convert images to PDF format",
//       color: "text-violet-400",
//       bg: "bg-violet-500/10",
//       border: "hover:border-violet-500/50",
//       hoverText: "group-hover:text-violet-300",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans">
//       {/* Background Decor - Matching Home Page */}
//       <div className="fixed inset-0 z-0 pointer-events-none">
//         <div className="absolute top-[-10%] left-[-10%] w-[50%] sm:w-[45%] md:w-[40%] h-[50%] sm:h-[45%] md:h-[40%] rounded-full bg-indigo-900/20 blur-[100px] sm:blur-[120px]" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] sm:w-[45%] md:w-[40%] h-[50%] sm:h-[45%] md:h-[40%] rounded-full bg-blue-900/10 blur-[100px] sm:blur-[120px]" />
//       </div>

//       <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-12 sm:pb-16 md:pb-20 max-w-7xl">
//         {/* Header */}
//         <div
//           className={`text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ${
//             isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
//           }`}
//         >
//           <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 tracking-tight px-4">
//             Advanced PDF Editor
//           </h1>
//           <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto px-4">
//             Select a tool below to begin processing your documents. Secure,
//             fast, and professional.
//           </p>
//         </div>

//         {/* Features Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-16 sm:mb-20 md:mb-24">
//           {tools.map((tool, index) => (
//             <a
//               key={tool.id}
//               href={tool.path}
//               className={`group relative bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-7 md:p-8 border border-slate-800 transition-all duration-500 hover:bg-slate-800/50 hover:-translate-y-1 hover:shadow-xl ${
//                 tool.border
//               } active:scale-95 ${
//                 isVisible
//                   ? "opacity-100 translate-y-0"
//                   : "opacity-0 translate-y-8"
//               }`}
//               style={{ transitionDelay: `${index * 100}ms` }}
//             >
//               <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
//                 <div
//                   className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${tool.bg} ${tool.color} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
//                 >
//                   {tool.icon}
//                 </div>
//                 <ArrowRight
//                   className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 transition-all duration-300 group-hover:translate-x-1 ${tool.hoverText}`}
//                 />
//               </div>

//               <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
//                 {tool.name}
//               </h3>

//               <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 md:mb-6">
//                 {tool.description}
//               </p>

//               <div
//                 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-slate-500 transition-colors ${tool.hoverText}`}
//               >
//                 <MousePointerClick className="w-3 h-3" />
//                 Select Tool
//               </div>
//             </a>
//           ))}
//         </div>

//         {/* How It Works - Simplified & Professional */}
//         <div className="border-t border-slate-800 pt-12 sm:pt-16 md:pt-20">
//           <div className="text-center mb-8 sm:mb-10 md:mb-12">
//             <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 tracking-tight px-4">
//               Workflow
//             </h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8 max-w-5xl mx-auto px-4">
//             {[
//               {
//                 number: "1",
//                 title: "Choose Tool",
//                 description:
//                   "Select the specific operation for your document needs",
//               },
//               {
//                 number: "2",
//                 title: "Upload & Process",
//                 description:
//                   "Drag & drop files. Processing happens securely in your browser",
//               },
//               {
//                 number: "3",
//                 title: "Download",
//                 description:
//                   "Get your optimized files instantly with a single click",
//               },
//             ].map((step, index) => (
//               <div
//                 key={index}
//                 className="text-center group transition-all duration-300 hover:-translate-y-2"
//               >
//                 <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 border border-slate-700 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 text-lg sm:text-xl font-bold group-hover:border-indigo-500 group-hover:text-indigo-400 transition-all duration-300 group-hover:scale-110">
//                   {step.number}
//                 </div>
//                 <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
//                   {step.title}
//                 </h3>
//                 <p className="text-slate-400 text-sm sm:text-base">
//                   {step.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PDFEdit;

import React, { useState, useEffect } from "react";
import {
  Minimize2,
  Layers,
  Lock,
  FileImage,
  Image,
  Type, // Added for OCR
  ArrowRight,
  MousePointerClick,
} from "lucide-react";

const PDFEdit = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const tools = [
    {
      id: "ocr",
      path: "/image-to-text",
      name: "Image to Text (OCR)",
      icon: <Type className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      description: "Extract editable text from images and scanned documents",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "hover:border-indigo-500/50",
      hoverText: "group-hover:text-indigo-300",
    },
    {
      id: "compress",
      path: "/compress",
      name: "Compress PDF",
      icon: <Minimize2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      description: "Reduce PDF file size with adjustable compression levels",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/50",
      hoverText: "group-hover:text-emerald-300",
    },
    {
      id: "merge",
      path: "/merge",
      name: "Merge PDFs",
      icon: <Layers className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      description: "Combine multiple PDFs into one document",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50",
      hoverText: "group-hover:text-blue-300",
    },
    {
      id: "protect",
      path: "/protect",
      name: "Password Protection",
      icon: <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      description: "Protect your PDF with password encryption",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/50",
      hoverText: "group-hover:text-rose-300",
    },
    {
      id: "extract",
      path: "/extract-images",
      name: "Extract Images",
      icon: <Image className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      description: "Extract all images from your PDF",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/50",
      hoverText: "group-hover:text-amber-300",
    },
    {
      id: "convert",
      path: "/images-to-pdf",
      name: "Images to PDF",
      icon: <FileImage className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      description: "Convert images to PDF format",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "hover:border-violet-500/50",
      hoverText: "group-hover:text-violet-300",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans">
      {/* Background Decor - Matching Home Page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] sm:w-[45%] md:w-[40%] h-[50%] sm:h-[45%] md:h-[40%] rounded-full bg-indigo-900/20 blur-[100px] sm:blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] sm:w-[45%] md:w-[40%] h-[50%] sm:h-[45%] md:h-[40%] rounded-full bg-blue-900/10 blur-[100px] sm:blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-12 sm:pb-16 md:pb-20 max-w-7xl">
        {/* Header */}
        <div
          className={`text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 tracking-tight px-4">
            Advanced PDF & Text Tools
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto px-4">
            Select a tool below to begin processing your documents. Secure,
            fast, and professional.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-16 sm:mb-20 md:mb-24">
          {tools.map((tool, index) => (
            <a
              key={tool.id}
              href={tool.path}
              className={`group relative bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-7 md:p-8 border border-slate-800 transition-all duration-500 hover:bg-slate-800/50 hover:-translate-y-1 hover:shadow-xl ${
                tool.border
              } active:scale-95 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${tool.bg} ${tool.color} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  {tool.icon}
                </div>
                <ArrowRight
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 transition-all duration-300 group-hover:translate-x-1 ${tool.hoverText}`}
                />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                {tool.name}
              </h3>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 md:mb-6">
                {tool.description}
              </p>

              <div
                className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-slate-500 transition-colors ${tool.hoverText}`}
              >
                <MousePointerClick className="w-3 h-3" />
                Select Tool
              </div>
            </a>
          ))}
        </div>

        {/* Workflow */}
        <div className="border-t border-slate-800 pt-12 sm:pt-16 md:pt-20">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 tracking-tight px-4">
              Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8 max-w-5xl mx-auto px-4">
            {[
              {
                number: "1",
                title: "Choose Tool",
                description:
                  "Select the specific operation for your document or image needs",
              },
              {
                number: "2",
                title: "Upload & Process",
                description:
                  "Drag & drop files. Processing happens securely in your browser",
              },
              {
                number: "3",
                title: "Download",
                description:
                  "Get your optimized files or text results instantly with a single click",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center group transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 border border-slate-700 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 text-lg sm:text-xl font-bold group-hover:border-indigo-500 group-hover:text-indigo-400 transition-all duration-300 group-hover:scale-110">
                  {step.number}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFEdit;
