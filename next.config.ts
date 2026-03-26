import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
    "pdf-parse",
    "word-extractor",
  ],
};

export default nextConfig;
