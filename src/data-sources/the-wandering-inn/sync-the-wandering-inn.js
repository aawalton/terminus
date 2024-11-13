import { getSeriesHtml } from './get-series-html.js';
import { getSeriesJson } from './get-series-json.js';
import { getChaptersHtml } from './get-chapters-html.js';
import { getChaptersJson } from './get-chapters-json.js';

async function syncTheWanderingInn() {
  try {
    console.log('Starting TWI sync process...');

    console.log('Downloading table of contents...');
    await getSeriesHtml();

    console.log('Parsing table of contents...');
    await getSeriesJson();

    console.log('Downloading chapters...');
    await getChaptersHtml();

    console.log('Parsing chapters...');
    await getChaptersJson();

    console.log('TWI sync process completed successfully!');
  } catch (error) {
    console.error('An error occurred during the TWI sync process:', error);
    throw error;
  }
}

export { syncTheWanderingInn };

if (import.meta.url === `file://${process.argv[1]}`) {
  syncTheWanderingInn().catch(console.error);
}
