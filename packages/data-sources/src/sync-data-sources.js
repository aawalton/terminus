import { syncTheWanderingInn } from './the-wandering-inn/sync-the-wandering-inn.js';
import { migrateChapterCompletion } from './migrations/migrate-chapter-completion.js';

async function syncDataSources() {
  try {
    console.log('Starting data sources sync...');
    await syncTheWanderingInn();
    await migrateChapterCompletion();
    console.log('Data sources sync completed successfully!');
  } catch (error) {
    console.error('An error occurred during data sources sync:', error);
    throw error;
  }
}

export { syncDataSources };

if (import.meta.url === `file://${process.argv[1]}`) {
  syncDataSources().catch(console.error);
}