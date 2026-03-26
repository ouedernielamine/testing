import { NextResponse } from "next/server";
import mammoth from "mammoth";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

// Vercel serverless: allow up to 60s (Pro plan)
export const maxDuration = 60;

const CHROMIUM_REMOTE_URL =
  "https://github.com/nicholasgriffintn/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

async function getBrowser() {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
    ];
    let execPath: string | undefined;
    for (const p of paths) {
      try {
        const fs = await import("fs");
        if (fs.existsSync(p)) {
          execPath = p;
          break;
        }
      } catch {
        /* skip */
      }
    }
    return puppeteer.launch({
      headless: true,
      executablePath: execPath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1920, height: 1080 },
    executablePath: await chromium.executablePath(CHROMIUM_REMOTE_URL),
    headless: true,
  });
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 40px 35px; size: A4; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a2e;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1 { font-size: 22pt; color: #0f4c75; margin: 0 0 12px; }
    h2 { font-size: 16pt; color: #0f4c75; margin: 18px 0 8px; border-bottom: 2px solid #c9a96e; padding-bottom: 4px; }
    h3 { font-size: 13pt; color: #0a3554; margin: 14px 0 6px; }
    h4 { font-size: 12pt; color: #3282b8; margin: 10px 0 4px; }
    p { margin: 0 0 8px; text-align: justify; }
    ul, ol { margin: 6px 0 6px 20px; }
    li { margin-bottom: 3px; }
    a { color: #0f4c75; text-decoration: underline; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 5px 7px; font-size: 10pt; text-align: left; }
    th { background: #0f4c75; color: #fff; font-weight: 600; }
    strong { color: #0a3554; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

export async function POST(req: Request) {
  let browser;
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".docx") && !name.endsWith(".doc")) {
      return NextResponse.json(
        { error: "Seuls les fichiers Word (.doc, .docx) sont acceptés." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let htmlBody: string;

    if (name.endsWith(".docx")) {
      const result = await mammoth.convertToHtml({ buffer });
      htmlBody = result.value;
    } else {
      // .doc — use word-extractor for plain text then wrap
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const WordExtractor = require("word-extractor");
      const extractor = new WordExtractor();
      const doc = await extractor.extract(buffer);
      const text: string = doc.getBody();
      htmlBody = text
        .split("\n")
        .map((line: string) => (line.trim() ? `<p>${line}</p>` : ""))
        .join("");
    }

    const fullHtml = wrapHtml(htmlBody);

    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "40px", bottom: "40px", left: "35px", right: "35px" },
    });

    const pdfName = file.name.replace(/\.(docx?|doc)$/i, ".pdf");

    return new Response(Buffer.from(pdfBuffer) as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(pdfName)}"`,
      },
    });
  } catch (error) {
    console.error("[ConvertPDF] Error:", error);
    return NextResponse.json(
      { error: "Impossible de convertir le fichier en PDF." },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
