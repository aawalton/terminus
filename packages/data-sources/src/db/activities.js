import supabase from '@terminus/supabase';

// Cache for type IDs to avoid repeated lookups
let ACTIVITY_TYPES = null;
let LENGTH_TYPES = null;

async function initializeTypeIds() {
  if (!ACTIVITY_TYPES || !LENGTH_TYPES) {
    // Get activity types
    const { data: activityTypes, error: activityError } = await supabase
      .schema('status')
      .from('activity_types')
      .select('id, name');

    if (activityError) {
      throw new Error(`Failed to fetch activity types: ${activityError.message}`);
    }

    // Get length types
    const { data: lengthTypes, error: lengthError } = await supabase
      .schema('status')
      .from('length_types')
      .select('id, name');

    if (lengthError) {
      throw new Error(`Failed to fetch length types: ${lengthError.message}`);
    }

    // Convert to lookup objects
    ACTIVITY_TYPES = Object.fromEntries(
      activityTypes.map(type => [type.name.toUpperCase(), type.id])
    );

    LENGTH_TYPES = Object.fromEntries(
      lengthTypes.map(type => [type.name.toUpperCase(), type.id])
    );

    // Validate required types exist
    if (!ACTIVITY_TYPES.SEQUENCE || !ACTIVITY_TYPES.TASK) {
      throw new Error('Required activity types "sequence" and "task" not found in database');
    }

    if (!LENGTH_TYPES.WORDS) {
      throw new Error('Required length type "words" not found in database');
    }
  }
}

export async function getOrCreateSeries(seriesData) {
  await initializeTypeIds();

  const { data: existingSeries, error: queryError } = await supabase
    .schema('status')
    .from('activities')
    .select('id')
    .eq('name', seriesData['series-name'])
    .eq('type', ACTIVITY_TYPES.SEQUENCE)
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
      type: ACTIVITY_TYPES.SEQUENCE,
      skill_id: 'a6f8e638-1e9f-4875-a5ca-547d33d902a2', // TWI skill ID
    })
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  return newSeries.id;
}

export async function getOrCreateChapter(chapterData, seriesId) {
  await initializeTypeIds();

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
      type: ACTIVITY_TYPES.TASK,
      skill_id: 'a6f8e638-1e9f-4875-a5ca-547d33d902a2', // TWI skill ID
      length: chapterData['word-count'],
      length_type: LENGTH_TYPES.WORDS,
    })
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  return newChapter.id;
} 