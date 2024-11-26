import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOrCreateSeries, getOrCreateChapter } from '../db/activities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractChapterText(filePath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`file:${filePath}`);

  const chapterData = await page.evaluate(() => {
    const content = document.querySelector('.entry-content');
    if (!content) return null;

    // Get chapter title
    const title = document.querySelector('.entry-title');
    const chapterName = title ? title.textContent.trim() : '';

    // Remove any script tags
    const scripts = content.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Extract text from paragraphs
    const paragraphs = content.querySelectorAll('p');
    const textArray = Array.from(paragraphs)
      .map(p => {
        const img = p.querySelector('img');
        if (img) return null;
        return p.textContent.trim();
      })
      .filter(Boolean);

    // Remove the last paragraph if it contains "Next Chapter"
    if (textArray[textArray.length - 1] && textArray[textArray.length - 1].includes("Next Chapter")) {
      textArray.pop();
    }

    return {
      chapterName,
      chapterText: textArray.join('\n\n')
    };
  });

  await browser.close();
  return chapterData;
}

export async function getChaptersJson() {
  const chaptersDir = path.join(process.cwd(), 'data/html/series/the-wandering-inn/chapters');
  const outputDir = path.join(process.cwd(), 'data/json/series/the-wandering-inn/chapters');

  try {
    // Ensure both input and output directories exist
    await fs.mkdir(chaptersDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    // Get series ID first
    const seriesData = {
      'series-name': 'The Wandering Inn',
      'series-id': 'the-wandering-inn'
    };
    const seriesId = await getOrCreateSeries(seriesData);

    // Check if input directory is empty
    const files = await fs.readdir(chaptersDir);
    if (files.length === 0) {
      console.log('No HTML files found in input directory:', chaptersDir);
      return;
    }

    for (const file of files) {
      if (path.extname(file) === '.html') {
        const filePath = path.join(chaptersDir, file);
        const outputPath = path.join(outputDir, `${path.parse(file).name}.json`);

        // Check if the output file already exists
        try {
          await fs.access(outputPath);
          console.log(`Skipping ${file} - JSON already exists`);
          continue;
        } catch (error) {
          // File doesn't exist, proceed with processing
        }

        const chapterData = await extractChapterText(filePath);

        if (chapterData) {
          const chapterId = path.parse(file).name;
          const jsonOutput = {
            "chapter-id": chapterId,
            "chapter-name": chapterData.chapterName,
            "series-id": "the-wandering-inn",
            "chapter-text": chapterData.chapterText,
            "word-count": chapterData.chapterText.split(/\s+/).length
          };

          // Save to database
          await getOrCreateChapter(jsonOutput, seriesId);

          // Save to JSON file
          await fs.writeFile(outputPath, JSON.stringify(jsonOutput, null, 2));
          console.log(`Processed: ${file}`);
        } else {
          console.log(`Failed to extract text from: ${file}`);
        }
      }
    }

    console.log('All chapters processed successfully.');
  } catch (error) {
    console.error('Error processing chapters:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  getChaptersJson().catch(console.error);
}
