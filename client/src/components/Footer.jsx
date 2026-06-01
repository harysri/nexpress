import React from "react";
import { Link } from "react-router-dom";
import { Mail, Github, Twitter, Linkedin, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    support: [
      { name: "Help Center", href: "#help" },
      { name: "Documentation", href: "#docs" },
      { name: "FAQ", href: "#faq" },
      { name: "Community", href: "#community" },
    ],
  };

  const tools = [
    { name: "Compress PDF", href: "/compress" },
    { name: "Merge PDF", href: "/merge" },
    { name: "Password Protection", href: "/protect" },
    { name: "Extract Images", href: "/extract-images" },
    { name: "Images to PDF", href: "/images-to-pdf" },
    { name: "Image to Text", href: "/image-to-text" },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800 pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 md:pb-10 overflow-hidden font-sans">
      {/* Background Decor - Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full bg-indigo-900/10 blur-[80px] sm:blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-14 md:mb-16">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              to="/"
              className="flex items-center group mb-4 sm:mb-5 md:mb-6"
            >
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 dark:bg-indigo-950 rounded-md shadow-lg shadow-indigo-500/20 mr-2.5 sm:mr-3 group-hover:scale-105 transition-transform duration-300 border border-cyan-500/30">
                <svg
                  className="w-4/5 h-4/5"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="uiPdfGradientFooter"
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
                      id="uiPdfGradientLightFooter"
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
                    fill="url(#uiPdfGradientFooter)"
                    className="dark:fill-[url(#uiPdfGradientFooter)] fill-[url(#uiPdfGradientLightFooter)]"
                  >
                    PD
                    <tspan className="fill-red-500 dark:fill-[#ff455b]">
                      F
                    </tspan>
                  </text>

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
            <p className="text-slate-400 mb-6 sm:mb-7 md:mb-8 max-w-sm text-sm sm:text-base leading-relaxed">
              Your trusted all-in-one PDF solution for compression, merging,
              encryption, and conversion. Built for speed, security, and
              simplicity.
            </p>
          </div>

          {/* Quick Links - Tools */}
          <div>
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-5 md:mb-6">
              PDF Tools
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {tools.map((tool, index) => (
                <li key={index}>
                  <Link
                    to={tool.href}
                    className="text-sm sm:text-base text-slate-400 hover:text-indigo-400 active:text-indigo-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors"></span>
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-5 md:mb-6">
              Support
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm sm:text-base text-slate-400 hover:text-indigo-400 active:text-indigo-300 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 sm:pt-7 md:pt-8 mt-6 sm:mt-7 md:mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-5 md:gap-6">
            <p className="text-slate-500 text-xs sm:text-sm flex items-center text-center md:text-left">
              © {currentYear} NexPress. Made with{" "}
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1 sm:mx-1.5 text-rose-500 fill-rose-500/20 animate-pulse" />
              for document efficiency.
              <sup className="text-xs italic font-semibold ml-1">HrS</sup>
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 md:gap-8">
              <Link
                to="#"
                className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 active:text-slate-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 active:text-slate-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 active:text-slate-400 transition-colors duration-200"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
