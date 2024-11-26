import { getTotalWordCount } from './get-total-word-count.js';
import { getLevelInfo } from './get-level-info.js';

async function syncGameMechanics() {
  try {
    console.log('Starting game mechanics sync...');

    console.log('Calculating total word count...');
    const totalWordCount = await getTotalWordCount();
    console.log(`Total word count: ${totalWordCount}`);

    console.log('Calculating level info...');
    const levelInfo = await getLevelInfo();
    console.log(`\nCurrent level: ${levelInfo.currentLevel}`);
    console.log(`Total XP: ${levelInfo.totalXp}`);
    console.log(`XP needed for next level: ${levelInfo.xpNeededForNextLevel}`);
    console.log(`XP gained for next level: ${levelInfo.xpGainedTowardsNextLevel}`);
    console.log(`Progress towards next level: ${levelInfo.percentProgressToNextLevel}%`);

    console.log('Game mechanics sync completed successfully!');
  } catch (error) {
    console.error('An error occurred during game mechanics sync:', error);
    throw error;
  }
}

export { syncGameMechanics };


if (import.meta.url === `file://${process.argv[1]}`) {
  syncGameMechanics().catch(console.error);
}