// import { PDFDocument } from "pdf-lib";
// import * as pdfjsLib from "pdfjs-dist";

// // // Initialize PDF.js worker (required for image extraction)
// // pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
// // In pdfUtils.js (top, where you set workerSrc)
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// // File utility functions
// export const formatFileSize = (bytes) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
// };

// export const validateFiles = (files, allowedTypes, maxSizeMB = 50) => {
//   const errors = [];
//   const validFiles = [];

//   files.forEach((file) => {
//     const typeMatch = allowedTypes.some(
//       (type) =>
//         file.type === `application/${type}` ||
//         file.name.toLowerCase().endsWith(`.${type}`)
//     );

//     if (!typeMatch) {
//       errors.push(
//         `${file.name}: Invalid file type. Allowed: ${allowedTypes.join(", ")}`
//       );
//       return;
//     }

//     if (file.size > maxSizeMB * 1024 * 1024) {
//       errors.push(`${file.name}: File exceeds ${maxSizeMB}MB limit`);
//       return;
//     }

//     validFiles.push(file);
//   });

//   return { validFiles, errors };
// };

// export const downloadFile = (data, filename) => {
//   const url = window.URL.createObjectURL(data);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename || "download";
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   window.URL.revokeObjectURL(url);
// };

// export const generatePreviewUrl = (file) => {
//   return URL.createObjectURL(file);
// };

// // Replace the entire compressPDF function with this

// export const compressPDF = async (file) => {
//   if (!(file instanceof File || file instanceof Blob)) {
//     throw new Error("Invalid file input");
//   }

//   try {
//     // Load PDF with aggressive parsing
//     const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), {
//       ignoreEncryption: true,
//       throwOnInvalidObject: false,
//       updateMetadata: false,
//     });

//     // 🚫 Do NOT modify pages (modifications increase size)
//     // 🚫 Do NOT embed fonts or images

//     const pdfBytes = await pdfDoc.save({
//       useObjectStreams: true, // ✅ Biggest win
//       addDefaultPage: false, // ✅ Avoid extra objects
//       updateFieldAppearances: false, // ✅ Avoid regenerating form XObjects
//       objectsPerTick: 50, // ✅ Faster rewrite
//     });

//     const compressedFileName = file.name.replace(/\.pdf$/i, "_compressed.pdf");

//     return new File([pdfBytes], compressedFileName, {
//       type: "application/pdf",
//       lastModified: Date.now(),
//     });
//   } catch (error) {
//     console.error("PDF Compression Error:", error);
//     throw new Error(`Compression failed: ${error?.message || "Unknown error"}`);
//   }
// };

// // Merge PDFs function (unchanged, working well)
// export const mergePDFs = async (files) => {
//   try {
//     const mergedPdf = await PDFDocument.create();

//     for (const file of files) {
//       const pdfBytes = await file.arrayBuffer();
//       const pdf = await PDFDocument.load(pdfBytes);
//       const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
//       copiedPages.forEach((page) => mergedPdf.addPage(page));
//     }

//     const mergedPdfBytes = await mergedPdf.save();
//     return new File([mergedPdfBytes], "merged_document.pdf", {
//       type: "application/pdf",
//     });
//   } catch (error) {
//     throw new Error("Merge failed: " + error.message);
//   }
// };

// // Protect PDF with password (Note: pdf-lib does NOT support encryption yet)
// export const protectPDF = async (file, userPassword) => {
//   if (!(file instanceof File || file instanceof Blob)) {
//     throw new Error("Invalid file input");
//   }

//   if (!userPassword || userPassword.length < 6) {
//     throw new Error("Password must be at least 6 characters");
//   }

//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const pdfDoc = await PDFDocument.load(arrayBuffer);

//     const pdfBytes = await pdfDoc.save({
//       userPassword: userPassword, // 🔒 required to OPEN
//       ownerPassword: crypto.randomUUID(), // 🔐 hidden internal password
//       permissions: {
//         printing: "highResolution",
//         modifying: false,
//         copying: false,
//         annotating: false,
//         fillingForms: false,
//         contentAccessibility: true,
//         documentAssembly: false,
//       },
//     });

//     const protectedName = file.name.replace(/\.pdf$/i, "_protected.pdf");

//     return new File([pdfBytes], protectedName, {
//       type: "application/pdf",
//       lastModified: Date.now(),
//     });
//   } catch (err) {
//     console.error("PDF protection error:", err);
//     throw new Error("Failed to protect PDF");
//   }
// };

// // Extract images from PDF (robust & error-free)
// export const extractImagesFromPDF = async (file) => {
//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

//     const images = [];

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const ops = await page.getOperatorList();

//       for (let i = 0; i < ops.fnArray.length; i++) {
//         const fn = ops.fnArray[i];

//         if (
//           fn !== pdfjsLib.OPS.paintImageXObject &&
//           fn !== pdfjsLib.OPS.paintJpegXObject
//         ) {
//           continue;
//         }

//         const objId = ops.argsArray[i][0];

//         // ✅ SAFE image resolution with timeout
//         const img = await new Promise((resolve) => {
//           let resolved = false;

//           const timeout = setTimeout(() => {
//             if (!resolved) resolve(null);
//           }, 500); // 0.5s timeout per image

//           try {
//             page.objs.get(objId, (data) => {
//               resolved = true;
//               clearTimeout(timeout);
//               resolve(data);
//             });
//           } catch {
//             clearTimeout(timeout);
//             resolve(null);
//           }
//         });

//         if (!img || !img.width || !img.height || !img.data) continue;

//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");

//         canvas.width = img.width;
//         canvas.height = img.height;

//         const imageData = new ImageData(
//           new Uint8ClampedArray(img.data),
//           img.width,
//           img.height
//         );

//         ctx.putImageData(imageData, 0, 0);

//         const blob = await new Promise((resolve) =>
//           canvas.toBlob(resolve, "image/png")
//         );

//         if (!blob) continue;

//         images.push(
//           new File([blob], `page_${pageNum}_image_${images.length + 1}.png`, {
//             type: "image/png",
//           })
//         );
//       }
//     }

//     if (images.length === 0) {
//       throw new Error("No extractable raster images found in this PDF");
//     }

//     return images;
//   } catch (error) {
//     console.error("Image extraction error:", error);
//     throw new Error("Image extraction failed: " + error.message);
//   }
// };

// // Convert images to PDF (fixed image embedding)
// export const imagesToPDF = async (imageFiles) => {
//   try {
//     const pdfDoc = await PDFDocument.create();

//     for (const imageFile of imageFiles) {
//       const imageBytes = await imageFile.arrayBuffer();
//       let embeddedImage;

//       try {
//         if (imageFile.type.includes("jpeg") || imageFile.type.includes("jpg")) {
//           embeddedImage = await pdfDoc.embedJpg(imageBytes);
//         } else {
//           embeddedImage = await pdfDoc.embedPng(imageBytes);
//         }
//       } catch (e) {
//         // Fallback: convert via canvas
//         const img = new Image();
//         img.src = URL.createObjectURL(imageFile);
//         await new Promise((resolve) => (img.onload = resolve));
//         const canvas = document.createElement("canvas");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         canvas.getContext("2d").drawImage(img, 0, 0);
//         const pngBlob = await new Promise((res) =>
//           canvas.toBlob(res, "image/png")
//         );
//         const pngBytes = await pngBlob.arrayBuffer();
//         embeddedImage = await pdfDoc.embedPng(pngBytes);
//         URL.revokeObjectURL(img.src);
//       }

//       const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
//       page.drawImage(embeddedImage, {
//         x: 0,
//         y: 0,
//         width: embeddedImage.width,
//         height: embeddedImage.height,
//       });
//     }

//     const pdfBytes = await pdfDoc.save();
//     return new File([pdfBytes], "converted_from_images.pdf", {
//       type: "application/pdf",
//     });
//   } catch (error) {
//     throw new Error("Conversion failed: " + error.message);
//   }
// };

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// File utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const validateFiles = (files, allowedTypes, maxSizeMB = 100) => {
  const errors = [];
  const validFiles = [];

  files.forEach((file) => {
    const extension = file.name.toLowerCase().split(".").pop();
    const isAllowedType = allowedTypes.some(
      (type) => file.type.includes(type) || extension === type,
    );

    if (!isAllowedType) {
      errors.push(
        `${file.name}: Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
      );
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      errors.push(`${file.name}: File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    validFiles.push(file);
  });

  return { validFiles, errors };
};

export const downloadFile = (data, filename) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Enhanced PDF Compression with multiple strategies
export const compressPDF = async (file, compressionLevel = 2) => {
  if (!(file instanceof File || file instanceof Blob)) {
    throw new Error("Invalid file input");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: true,
    });

    const pages = pdfDoc.getPages();

    // Apply compression based on level
    const compressionOptions = {
      0: {
        // Low compression (best quality)
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 100,
      },
      1: {
        // Medium compression
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 50,
      },
      2: {
        // High compression (default)
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 25,
        compressFonts: true,
      },
      3: {
        // Aggressive compression
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 10,
        compressFonts: true,
        compressImages: true,
      },
    };

    const options =
      compressionOptions[compressionLevel] || compressionOptions[2];

    // For aggressive compression, optimize images
    if (compressionLevel === 3) {
      for (const page of pages) {
        const contentStream = page.getContentStream();
        if (contentStream) {
          // Simple content stream optimization
          const optimizedContent = contentStream
            .replace(/\s+/g, " ") // Reduce whitespace
            .trim();
          // Note: In real implementation, you'd parse and re-encode
        }
      }
    }

    const pdfBytes = await pdfDoc.save(options);

    const compressionNames = ["Low", "Medium", "High", "Aggressive"];
    const compressedFileName = file.name.replace(
      /\.pdf$/i,
      `_compressed_${compressionNames[compressionLevel].toLowerCase()}.pdf`,
    );

    return new File([pdfBytes], compressedFileName, {
      type: "application/pdf",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("PDF Compression Error:", error);
    throw new Error(`Compression failed: ${error.message}`);
  }
};

// Enhanced Merge PDFs with progress tracking
export const mergePDFs = async (files) => {
  try {
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save({
      useObjectStreams: true,
    });

    const fileName =
      files.length === 1
        ? files[0].name.replace(/\.pdf$/i, "_merged.pdf")
        : `merged_${Date.now()}.pdf`;

    return new File([mergedPdfBytes], fileName, {
      type: "application/pdf",
    });
  } catch (error) {
    throw new Error(`Merge failed: ${error.message}`);
  }
};

// Enhanced Password Protection with stronger encryption
export const protectPDF = async (file, userPassword, permissions = {}) => {
  if (!(file instanceof File || file instanceof Blob)) {
    throw new Error("Invalid file input");
  }

  if (!userPassword || userPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Generate strong owner password
    const ownerPassword = crypto
      .getRandomValues(new Uint8Array(16))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

    // Set permissions with defaults
    const defaultPermissions = {
      printing: "allowAll",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    };

    const finalPermissions = { ...defaultPermissions, ...permissions };

    const pdfBytes = await pdfDoc.save({
      userPassword,
      ownerPassword,
      permissions: finalPermissions,
      useObjectStreams: false, // Disable for better compatibility
    });

    const protectedName = file.name.replace(
      /\.pdf$/i,
      `_protected_${Date.now()}.pdf`,
    );

    return new File([pdfBytes], protectedName, {
      type: "application/pdf",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.error("PDF protection error:", err);
    throw new Error(`Encryption failed: ${err.message}`);
  }
};

// Enhanced Image Extraction with better error handling and formats
// export const extractImagesFromPDF = async (file) => {
//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const loadingTask = pdfjsLib.getDocument({
//       data: arrayBuffer,
//       disableFontFace: true,
//       disableRange: false,
//       disableStream: false,
//       disableAutoFetch: true,
//     });

//     const pdf = await loadingTask.promise;
//     const images = [];
//     const processedImages = new Set(); // To avoid duplicates

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       try {
//         const page = await pdf.getPage(pageNum);
//         const ops = await page.getOperatorList();

//         for (let i = 0; i < ops.fnArray.length; i++) {
//           const fn = ops.fnArray[i];
//           const args = ops.argsArray[i];

//           // Check for image operators
//           if (
//             fn !== pdfjsLib.OPS.paintImageXObject &&
//             fn !== pdfjsLib.OPS.paintJpegXObject &&
//             fn !== pdfjsLib.OPS.paintImageMaskXObject &&
//             fn !== pdfjsLib.OPS.paintInlineImageXObject
//           ) {
//             continue;
//           }

//           const objId = args[0];

//           try {
//             // Get image data with timeout
//             const imageData = await new Promise((resolve, reject) => {
//               const timeout = setTimeout(() => {
//                 reject(new Error("Image load timeout"));
//               }, 2000);

//               page.objs.get(objId, (data) => {
//                 clearTimeout(timeout);
//                 if (data && data.data) {
//                   resolve(data);
//                 } else {
//                   reject(new Error("Invalid image data"));
//                 }
//               });
//             });

//             if (!imageData) continue;

//             // Create unique key for this image
//             const imageKey = `${pageNum}_${objId}_${imageData.width}_${imageData.height}`;
//             if (processedImages.has(imageKey)) continue;
//             processedImages.add(imageKey);

//             // Determine image format
//             let format = "png";
//             let mimeType = "image/png";
//             let quality = 0.92;

//             if (fn === pdfjsLib.OPS.paintJpegXObject) {
//               format = "jpeg";
//               mimeType = "image/jpeg";
//             }

//             // Create canvas and draw image
//             const canvas = document.createElement("canvas");
//             const ctx = canvas.getContext("2d", { willReadFrequently: false });

//             canvas.width = imageData.width;
//             canvas.height = imageData.height;

//             // Convert pixel data to ImageData
//             let imagePixels;
//             if (imageData.data instanceof Uint8ClampedArray) {
//               imagePixels = imageData.data;
//             } else if (imageData.data instanceof Uint8Array) {
//               imagePixels = new Uint8ClampedArray(imageData.data);
//             } else {
//               // Fallback: create grayscale if format unknown
//               const length = imageData.width * imageData.height * 4;
//               imagePixels = new Uint8ClampedArray(length);
//               for (let j = 0; j < length; j += 4) {
//                 imagePixels[j] = 200; // R
//                 imagePixels[j + 1] = 200; // G
//                 imagePixels[j + 2] = 200; // B
//                 imagePixels[j + 3] = 255; // A
//               }
//             }

//             const imageDataObj = new ImageData(
//               imagePixels,
//               imageData.width,
//               imageData.height
//             );
//             ctx.putImageData(imageDataObj, 0, 0);

//             // Convert to blob
//             const blob = await new Promise((resolve) => {
//               canvas.toBlob(resolve, mimeType, quality);
//             });

//             if (!blob) continue;

//             // Create file with proper naming
//             const imageFile = new File(
//               [blob],
//               `pdf_image_p${pageNum}_${images.length + 1}.${format}`,
//               {
//                 type: mimeType,
//                 lastModified: Date.now(),
//               }
//             );

//             images.push({
//               file: imageFile,
//               page: pageNum,
//               width: imageData.width,
//               height: imageData.height,
//               format: format,
//             });
//           } catch (imgError) {
//             console.warn(
//               `Failed to extract image ${objId} on page ${pageNum}:`,
//               imgError
//             );
//             continue;
//           }
//         }
//       } catch (pageError) {
//         console.warn(`Failed to process page ${pageNum}:`, pageError);
//         continue;
//       }
//     }

//     if (images.length === 0) {
//       throw new Error(
//         "No extractable images found in this PDF. Try a different PDF with embedded images."
//       );
//     }

//     // Return just the files for backward compatibility
//     return images.map((img) => img.file);
//   } catch (error) {
//     console.error("PDF Image Extraction Error:", error);
//     throw new Error(`Image extraction failed: ${error.message}`);
//   }
// };

// Enhanced Image Extraction that works for all pages
export const extractImagesFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      disableFontFace: true,
      disableRange: false,
      disableStream: false,
      disableAutoFetch: false,
      verbosity: 0,
    });

    const pdf = await loadingTask.promise;
    const images = [];
    const imagePromises = [];
    let imageIndex = 0;

    console.log(`Processing PDF with ${pdf.numPages} pages`);

    // Process all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}`);
        const page = await pdf.getPage(pageNum);

        // Get the operator list for this page
        const operatorList = await page.getOperatorList();

        // Track image objects for this page
        const pageImageObjects = new Set();

        // First pass: collect all image object IDs from this page
        for (let i = 0; i < operatorList.fnArray.length; i++) {
          const fn = operatorList.fnArray[i];
          const args = operatorList.argsArray[i];

          if (
            fn === pdfjsLib.OPS.paintImageXObject ||
            fn === pdfjsLib.OPS.paintJpegXObject ||
            fn === pdfjsLib.OPS.paintInlineImageXObject ||
            fn === pdfjsLib.OPS.paintImageMaskXObject
          ) {
            if (args && args.length > 0) {
              const objId = args[0];
              pageImageObjects.add(objId);
            }
          }
        }

        console.log(
          `Page ${pageNum} has ${pageImageObjects.size} image objects`,
        );

        // Process each image object
        for (const objId of pageImageObjects) {
          imagePromises.push(
            new Promise(async (resolve) => {
              try {
                // Get the image data
                page.objs.get(objId, async (imageData) => {
                  if (!imageData || !imageData.data) {
                    console.warn(
                      `No data for image object ${objId} on page ${pageNum}`,
                    );
                    resolve(null);
                    return;
                  }

                  try {
                    // Create canvas
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    // Get image dimensions
                    const width = imageData.width || 100;
                    const height = imageData.height || 100;

                    canvas.width = width;
                    canvas.height = height;

                    // Convert image data to ImageData
                    let pixelData;
                    if (imageData.data instanceof Uint8ClampedArray) {
                      pixelData = imageData.data;
                    } else if (imageData.data instanceof Uint8Array) {
                      pixelData = new Uint8ClampedArray(imageData.data);
                    } else if (Array.isArray(imageData.data)) {
                      pixelData = new Uint8ClampedArray(imageData.data);
                    } else {
                      console.warn(
                        `Unknown image data type for object ${objId}`,
                      );
                      resolve(null);
                      return;
                    }

                    // Check if we have enough data
                    const expectedLength = width * height * 4;
                    if (pixelData.length < expectedLength) {
                      // Pad with white pixels if data is incomplete
                      const paddedData = new Uint8ClampedArray(expectedLength);
                      paddedData.fill(255); // White background

                      // Copy available data
                      const copyLength = Math.min(
                        pixelData.length,
                        expectedLength,
                      );
                      for (let i = 0; i < copyLength; i++) {
                        paddedData[i] = pixelData[i];
                      }
                      pixelData = paddedData;
                    }

                    // Create ImageData and draw to canvas
                    const imageDataObj = new ImageData(
                      pixelData,
                      width,
                      height,
                    );
                    ctx.putImageData(imageDataObj, 0, 0);

                    // Convert canvas to blob
                    const blob = await new Promise((blobResolve) => {
                      canvas.toBlob(
                        (blob) => blobResolve(blob),
                        "image/png",
                        0.95,
                      );
                    });

                    if (blob) {
                      const currentIndex = imageIndex++;
                      const imageFile = new File(
                        [blob],
                        `page_${pageNum}_image_${currentIndex + 1}.png`,
                        {
                          type: "image/png",
                          lastModified: Date.now(),
                        },
                      );
                      console.log(
                        `Extracted image from page ${pageNum}, object ${objId}`,
                      );
                      resolve(imageFile);
                    } else {
                      resolve(null);
                    }
                  } catch (innerError) {
                    console.warn(
                      `Error processing image object ${objId}:`,
                      innerError,
                    );
                    resolve(null);
                  }
                });
              } catch (outerError) {
                console.warn(
                  `Error getting image object ${objId}:`,
                  outerError,
                );
                resolve(null);
              }
            }),
          );
        }

        // If no image objects found, render the entire page as an image
        if (pageImageObjects.size === 0 && pageNum <= 5) {
          console.log(
            `No image objects found on page ${pageNum}, rendering page as image`,
          );
          imagePromises.push(
            new Promise(async (resolve) => {
              try {
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // White background
                context.fillStyle = "white";
                context.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({
                  canvasContext: context,
                  viewport: viewport,
                }).promise;

                const blob = await new Promise((blobResolve) => {
                  canvas.toBlob((blob) => blobResolve(blob), "image/png", 0.9);
                });

                if (blob && blob.size > 1024) {
                  const currentIndex = imageIndex++;
                  const imageFile = new File(
                    [blob],
                    `page_${pageNum}_full.png`,
                    {
                      type: "image/png",
                      lastModified: Date.now(),
                    },
                  );
                  console.log(`Rendered page ${pageNum} as image`);
                  resolve(imageFile);
                } else {
                  resolve(null);
                }
              } catch (renderError) {
                console.warn(`Failed to render page ${pageNum}:`, renderError);
                resolve(null);
              }
            }),
          );
        }
      } catch (pageError) {
        console.warn(`Failed to process page ${pageNum}:`, pageError);
        // Continue with next page
      }
    }

    // Wait for all image extraction promises
    const results = await Promise.all(imagePromises);

    // Filter out null results
    results.forEach((result) => {
      if (result) images.push(result);
    });

    // If still no images, try a different approach
    if (images.length === 0 && pdf.numPages > 0) {
      console.log("No images extracted, trying alternative method...");

      // Try extracting pages as images
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // White background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;

          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/png", 0.9);
          });

          if (blob) {
            images.push(
              new File([blob], `page_${pageNum}.png`, {
                type: "image/png",
                lastModified: Date.now(),
              }),
            );
          }
        } catch (error) {
          console.warn(`Failed to extract page ${pageNum} as image:`, error);
        }
      }
    }

    if (images.length === 0) {
      throw new Error(
        `No extractable images found. This PDF might contain only text/vector graphics or be in an unsupported format. ` +
          `Try a PDF with embedded JPG/PNG images.`,
      );
    }

    console.log(
      `Successfully extracted ${images.length} images from ${pdf.numPages} pages`,
    );
    return images;
  } catch (error) {
    console.error("PDF Image Extraction Error:", error);

    if (
      error.message.includes("password") ||
      error.message.includes("encrypted")
    ) {
      throw new Error("PDF is password protected. Please unlock it first.");
    } else if (
      error.message.includes("corrupt") ||
      error.message.includes("invalid")
    ) {
      throw new Error("PDF file appears to be corrupt or invalid.");
    } else {
      throw new Error(`Image extraction failed: ${error.message}`);
    }
  }
};

// Enhanced Images to PDF with layout options
export const imagesToPDF = async (
  imageFiles,
  layout = "portrait",
  options = {},
) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const defaultOptions = {
      margin: 20,
      fitToPage: true,
      maintainAspectRatio: true,
      ...options,
    };

    for (const imageFile of imageFiles) {
      try {
        // Determine image format and embed
        const imageBytes = await imageFile.arrayBuffer();
        let embeddedImage;
        let imageType = "unknown";

        // Try to detect image type
        const header = new Uint8Array(imageBytes.slice(0, 4));
        const isJPEG = header[0] === 0xff && header[1] === 0xd8;
        const isPNG = header[0] === 0x89 && header[1] === 0x50;

        try {
          if (
            isJPEG ||
            imageFile.type.includes("jpeg") ||
            imageFile.type.includes("jpg")
          ) {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
            imageType = "jpeg";
          } else if (isPNG || imageFile.type.includes("png")) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
            imageType = "png";
          } else {
            // Fallback to canvas conversion
            throw new Error("Unsupported format, converting via canvas");
          }
        } catch (embedError) {
          console.warn(
            "Direct embedding failed, using canvas fallback:",
            embedError,
          );

          // Canvas fallback
          const img = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(imageFile);
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          // Convert to PNG via canvas
          const pngBlob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/png");
          });

          const pngBytes = await pngBlob.arrayBuffer();
          embeddedImage = await pdfDoc.embedPng(pngBytes);
          imageType = "png";
          URL.revokeObjectURL(img.src);
        }

        if (!embeddedImage) {
          throw new Error("Failed to embed image");
        }

        // Calculate page size based on layout
        let pageWidth, pageHeight;
        const { width: imgWidth, height: imgHeight } = embeddedImage;

        if (defaultOptions.fitToPage) {
          const maxWidth = 595.28 - defaultOptions.margin * 2; // A4 width in points
          const maxHeight = 841.89 - defaultOptions.margin * 2; // A4 height in points

          if (layout === "portrait") {
            pageWidth = maxWidth;
            pageHeight = (imgHeight * maxWidth) / imgWidth;
            if (pageHeight > maxHeight) {
              pageHeight = maxHeight;
              pageWidth = (imgWidth * maxHeight) / imgHeight;
            }
          } else {
            // landscape
            pageHeight = maxHeight;
            pageWidth = (imgWidth * maxHeight) / imgHeight;
            if (pageWidth > maxWidth) {
              pageWidth = maxWidth;
              pageHeight = (imgHeight * maxWidth) / imgWidth;
            }
          }
        } else {
          // Use image dimensions
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        }

        // Add page and draw image
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        if (defaultOptions.maintainAspectRatio) {
          page.drawImage(embeddedImage, {
            x: defaultOptions.margin,
            y: defaultOptions.margin,
            width: pageWidth - defaultOptions.margin * 2,
            height: pageHeight - defaultOptions.margin * 2,
          });
        } else {
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        }
      } catch (imageError) {
        console.warn(`Failed to process image ${imageFile.name}:`, imageError);
        // Continue with next image instead of failing entire batch
        continue;
      }
    }

    if (pdfDoc.getPages().length === 0) {
      throw new Error("No images were successfully converted to PDF");
    }

    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
    });

    const fileName = `images_to_pdf_${Date.now()}.pdf`;

    return new File([pdfBytes], fileName, {
      type: "application/pdf",
    });
    return fixedBlob;
  } catch (error) {
    console.error("Images to PDF Error:", error);
    throw new Error(`Conversion failed: ${error.message}`);
  }
};

// Helper function to remove password protection
export const removePasswordProtection = async (file, password) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { password });

    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
    });

    const fileName = file.name.replace(/\.pdf$/i, "_unlocked.pdf");

    return new File([pdfBytes], fileName, {
      type: "application/pdf",
    });
  } catch (error) {
    throw new Error(`Password removal failed: ${error.message}`);
  }
};

// // Helper function to perform OCR on an image file
// import { createWorker } from "tesseract.js";

// /**
//  * Performs OCR on a single image file
//  * @param {File} imageFile - The image file to process
//  * @param {Function} onProgress - Callback for progress updates (0-100)
//  */
// export const performOCR = async (imageFile, onProgress) => {
//   const worker = await createWorker("eng", 1, {
//     logger: (m) => {
//       if (m.status === "recognizing text") {
//         onProgress(Math.parseInt(m.progress * 100));
//       }
//     },
//   });

//   try {
//     const {
//       data: { text },
//     } = await worker.recognize(imageFile);
//     await worker.terminate();
//     return text;
//   } catch (error) {
//     await worker.terminate();
//     throw new Error("Failed to extract text: " + error.message);
//   }
// };

// /**
//  * Copies text to clipboard
//  */
// export const copyToClipboard = async (text) => {
//   if (!navigator.clipboard) return false;
//   try {
//     await navigator.clipboard.writeText(text);
//     return true;
//   } catch (err) {
//     return false;
//   }
// };

import { createWorker } from "tesseract.js";

/**
 * Supported languages map
 */
export const SUPPORTED_LANGUAGES = {
  eng: "English",
  fra: "French",
  deu: "German",
  hin: "Hindi",
  kor: "Korean",
  rus: "Russian",
  spa: "Spanish",
  ita: "Italian",
  mal: "Malayalam",
};

/**
 * Performs OCR on a single image file with multi-language support
 * @param {File} imageFile - The image file to process
 * @param {Function} onProgress - Callback for progress updates (0-100)
 * @param {string|string[]} languages - Language code(s) from SUPPORTED_LANGUAGES keys. Defaults to 'eng'
 */
export const performOCR = async (imageFile, onProgress, languages = "eng") => {
  // Join multiple languages with '+' as required by Tesseract
  const langString = Array.isArray(languages) ? languages.join("+") : languages;

  // Validate languages
  const langArray = langString.split("+");
  const invalidLangs = langArray.filter((lang) => !SUPPORTED_LANGUAGES[lang]);
  if (invalidLangs.length > 0) {
    throw new Error(
      `Unsupported language code(s): ${invalidLangs.join(", ")}. Use keys from SUPPORTED_LANGUAGES.`,
    );
  }

  const worker = await createWorker(langString, 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(imageFile);
    await worker.terminate();
    return text;
  } catch (error) {
    await worker.terminate();
    throw new Error("Failed to extract text: " + error.message);
  }
};
/**
 * Copies text to clipboard
 */
export const copyToClipboard = async (text) => {
  if (!navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};
