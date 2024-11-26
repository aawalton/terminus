import { promises as fs } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tocPath = path.join(__dirname, '../../data/json/series/the-wandering-inn/the-wandering-inn.json');
const outputDir = path.join(__dirname, '../../data/html/series/the-wandering-inn/chapters');

export async function getChaptersHtml() {

  try {
    // Check if TOC file exists
    try {
      await fs.access(tocPath);
    } catch (error) {
      console.error(`Table of contents file not found: ${tocPath}`);
      return;
    }

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const tocData = await fs.readFile(tocPath, 'utf-8');
    const seriesData = JSON.parse(tocData);
    const chapters = seriesData.chapters;  // Access the chapters array from the series object

    // Launch a browser instance
    const browser = await puppeteer.launch();

    for (const chapter of chapters) {
      const { order, title, url } = chapter;  // Changed from number to order

      // Create a safe filename from the chapter title with a 4-digit zero-padded prefix
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const paddedNumber = order.toString().padStart(4, '0');  // Changed from number to order
      const fileName = `${paddedNumber}_${safeTitle}.html`;
      const filePath = path.join(outputDir, fileName);

      // Check if the file already exists
      try {
        await fs.access(filePath);
        continue; // Skip to the next chapter
      } catch (err) {
        // File doesn't exist, proceed with downloading
      }

      console.log(`Downloading: ${title}`);

      // Create a new page for each chapter
      const page = await browser.newPage();

      // Add retry mechanism
      let retries = 3;
      while (retries > 0) {
        try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
          break; // If successful, exit the retry loop
        } catch (error) {
          if (error.name === 'TimeoutError' && retries > 1) {
            console.log(`Timeout error for ${title}. Retrying in 60 seconds...`);
            await setTimeout(60000); // Wait for 60 seconds before retrying
            retries--;
          } else {
            throw error; // Rethrow the error if it's not a timeout or we've run out of retries
          }
        }
      }

      // Check if the chapter is a Patron Early Access chapter
      const isPatronEarlyAccess = await page.evaluate(() => {
        const titleElement = document.querySelector('h1.entry-title');
        return titleElement && titleElement.textContent.includes('Patron Early Access');
      });

      if (isPatronEarlyAccess) {
        console.log(`Skipping ${title}`);
        continue;
      }

      // Extract the main content of the chapter
      const content = await page.evaluate(() => {
        const articleElement = document.querySelector('article.post');
        return articleElement ? articleElement.innerHTML : null;
      });

      if (content) {
        // Write the content to a file
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`Saved: ${fileName}`);
      } else {
        console.log(`No content found for: ${title}`);
      }

      // Add a delay between requests
      await setTimeout(2000);
    }

    await browser.close();
  } catch (error) {
    console.error(error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  getChaptersHtml().catch(console.error);
}
