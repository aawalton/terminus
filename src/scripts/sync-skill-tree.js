import fs from 'fs/promises'
import { parseSkillTree, extractSkillTreeMarkdown } from '../skills/skill-tree-parser.js'
import { diffSkillTrees } from '../skills/skill-tree-differ.js'
import { syncSkillTree } from '../skills/skill-tree-sync.js'
import { execSync } from 'child_process'

const SKILL_TREE_PATH = 'src/skills/skill-tree.md'

async function main() {
  try {
    // Get the staged content of the skill tree file
    const stagedContent = getStagedContent(SKILL_TREE_PATH)
    if (!stagedContent) {
      console.log('No changes to skill tree')
      process.exit(0)
    }

    // Get the current content from the working directory
    const currentContent = await fs.readFile(SKILL_TREE_PATH, 'utf-8')

    // Parse both versions
    const oldSkills = parseSkillTree(extractSkillTreeMarkdown(currentContent))
    const newSkills = parseSkillTree(extractSkillTreeMarkdown(stagedContent))

    // Find differences
    const changes = diffSkillTrees(oldSkills, newSkills)

    // Sync changes to database
    await syncSkillTree(changes)

    // If there were renames, simplify them in the file
    if (changes.renamed.length > 0) {
      const simplifiedContent = simplifyRenames(stagedContent)
      await fs.writeFile(SKILL_TREE_PATH, simplifiedContent)
      // Stage the simplified changes
      stageFile(SKILL_TREE_PATH)
    }

  } catch (error) {
    console.error('Error syncing skill tree:', error)
    process.exit(1)
  }
}

function getStagedContent(filepath) {
  try {
    // Get the staged version using git cat-file
    const hash = execSync('git write-tree', { encoding: 'utf-8' }).trim()
    return execSync(`git cat-file -p ${hash}:${filepath}`, { encoding: 'utf-8' })
  } catch (error) {
    // If the command fails, try getting it from the index
    try {
      return execSync(`git show :${filepath}`, { encoding: 'utf-8' })
    } catch (indexError) {
      console.error('Error getting staged content:', indexError)
      return null
    }
  }
}

function stageFile(filepath) {
  execSync(`git add ${filepath}`)
}

function simplifyRenames(content) {
  // Replace "old_name -> new_name" with "new_name"
  return content.replace(/[\w\s-]+\s*->\s*([\w\s-]+)/g, '$1')
}

main() 