import fs from 'fs/promises'
import { parseSkillTree } from '../skills/skill-tree-parser.js'
import { diffSkillTrees } from '../skills/skill-tree-differ.js'
import { syncSkillTree } from '../skills/skill-tree-sync.js'

const SKILL_TREE_PATH = 'src/skills/skill-tree.md'

async function main() {
  try {
    // Get the staged content of the skill tree file
    const stagedContent = await getStagedContent(SKILL_TREE_PATH)
    if (!stagedContent) {
      console.log('No changes to skill tree')
      process.exit(0)
    }

    // Get the current content from the working directory
    const currentContent = await fs.readFile(SKILL_TREE_PATH, 'utf-8')

    // Parse both versions
    const oldSkills = parseSkillTree(currentContent)
    const newSkills = parseSkillTree(stagedContent)

    // Find differences
    const changes = diffSkillTrees(oldSkills, newSkills)

    // Sync changes to database
    await syncSkillTree(changes)

    // If there were renames, simplify them in the file
    if (changes.renamed.length > 0) {
      const simplifiedContent = simplifyRenames(stagedContent)
      await fs.writeFile(SKILL_TREE_PATH, simplifiedContent)
      // Stage the simplified changes
      await stageFile(SKILL_TREE_PATH)
    }

  } catch (error) {
    console.error('Error syncing skill tree:', error)
    process.exit(1)
  }
}

async function getStagedContent(filepath) {
  // Get the staged content using git show
  try {
    const { execSync } = require('child_process')
    return execSync(`git show :${filepath}`, { encoding: 'utf-8' })
  } catch (error) {
    return null
  }
}

async function stageFile(filepath) {
  const { execSync } = require('child_process')
  execSync(`git add ${filepath}`)
}

function simplifyRenames(content) {
  // Replace "old_name -> new_name" with "new_name"
  return content.replace(/[\w\s-]+\s*->\s*([\w\s-]+)/g, '$1')
}

main() 