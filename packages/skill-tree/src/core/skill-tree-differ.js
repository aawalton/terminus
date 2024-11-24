const diffSkillTrees = (oldSkills, newSkills) => {
  const changes = {
    added: [],
    removed: [],
    renamed: [],
    reordered: [],
    moved: []
  }

  console.log('Comparing trees:', {
    oldSkillCount: oldSkills.length,
    newSkillCount: newSkills.length
  })

  // Create maps for easier lookup
  const oldSkillMap = new Map(oldSkills.map(skill => [getSkillPath(skill, oldSkills), skill]))
  const newSkillMap = new Map(newSkills.map(skill => [getSkillPath(skill, newSkills), skill]))
  const oldSkillsByName = new Map(oldSkills.map(skill => [skill.name, skill]))
  const newSkillsByName = new Map(newSkills.map(skill => [skill.name, skill]))

  // Find removed and renamed skills
  for (const [path, oldSkill] of oldSkillMap) {
    if (!newSkillMap.has(path)) {
      // Check if it was renamed
      const renamedSkill = newSkills.find(s => s.oldName === oldSkill.name)
      if (renamedSkill) {
        changes.renamed.push({ from: oldSkill, to: renamedSkill })
      } else {
        // Check if it was moved (exists with different parent)
        const movedSkill = newSkillsByName.get(oldSkill.name)
        if (movedSkill && movedSkill.parentId !== oldSkill.parentId) {
          changes.moved.push({
            skill: movedSkill,
            oldParentId: oldSkill.parentId,
            newParentId: movedSkill.parentId
          })
        } else {
          changes.removed.push(oldSkill)
        }
      }
    }
  }

  // Find added skills
  for (const [path, newSkill] of newSkillMap) {
    if (!oldSkillMap.has(path) && !newSkill.oldName && !oldSkillsByName.has(newSkill.name)) {
      changes.added.push(newSkill)
    }
  }

  // Find reordered skills (excluding moved skills)
  const movedSkillNames = new Set(changes.moved.map(m => m.skill.name))
  for (const [path, newSkill] of newSkillMap) {
    const oldSkill = oldSkillsByName.get(newSkill.name)
    if (oldSkill &&
      oldSkill.sortOrder !== newSkill.sortOrder &&
      !movedSkillNames.has(newSkill.name)) {
      changes.reordered.push({
        skill: newSkill,
        oldOrder: oldSkill.sortOrder,
        newOrder: newSkill.sortOrder
      })
    }
  }

  console.log('Changes detected:', {
    added: changes.added.map(s => s.name),
    removed: changes.removed.map(s => s.name),
    renamed: changes.renamed.map(r => `${r.from.name} -> ${r.to.name}`),
    moved: changes.moved.map(m => `${m.skill.name}: ${m.oldParentId} -> ${m.newParentId}`),
    reordered: changes.reordered.map(r => `${r.skill.name}: ${r.oldOrder} -> ${r.newOrder}`)
  })

  return changes
}

const getSkillPath = (skill, skills) => {
  const path = []
  let current = skill

  while (current) {
    path.unshift(current.name)
    current = skills.find(s => s.name === current.parentId)
  }

  return path.join('/')
}

export { diffSkillTrees } 