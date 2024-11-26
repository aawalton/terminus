import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from '@terminus/supabase';
import { getSkillByName } from '../db/skills.js';
import { getUserByEmail } from '../db/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrateChapterCompletion() {
  try {
    console.log('Starting chapter completion migration...');

    // Get required IDs
    const skillId = await getSkillByName('The Wandering Inn');
    const userId = await getUserByEmail('aawalton@gmail.com');

    // Get all chapter files
    const chaptersDir = path.join(process.cwd(), 'data/json/series/the-wandering-inn/chapters');
    const files = await fs.readdir(chaptersDir);

    for (const file of files) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(chaptersDir, file);
        const chapterData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        // Skip if no completed field
        if (!('completed' in chapterData)) {
          continue;
        }

        // Look up activity ID for this chapter
        const { data: activity, error: activityError } = await supabase
          .schema('status')
          .from('activities')
          .select('id')
          .eq('name', chapterData['chapter-name'])
          .eq('skill_id', skillId)
          .single();

        if (activityError) {
          console.error(`Failed to find activity for chapter ${chapterData['chapter-name']}: ${activityError.message}`);
          continue;
        }

        if (chapterData.completed) {
          // Check if experience record already exists
          const { data: existingExp, error: expError } = await supabase
            .schema('status')
            .from('experience')
            .select('id')
            .eq('activity_id', activity.id)
            .eq('user_id', userId)
            .maybeSingle();

          if (expError) {
            console.error(`Error checking existing experience: ${expError.message}`);
            continue;
          }

          if (!existingExp) {
            // Create experience record
            const { error: insertError } = await supabase
              .schema('status')
              .from('experience')
              .insert({
                activity_id: activity.id,
                user_id: userId,
                skill_id: skillId,
                amount: chapterData['word-count']
              });

            if (insertError) {
              console.error(`Failed to create experience record for ${chapterData['chapter-name']}: ${insertError.message}`);
              continue;
            }

            console.log(`Created experience record for ${chapterData['chapter-name']}`);
          }
        }

        // Remove completed field and update file
        delete chapterData.completed;
        await fs.writeFile(filePath, JSON.stringify(chapterData, null, 2));
        console.log(`Updated JSON file: ${file}`);
      }
    }

    console.log('Chapter completion migration completed successfully!');
  } catch (error) {
    console.error('Error during chapter completion migration:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateChapterCompletion().catch(console.error);
} 