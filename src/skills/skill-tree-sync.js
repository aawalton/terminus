import supabase from '../database.js'

export const syncSkillTree = async (changes) => {
  const { added, removed, renamed, reordered, moved } = changes

  try {
    console.log('\nChanges to sync:', {
      added: added.length,
      removed: removed.length,
      renamed: renamed.length,
      reordered: reordered.length,
      moved: moved.length
    })

    // First, fetch all existing skills to get their UUIDs
    const { data: existingSkills, error: fetchError } = await supabase
      .schema('status')
      .from('skills')
      .select('id, name, sort_order')
      .is('deleted_at', null)

    if (fetchError) throw fetchError

    // Create a map of skill names to their UUIDs and current sort order
    const skillIdMap = new Map(existingSkills.map(skill => [skill.name, skill.id]))
    const currentSortOrders = new Map(existingSkills.map(skill => [skill.name, skill.sort_order]))

    // Handle removals (soft delete)
    if (removed.length > 0) {
      console.log('\nProcessing removals:', removed.map(s => s.name))
      const { error } = await supabase
        .schema('status')
        .from('skills')
        .update({ deleted_at: new Date().toISOString() })
        .in('name', removed.map(skill => skill.name))
      if (error) throw error
    }

    // Handle moves (update parent_skill_id)
    for (const { skill, newParentId } of moved) {
      console.log('\nMoving skill:', skill.name, 'to new parent:', newParentId)
      const newParentUuid = skillIdMap.get(newParentId)
      if (!newParentUuid && newParentId !== null) {
        throw new Error(`New parent skill not found: ${newParentId}`)
      }

      const { error } = await supabase
        .schema('status')
        .from('skills')
        .update({
          parent_skill_id: newParentUuid,
          sort_order: skill.sortOrder,
          updated_at: new Date().toISOString()
        })
        .eq('name', skill.name)
      if (error) throw error
    }

    // Handle additions
    for (const skill of added) {
      console.log('\nProcessing addition:', skill.name)

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
      console.log('Added skill:', skill.name, 'with sort_order:', skill.sortOrder)

      // Add the new skill to our map in case it's needed as a parent for other skills
      if (data && data[0]) {
        skillIdMap.set(skill.name, data[0].id)
      }
    }

    // Handle renames
    for (const { from, to } of renamed) {
      console.log('\nProcessing rename:', `${from.name} -> ${to.name}`)
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

    // Handle reordering - only update if sort_order actually changed
    let reorderCount = 0
    for (const { skill, newOrder } of reordered) {
      const currentOrder = currentSortOrders.get(skill.name)
      if (currentOrder === newOrder) {
        console.log('Skipping reorder for', skill.name, '- order unchanged:', newOrder)
        continue
      }

      console.log('Updating order for', skill.name, 'from', currentOrder, 'to', newOrder)
      const { error } = await supabase
        .schema('status')
        .from('skills')
        .update({
          sort_order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('name', skill.name)
      if (error) throw error
      reorderCount++
    }
    console.log('\nTotal reorders performed:', reorderCount)

  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
} 