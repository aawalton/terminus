import supabase from '@terminus/supabase';

export async function getSkillByName(name) {
  const { data: skill, error } = await supabase
    .schema('status')
    .from('skills')
    .select('id')
    .eq('name', name)
    .single();

  if (error) {
    throw new Error(`Failed to fetch skill by name "${name}": ${error.message}`);
  }

  if (!skill) {
    throw new Error(`Skill "${name}" not found`);
  }

  return skill.id;
} 