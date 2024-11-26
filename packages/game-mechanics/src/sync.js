import { syncGameMechanics } from './game-mechanics/sync-game-mechanics.js';

async function sync() {
  try {
    console.log('Starting sync process...');

    console.log('Syncing game mechanics...');
    await syncGameMechanics();

    console.log('Sync process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during sync process:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  sync().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

