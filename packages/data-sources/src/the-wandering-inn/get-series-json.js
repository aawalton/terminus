import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOrCreateSeries } from '../db/activities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getSeriesJson() {
  const htmlPath = path.join(process.cwd(), 'data/html/series/the-wandering-inn/the-wandering-inn.html');
  const outputDir = path.join(process.cwd(), 'data/json/series/the-wandering-inn');

  try {
    // Check if input file exists
    try {
      await fs.access(htmlPath);
    } catch (error) {
      console.error(`Input HTML file not found: ${htmlPath}`);
      return;
    }

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Load the HTML file
    await page.goto(`file://${htmlPath}`);

    const chapters = await page.evaluate(() => {
      const chapterElements = document.querySelectorAll('.chapter-entry');
      return Array.from(chapterElements).map(el => {
        const linkElement = el.querySelector('a');

        if (!linkElement) {
          return null;
        }

        return {
          title: linkElement.textContent.trim(),
          url: linkElement.href,
        };
      }).filter(chapter => chapter !== null);
    });

    await browser.close();

    // Transform chapters to match schema
    const formattedChapters = chapters.map((chapter, index) => ({
      order: index + 1,
      title: chapter.title,
      url: chapter.url
    }));

    // Create the complete series object
    const seriesData = {
      "series-id": "the-wandering-inn",
      "series-name": "The Wandering Inn",
      "author-ids": ["pirateaba"],
      "books": [],
      "chapters": formattedChapters
    };

    // Save to database
    await getOrCreateSeries(seriesData);

    // Save the result as JSON (keeping existing functionality)
    const jsonPath = path.join(__dirname, '../../data/json/series/the-wandering-inn/the-wandering-inn.json');
    await fs.writeFile(jsonPath, JSON.stringify(seriesData, null, 2));

    console.log(`Table of contents saved to ${jsonPath}`);
  } catch (error) {
    console.error(`Error processing series data: ${error}`);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  getSeriesJson().catch(console.error);
}
