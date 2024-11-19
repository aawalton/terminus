import supabase from '../database.js'

async function fetchSkillTree() {
  const { data: skills, error } = await supabase
    .schema('status')
    .from('skills')
    .select('id, name, parent_skill_id, sort_order')
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching skills:', error)
    throw error
  }

  // Build tree structure
  const skillMap = new Map(skills.map(skill => [skill.id, { ...skill, children: [] }]))
  const root = []

  for (const skill of skills) {
    const node = skillMap.get(skill.id)
    if (skill.parent_skill_id === null) {
      root.push(node)
    } else {
      const parent = skillMap.get(skill.parent_skill_id)
      if (parent) {
        parent.children.push(node)
      }
    }
  }

  // Sort all children arrays by sort_order, then by name
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      // If both have sort_order, use that first
      if (a.sort_order !== null && b.sort_order !== null) {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order
        }
      }
      // If only one has sort_order, put it first
      if (a.sort_order !== null) return -1
      if (b.sort_order !== null) return 1
      // If neither has sort_order or they're equal, sort by name
      return a.name.localeCompare(b.name)
    })
    // Recursively sort children
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children)
      }
    }
  }

  sortNodes(root)
  return root
}

function generateMarkdown(node, level = 0) {
  const indent = '  '.repeat(level)
  let result = `${indent}- ${node.name}\n`

  if (node.children.length > 0) {
    for (const child of node.children) {
      result += generateMarkdown(child, level + 1)
    }
  }

  return result
}

export async function exportSkillTreeToMarkdown() {
  const tree = await fetchSkillTree()
  let markdown = ''
  for (const node of tree) {
    markdown += generateMarkdown(node)
  }
  return markdown
} 