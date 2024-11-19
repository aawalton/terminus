const extractSkillTreeMarkdown = (fileContent) => {
  const lines = fileContent.split('\n')
  // Find the start of the skill tree (after "Instructions" section)
  const startIndex = lines.findIndex(line => line === 'Skill Tree')
  if (startIndex === -1) throw new Error('Could not find skill tree start')

  // Join all lines after "Skill Tree"
  return lines.slice(startIndex + 1).join('\n')
}

const parseSkillTree = (markdown) => {
  const lines = markdown.split('\n')
  const skills = []
  const stack = [{ level: -1, id: null }]
  let currentOrder = 0

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue

    // Count leading spaces/dashes to determine level
    const level = (line.match(/^\s*/)[0].length) / 2

    // Extract skill name, handling rename syntax
    let name = line.trim().replace(/^-\s*/, '')
    const isRename = name.includes(' -> ')
    const oldName = isRename ? name.split(' -> ')[0] : null
    name = isRename ? name.split(' -> ')[1] : name

    // Pop stack until we find the parent
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }

    const parentId = stack[stack.length - 1].id

    skills.push({
      name,
      oldName,
      parentId,
      level,
      sortOrder: currentOrder++
    })

    stack.push({ level, id: name }) // Using name as temporary ID
  }

  return skills
}

export { parseSkillTree, extractSkillTreeMarkdown } 