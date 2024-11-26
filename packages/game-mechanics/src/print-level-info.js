import { getLevelInfo } from './get-level-info.js';

async function printLevelInfo() {
  try {
    console.log('Getting level info...');
    const levelInfo = await getLevelInfo();

    console.log(`\nCurrent level: ${levelInfo.currentLevel}`);
    console.log(`Total XP: ${levelInfo.totalXp}`);
    console.log(`XP needed for next level: ${levelInfo.xpNeededForNextLevel}`);
    console.log(`XP gained for next level: ${levelInfo.xpGainedTowardsNextLevel}`);
    console.log(`Progress towards next level: ${levelInfo.percentProgressToNextLevel}%`);
  } catch (error) {
    console.error('An error occurred while getting level info:', error);
    throw error;
  }
}

export { printLevelInfo };

if (import.meta.url === `file://${process.argv[1]}`) {
  printLevelInfo().catch(console.error);
} 