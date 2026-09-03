import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173';
const widths = [320, 375, 414, 768, 1440];
const pages = [
  ['Homepage', '/'], ['Login', '/login'], ['Dashboard', '/dashboard'],
  ['Profile', '/profile'], ['Jobs', '/jobs'], ['Internships', '/internships'],
  ['Resume/ATS', '/dashboard#resume-health'], ['PM match preview', '/pm-internship-match'],
] as const;

async function main() {
  const browser = await chromium.launch();
  const results: Array<{ page: string; width: number; status: string }> = [];
  try {
    for (const [name, path] of pages) {
      for (const width of widths) {
        const context = await browser.newContext({ viewport: { width, height: width < 600 ? 800 : 900 } });
        const page = await context.newPage();
        await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => {
          const documentOverflow = document.documentElement.scrollWidth > window.innerWidth;
          const elements = [...document.querySelectorAll('*')]
            .map((element) => ({ tag: element.tagName, className: String(element.className), right: element.getBoundingClientRect().right }))
            .filter((element) => element.right > window.innerWidth + 1)
            .slice(0, 5);
          return { documentOverflow, elements };
        });
        const status = overflow.documentOverflow ? 'FAIL' : 'PASS';
        results.push({ page: name, width, status });
        if (status === 'FAIL') console.error(`${status} ${name} ${width}px`, overflow.elements);
        await context.close();
      }
    }
  } finally { await browser.close(); }
  console.table(results);
  if (results.some((result) => result.status === 'FAIL')) process.exitCode = 1;
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
