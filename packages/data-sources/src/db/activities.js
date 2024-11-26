import supabase from '@terminus/supabase';
import { getSkillByName } from './skills.js';

let TWI_SKILL_ID = null;

async function initializeSkillId() {
  if (!TWI_SKILL_ID) {
    TWI_SKILL_ID = await getSkillByName('The Wandering Inn');
  }
}

export async function getOrCreateSeries(seriesData) {
  await initializeSkillId();

  const { data: existingSeries, error: queryError } = await supabase
    .schema('status')
    .from('activities')
    .select('id')
    .eq('name', seriesData['series-name'])
    .eq('type', 'sequence')
    .is('parent_activity_id', null)
    .single();

  if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw queryError;
  }

  if (existingSeries) {
    return existingSeries.id;
  }

  const { data: newSeries, error: insertError } = await supabase
    .schema('status')
    .from('activities')
    .insert({
      name: seriesData['series-name'],
      type: 'sequence',
      skill_id: TWI_SKILL_ID,
    })
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  return newSeries.id;
}

export async function getOrCreateChapter(chapterData, seriesId) {
  await initializeSkillId();

  const { data: existingChapter, error: queryError } = await supabase
    .schema('status')
    .from('activities')
    .select('id')
    .eq('name', chapterData['chapter-name'])
    .eq('parent_activity_id', seriesId)
    .single();

  if (queryError && queryError.code !== 'PGRST116') {
    throw queryError;
  }

  if (existingChapter) {
    return existingChapter.id;
  }

  const { data: newChapter, error: insertError } = await supabase
    .schema('status')
    .from('activities')
    .insert({
      name: chapterData['chapter-name'],
      parent_activity_id: seriesId,
      type: 'task',
      skill_id: TWI_SKILL_ID,
      length: chapterData['word-count'],
      length_type: 'words',
    })
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  return newChapter.id;
} 