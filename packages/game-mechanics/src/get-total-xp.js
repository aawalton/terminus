import { getTotalXp } from './db/experience.js';

export { getTotalXp };

if (import.meta.url === `file://${process.argv[1]}`) {
  getTotalXp().then(totalXp => {
    console.log(`Total XP: ${totalXp}`);
  });
} 