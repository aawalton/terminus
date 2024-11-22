import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

export async function getSeriesHtml() {
  const dirPath = path.join('data', 'html', 'series', 'the-wandering-inn');
  const filePath = path.join(dirPath, 'the-wandering-inn.html');

  try {
    // Ensure directory exists before starting browser
    await fs.mkdir(dirPath, { recursive: true });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      // Navigate to the URL
      await page.goto('https://wanderinginn.com/table-of-contents/', { waitUntil: 'networkidle0' });

      // Get the HTML content
      const htmlContent = await page.content();

      // Write the HTML content to a file
      await fs.writeFile(filePath, htmlContent);

      console.log(`HTML content saved to ${filePath}`);
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  getSeriesHtml().catch(console.error);
}
