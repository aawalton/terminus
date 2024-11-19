import supabase from '../database.js'

export const syncSkillTree = async (changes) => {
  const { added, removed, renamed, reordered } = changes

  try {
    console.log('Changes to sync:', {
      added: added.length,
      removed: removed.length,
      renamed: renamed.length,
      reordered: reordered.length
    })

    // First, fetch all existing skills to get their UUIDs
    const { data: existingSkills, error: fetchError } = await supabase
      .schema('status')
      .from('skills')
      .select('id, name')
      .is('deleted_at', null)

    if (fetchError) throw fetchError

    // Create a map of skill names to their UUIDs
    const skillIdMap = new Map(existingSkills.map(skill => [skill.name, skill.id]))

    // Handle removals (soft delete)
    if (removed.length > 0) {
      const { error } = await supabase
        .schema('status')
        .from('skills')
        .update({ deleted_at: new Date().toISOString() })
        .in('name', removed.map(skill => skill.name))
      if (error) throw error
    }

    // Handle additions
    for (const skill of added) {
      console.log('Adding skill:', skill)

      // Skip if skill already exists
      if (skillIdMap.has(skill.name)) {
        console.log('Skill already exists:', skill.name)
        continue
      }

      const parentUuid = skillIdMap.get(skill.parentId)
      if (!parentUuid && skill.parentId !== null) {
        throw new Error(`Parent skill not found: ${skill.parentId}`)
      }

      const { data, error } = await supabase
        .schema('status')
        .from('skills')
        .insert({
          name: skill.name,
          parent_skill_id: parentUuid,
          sort_order: skill.sortOrder
        })
      if (error) {
        console.error('Error adding skill:', error)
        throw error
      }
      console.log('Added skill response:', data)

      // Add the new skill to our map in case it's needed as a parent for other skills
      if (data && data[0]) {
        skillIdMap.set(skill.name, data[0].id)
      }
    }

    // Handle renames
    for (const { from, to } of renamed) {
      const { error } = await supabase
        .schema('status')
        .from('skills')
        .update({
          name: to.name,
          updated_at: new Date().toISOString()
        })
        .eq('name', from.name)
      if (error) throw error
    }

    // Handle reordering
    for (const { skill, newOrder } of reordered) {
      const { error } = await supabase
        .schema('status')
        .from('skills')
        .update({
          sort_order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('name', skill.name)
      if (error) throw error
    }

  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
} 