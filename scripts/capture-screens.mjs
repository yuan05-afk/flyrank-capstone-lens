import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const ROOT = "C:/Users/Yuan/Documents/FlyRankAI/Capstones/Image Relevance & Auto-Tagging";
const OUT = path.join(ROOT, "docs", "images", "shots");
const BASE = process.env.LENS_BASE_URL || "http://localhost:3200";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--window-size=1440,900"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), type: "png" });
  console.log("wrote", name);
}

async function clickByText(page, text) {
  return page.evaluate((needle) => {
    const button = Array.from(document.querySelectorAll("button")).find((item) =>
      (item.textContent || "").includes(needle)
    );
    button?.click();
    return Boolean(button);
  }, text);
}

try {
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
  await wait(2200);
  await shot(page, "lens-landing.png");
  await page.evaluate(() => {
    const section = document.getElementById("guard");
    if (section) window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - 110);
  });
  await wait(1000);
  await shot(page, "lens-guard.png");

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await page.evaluate(async () => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: "lens_demo_key_001" }),
    });
  });
  await page.goto(`${BASE}/review`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForFunction(() => document.body.textContent?.includes("Rank library"), { timeout: 20000 });
  await wait(1000);
  await shot(page, "lens-review-desk.png");

  console.log("rank:", await clickByText(page, "Rank library"));
  await page.waitForFunction(() => document.body.textContent?.includes("Ranked candidates") && document.querySelectorAll("article").length > 3, { timeout: 20000 });
  await wait(1400);
  await shot(page, "lens-ranked.png");

  console.log("force wolf:", await clickByText(page, "Force wolf"));
  await page.waitForFunction(() => document.body.textContent?.includes("Mismatch guard held"), { timeout: 20000 });
  await wait(900);
  await shot(page, "lens-forced-guard.png");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(900);
  await shot(page, "lens-ledger.png");
} finally {
  await browser.close();
}
