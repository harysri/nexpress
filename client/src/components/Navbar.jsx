import React, { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  const tools = [
    { name: "Compress PDF", to: "/compress" },
    { name: "Merge PDF", to: "/merge" },
    { name: "Password Protection", to: "/protect" },
    { name: "Extract Images", to: "/extract-images" },
    { name: "Images to PDF", to: "/images-to-pdf" },
    { name: "Image to Text", to: "/image-to-text" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            {/* <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-md shadow-lg shadow-indigo-500/20 mr-2 sm:mr-3 group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div> */}
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 dark:bg-indigo-950 rounded-md shadow-lg shadow-indigo-500/20 mr-2 sm:mr-3 group-hover:scale-105 transition-transform duration-300 border border-cyan-500/30">
              <svg
                className="w-4/5 h-4/5"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="uiPdfGradient"
                    x1="12"
                    y1="10"
                    x2="19"
                    y2="14"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>

                  <linearGradient
                    id="uiPdfGradientLight"
                    x1="12"
                    y1="10"
                    x2="19"
                    y2="14"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                <path
                  className="text-cyan-600 dark:text-cyan-400"
                  d="M10 6H22V16L18 20H10V6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                <text
                  x="12"
                  y="14"
                  fontFamily="sans-serif"
                  fontSize="6"
                  fontWeight="bold"
                  fill="url(#uiPdfGradient)"
                  className="dark:fill-[url(#uiPdfGradient)] fill-[url(#uiPdfGradientLight)]"
                >
                  PD
                  <tspan className="fill-red-500 dark:fill-[#ff455b]">F</tspan>
                </text>

                {/* Pencil Icon (The Editing Element) */}
                <g
                  className="text-indigo-600 dark:text-cyan-400"
                  fill="currentColor"
                >
                  <path d="M22 18L26 14L28 16L24 20L22 18Z" />
                  <rect
                    x="22"
                    y="18"
                    width="1.5"
                    height="4"
                    transform="rotate(-45 22 18)"
                  />
                </g>
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-indigo-100 transition-colors">
              NexPress
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            >
              Home
            </Link>

            {/* Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsToolsDropdownOpen(true)}
              onMouseLeave={() => setIsToolsDropdownOpen(false)}
            >
              <button className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 group">
                Tools
                <ChevronDown
                  className={`w-4 h-4 ml-1 text-slate-500 group-hover:text-white transition-transform duration-200 ${
                    isToolsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isToolsDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-64">
                  <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden ring-1 ring-black/5">
                    <div className="p-2 space-y-1">
                      {tools.map((tool, index) => (
                        <Link
                          key={index}
                          to={tool.to}
                          className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                        >
                          {tool.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-300 p-2 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 rounded-2xl mt-2 mb-4 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium text-base"
              >
                Home
              </Link>

              {/* Mobile Tools Section */}
              <div>
                <button
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className="flex items-center justify-between w-full text-slate-300 hover:text-white transition-colors duration-200 font-medium text-base active:scale-98"
                >
                  Tools
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isToolsDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isToolsDropdownOpen && (
                  <div className="mt-3 sm:mt-4 ml-3 sm:ml-4 space-y-2 sm:space-y-3 border-l-2 border-slate-800 pl-3 sm:pl-4">
                    {tools.map((tool, index) => (
                      <Link
                        key={index}
                        to={tool.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-slate-400 hover:text-indigo-400 transition-colors duration-200 text-sm py-1 active:text-indigo-300"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
