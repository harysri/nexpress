import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  extractPages,
  getPageCount,
  mergePDFs,
  organizePDF,
  pageNumbersPDF,
  parsePageRanges,
  protectPDF,
  splitPDF,
  unlockPDF,
  watermarkPDF,
} from "../src/utils/pdfCore.js";

async function makePdf(pageCount = 1) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < pageCount; index++) {
    const page = document.addPage([300, 400]);
    page.drawText(`Page ${index + 1}`, { x: 20, y: 200, size: 14, font });
  }
  return document.save();
}

test("mergePDFs combines every page", async () => {
  const merged = await mergePDFs([await makePdf(2), await makePdf(3)]);
  assert.equal(await getPageCount(merged), 5);
});

test("mergePDFs rejects an empty list", async () => {
  await assert.rejects(() => mergePDFs([]), /at least one/i);
});

test("extractPages keeps the requested pages", async () => {
  const result = await extractPages(await makePdf(4), [3, 0]);
  assert.equal(await getPageCount(result), 2);
});

test("organizePDF reorders and applies rotation", async () => {
  const result = await organizePDF(await makePdf(3), {
    order: [2, 0],
    rotations: { 2: 90 },
  });
  const document = await PDFDocument.load(result);
  assert.equal(document.getPageCount(), 2);
  assert.equal(document.getPage(0).getRotation().angle, 90);
  assert.equal(document.getPage(1).getRotation().angle, 0);
});

test("parsePageRanges handles ranges, singles and open ends", () => {
  assert.deepEqual(parsePageRanges("1-3, 5, 8-", 10), [
    { from: 1, to: 3 },
    { from: 5, to: 5 },
    { from: 8, to: 10 },
  ]);
  assert.deepEqual(parsePageRanges("", 10), []);
  assert.deepEqual(parsePageRanges("99", 5), [{ from: 5, to: 5 }]);
  assert.deepEqual(parsePageRanges("4-2", 5), [{ from: 2, to: 4 }]);
});

test("splitPDF produces one document per range", async () => {
  const parts = await splitPDF(await makePdf(5), [
    { from: 1, to: 2 },
    { from: 4, to: 5 },
  ]);
  assert.equal(parts.length, 2);
  assert.equal(await getPageCount(parts[0].bytes), 2);
  assert.equal(await getPageCount(parts[1].bytes), 2);
});

test("protectPDF requires the password to reopen", async () => {
  const source = await makePdf(2);
  const encrypted = await protectPDF(source, {
    userPassword: "secret123",
    ownerPassword: "owner-secret",
  });

  await assert.rejects(() => PDFDocument.load(encrypted));

  const unlocked = await unlockPDF(encrypted, "secret123");
  assert.equal(await getPageCount(unlocked), 2);
});

test("unlockPDF rejects a wrong password", async () => {
  const source = await makePdf(1);
  const encrypted = await protectPDF(source, {
    userPassword: "secret123",
    ownerPassword: "owner-secret",
  });
  await assert.rejects(() => unlockPDF(encrypted, "not-the-password"));
});

test("watermarkPDF and pageNumbersPDF keep every page", async () => {
  const source = await makePdf(3);
  const watermarked = await watermarkPDF(source, { text: "CONFIDENTIAL" });
  assert.equal(await getPageCount(watermarked), 3);

  const numbered = await pageNumbersPDF(source, {
    position: "bottom-right",
  });
  assert.equal(await getPageCount(numbered), 3);
  assert.ok(numbered.length > source.length - 1);
});

test("watermarkPDF requires text", async () => {
  await assert.rejects(
    () => watermarkPDF(makePdf(1), { text: "   " }),
    /watermark text/i,
  );
});
