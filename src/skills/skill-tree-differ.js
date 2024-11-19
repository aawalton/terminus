const diffSkillTrees = (oldSkills, newSkills) => {
  const changes = {
    added: [],
    removed: [],
    renamed: [],
    reordered: []
  }

  // Create maps for easier lookup
  const oldSkillMap = new Map(oldSkills.map(skill => [getSkillPath(skill, oldSkills), skill]))
  const newSkillMap = new Map(newSkills.map(skill => [getSkillPath(skill, newSkills), skill]))

  // Find removed and renamed skills
  for (const [path, oldSkill] of oldSkillMap) {
    if (!newSkillMap.has(path)) {
      // Check if it was renamed
      const renamedSkill = newSkills.find(s => s.oldName === oldSkill.name)
      if (renamedSkill) {
        changes.renamed.push({ from: oldSkill, to: renamedSkill })
      } else {
        changes.removed.push(oldSkill)
      }
    }
  }

  // Find added skills
  for (const [path, newSkill] of newSkillMap) {
    if (!oldSkillMap.has(path) && !newSkill.oldName) {
      changes.added.push(newSkill)
    }
  }

  // Find reordered skills
  for (const [path, newSkill] of newSkillMap) {
    const oldSkill = oldSkillMap.get(path)
    if (oldSkill && oldSkill.sortOrder !== newSkill.sortOrder) {
      changes.reordered.push({
        skill: newSkill,
        oldOrder: oldSkill.sortOrder,
        newOrder: newSkill.sortOrder
      })
    }
  }

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