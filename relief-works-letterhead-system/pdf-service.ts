import fs from "fs";
import path from "path";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser, type LaunchOptions } from "puppeteer-core";
import { renderPdfHtmlFromMarkdown, type DocumentOverrides } from "../shared/document-generator.ts";

function fileExists(targetPath: string | undefined) {
  return Boolean(targetPath && fs.existsSync(targetPath));
}

async function resolveExecutablePath() {
  if (fileExists(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH as string;
  }

  const candidates = [
    process.env.CHROME_BIN,
    process.env.GOOGLE_CHROME_BIN,
    process.env.MS_EDGE_BIN,
    path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.PROGRAMFILES || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env.PROGRAMFILES || "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
  ];

  const localBrowser = candidates.find(fileExists);
  if (localBrowser) {
    return localBrowser;
  }

  try {
    const executablePath = await chromium.executablePath();
    if (fileExists(executablePath)) {
      return executablePath;
    }
  } catch {
    // Fall through when serverless Chromium is unavailable locally.
  }

  return null;
}

async function launchBrowser() {
  const executablePath = await resolveExecutablePath();

  if (!executablePath) {
    throw new Error(
      "No Chromium executable was found. Set PUPPETEER_EXECUTABLE_PATH for local development.",
    );
  }

  const isPackagedChromium = executablePath.includes("chromium");
  const launchOptions: LaunchOptions = {
    executablePath,
    headless: true,
    args: isPackagedChromium
      ? chromium.args
      : ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=medium"],
  };

  return puppeteer.launch(launchOptions);
}

export async function generatePdfBuffer(input: {
  markdown: string;
  overrides?: DocumentOverrides;
  useReferenceBackground?: boolean;
}) {
  const rendered = renderPdfHtmlFromMarkdown(
    input.markdown,
    input.overrides,
    input.useReferenceBackground,
  );
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(rendered.html, {
      waitUntil: "domcontentloaded",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return {
      buffer: Buffer.from(pdf),
      fileName: `${rendered.fileName}.pdf`,
      subjectLine: rendered.subjectLine,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
