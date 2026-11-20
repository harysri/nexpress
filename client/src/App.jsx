import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// Route-level code splitting: the landing page no longer ships pdf.js,
// pdf-lib or Tesseract.
const Home = lazy(() => import("./Pages/Home.jsx"));
const ToolsHub = lazy(() => import("./Pages/ToolsHub.jsx"));
const CompressPDF = lazy(() => import("./Pages/CompressPDF.jsx"));
const MergePDF = lazy(() => import("./Pages/MergePDF.jsx"));
const OrganizePDF = lazy(() => import("./Pages/OrganizePDF.jsx"));
const SplitPDF = lazy(() => import("./Pages/SplitPDF.jsx"));
const ProtectPDF = lazy(() => import("./Pages/ProtectPDF.jsx"));
const WatermarkPDF = lazy(() => import("./Pages/WatermarkPDF.jsx"));
const SignPDF = lazy(() => import("./Pages/SignPDF.jsx"));
const ExtractImages = lazy(() => import("./Pages/ExtractImages.jsx"));
const ImagesToPDF = lazy(() => import("./Pages/ImagesToPDF.jsx"));
const PDFToImages = lazy(() => import("./Pages/PDFToImages.jsx"));
const ImageToText = lazy(() => import("./Pages/ImageToText.jsx"));
const NotFound = lazy(() => import("./Pages/NotFound.jsx"));

const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" aria-hidden="true" />
    <span className="sr-only">Loading tool…</span>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div id="main-content" className="flex-1">
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pdf-edit" element={<ToolsHub />} />
                <Route path="/compress" element={<CompressPDF />} />
                <Route path="/merge" element={<MergePDF />} />
                <Route path="/organize" element={<OrganizePDF />} />
                <Route path="/split" element={<SplitPDF />} />
                <Route path="/protect" element={<ProtectPDF />} />
                <Route path="/watermark" element={<WatermarkPDF />} />
                <Route path="/sign" element={<SignPDF />} />
                <Route path="/extract-images" element={<ExtractImages />} />
                <Route path="/images-to-pdf" element={<ImagesToPDF />} />
                <Route path="/pdf-to-images" element={<PDFToImages />} />
                <Route path="/image-to-text" element={<ImageToText />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
