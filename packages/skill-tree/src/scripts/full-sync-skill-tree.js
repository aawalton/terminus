import fs from 'fs/promises'
import { parseSkillTree, extractSkillTreeMarkdown } from '../core/skill-tree-parser.js'
import { diffSkillTrees } from '../core/skill-tree-differ.js'
import { syncSkillTree } from '../core/skill-tree-sync.js'
import { exportSkillTreeToMarkdown } from '../core/skill-tree-exporter.js'

const SKILL_TREE_PATH = '../skill-tree.md'

async function main() {
  try {
    // Read the current file content
    const fileContent = await fs.readFile(SKILL_TREE_PATH, 'utf-8')
    const skillTreeMarkdown = extractSkillTreeMarkdown(fileContent)

    // Get the current database state as markdown
    const dbMarkdown = await exportSkillTreeToMarkdown()

    // Parse both versions
    const dbSkills = parseSkillTree(dbMarkdown)
    const fileSkills = parseSkillTree(skillTreeMarkdown)

    // Find and apply differences
    const changes = diffSkillTrees(dbSkills, fileSkills)
    await syncSkillTree(changes)

  } catch (error) {
    console.error('Error performing full sync:', error)
    process.exit(1)
  }
}

main() 