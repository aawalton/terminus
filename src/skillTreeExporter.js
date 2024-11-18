import supabase from './database.js'

async function fetchSkillChildren(parentId = null) {
  let query = supabase
    .schema('status')
    .from('skills')
    .select('id, name, description')
    .is('deleted_at', null)
    .order('name')

  if (parentId) {
    query = query.eq('parent_skill_id', parentId)
  } else {
    query = query.is('parent_skill_id', null)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching skills: ${error.message}`)
  }

  return data
}

async function buildMarkdownTree(parentId = null, level = 0) {
  const children = await fetchSkillChildren(parentId)
  let markdown = ''

  for (const skill of children) {
    // Add indentation and bullet point
    const indent = '  '.repeat(level)
    markdown += `${indent}- ${skill.name}`

    // Add description if it exists
    if (skill.description) {
      markdown += `: ${skill.description}`
    }
    markdown += '\n'

    // Recursively process children
    const childrenMarkdown = await buildMarkdownTree(skill.id, level + 1)
    markdown += childrenMarkdown
  }

  return markdown
}

async function exportSkillTreeToMarkdown() {
  try {
    const markdown = await buildMarkdownTree()
    return markdown
  } catch (error) {
    console.error('Failed to export skill tree:', error)
    throw error
  }
}

export { exportSkillTreeToMarkdown } 