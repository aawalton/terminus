import supabase from '../database.js'

export const syncSkillTree = async (changes) => {
  const { added, removed, renamed, reordered } = changes

  try {
    // Handle removals (soft delete)
    if (removed.length > 0) {
      const { error } = await supabase
        .from('status.skills')
        .update({ deleted_at: new Date().toISOString() })
        .in('name', removed.map(skill => skill.name))
      if (error) throw error
    }

    // Handle additions
    for (const skill of added) {
      const { error } = await supabase
        .from('status.skills')
        .insert({
          name: skill.name,
          parent_skill_id: skill.parentId,
          sort_order: skill.sortOrder
        })
      if (error) throw error
    }

    // Handle renames
    for (const { from, to } of renamed) {
      const { error } = await supabase
        .from('status.skills')
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
        .from('status.skills')
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