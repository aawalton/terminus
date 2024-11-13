import { getTotalWordCount } from './get-total-word-count.js';

async function getLevelInfo() {
  try {
    const totalWordCount = await getTotalWordCount();
    const totalXp = totalWordCount; // Total XP is equal to the total number of words read

    // Calculate current level
    const currentLevel = Math.floor(Math.sqrt(totalXp / 500)) - 1;

    // Calculate XP needed for next level
    const nextLevel = currentLevel + 1;
    const xpNeededForNextLevel = nextLevel * 1000;
    const xpNeededForCurrentLevel = currentLevel * (currentLevel + 1) / 2 * 1000;

    // Calculate progress towards next level
    const xpGainedTowardsNextLevel = totalXp - xpNeededForCurrentLevel;
    const percentProgressToNextLevel = (xpGainedTowardsNextLevel / xpNeededForNextLevel) * 100;

    return {
      currentLevel,
      totalXp,
      xpNeededForNextLevel,
      xpGainedTowardsNextLevel,
      percentProgressToNextLevel: Math.round(percentProgressToNextLevel * 100) / 100, // Round to 2 decimal places
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      currentLevel: 0,
      totalXp: 0,
      xpNeededForNextLevel: 1000,
      xpGainedTowardsNextLevel: 0,
      percentProgressToNextLevel: 0,
    };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  getLevelInfo().then(({ currentLevel, totalXp, xpNeededForNextLevel, xpGainedTowardsNextLevel, percentProgressToNextLevel }) => {
    console.log(`Current level: ${currentLevel}`);
    console.log(`Total XP: ${totalXp}`);
    console.log(`XP needed for next level: ${xpNeededForNextLevel}`);
    console.log(`XP gained for next level: ${xpGainedTowardsNextLevel}`);
    console.log(`Progress towards next level: ${percentProgressToNextLevel}%`);
  });
}

export { getLevelInfo };
