import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "tspcargo-scrape");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto("https://tspcargo.online/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(5000);

const html = await page.content();
writeFileSync(join(OUT, "page.html"), html, "utf8");

const text = await page.evaluate(() => document.body.innerText);
writeFileSync(join(OUT, "page.txt"), text, "utf8");

const images = await page.evaluate(() =>
  Array.from(document.querySelectorAll("img")).map((img) => ({
    src: img.src,
    alt: img.alt,
  }))
);
writeFileSync(join(OUT, "images.json"), JSON.stringify(images, null, 2), "utf8");

await page.screenshot({ path: join(OUT, "full-page.png"), fullPage: true });

console.log("Title:", await page.title());
console.log("Sections preview:\n", text.slice(0, 3000));
console.log("Images:", images.length);
console.log("Saved to", OUT);

await browser.close();
