import React from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home.jsx";
import PDFEdit from "./Pages/PdFEdit.jsx";
import CompressPDF from "./Pages/CompressPDF.jsx";
import MergePDF from "./Pages/MergePDF.jsx";
import ProtectPDF from "./Pages/ProtectPDF.jsx";
import ImagesToPDF from "./Pages/ImagesToPDF.jsx";
import ExtractImages from "./Pages/ExtractImages.jsx";
import ImageToText from "./Pages/ImageToText.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf-edit" element={<PDFEdit />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/merge" element={<MergePDF />} />
          <Route path="/protect" element={<ProtectPDF />} />
          <Route path="/images-to-pdf" element={<ImagesToPDF />} />
          <Route path="/extract-images" element={<ExtractImages />} />
          <Route path="/image-to-text" element={<ImageToText />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
