import fs from 'fs/promises';
import path from 'path';

async function readJsonFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const fileContents = await Promise.all(
      jsonFiles.map(async file => {
        const filePath = path.join(directory, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );
    return fileContents;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Directory doesn't exist, return empty array
      return [];
    }
    throw error; // Re-throw other errors
  }
}

export async function getTotalWordCount() {
  try {
    const chaptersDir = path.join(process.cwd(), 'data', 'json', 'series', 'the-wandering-inn', 'chapters');
    const booksDir = path.join(process.cwd(), 'data', 'json', 'series', 'the-wandering-inn', 'books');

    // Get contents from both directories, if they exist
    const [chapters, books] = await Promise.all([
      readJsonFiles(chaptersDir),
      readJsonFiles(booksDir)
    ]);

    const chapterWordCount = chapters.reduce((total, chapter) => {
      if (chapter.completed) {
        return total + chapter['word-count'];
      }
      return total;
    }, 0);

    const bookWordCount = books.reduce((total, book) => {
      if (book.completed) {
        return total + book['word-count'];
      }
      return total;
    }, 0);

    const totalWordCount = chapterWordCount + bookWordCount;

    return totalWordCount;
  } catch (error) {
    console.error('Error:', error.message);
    return 0; // Return 0 in case of an error
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  getTotalWordCount().then(totalWordCount => {
    console.log(`Total word count for completed entries: ${totalWordCount}`);
  });
}
