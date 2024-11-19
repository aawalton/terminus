import fs from 'fs/promises'
import { parseSkillTree, extractSkillTreeMarkdown } from '../skills/skill-tree-parser.js'
import { diffSkillTrees } from '../skills/skill-tree-differ.js'
import { syncSkillTree } from '../skills/skill-tree-sync.js'
import { execSync } from 'child_process'

const SKILL_TREE_PATH = 'src/skills/skill-tree.md'

async function main() {
  try {
    // Get both versions of the content
    const stagedContent = getStagedContent(SKILL_TREE_PATH)
    if (!stagedContent) {
      console.log('No staged changes found')
      process.exit(0)
    }

    const committedContent = getCommittedContent(SKILL_TREE_PATH)
    if (!committedContent) {
      console.log('No committed version found')
      process.exit(1)
    }

    // Extract skill tree markdown
    const committedSkillTree = extractSkillTreeMarkdown(committedContent)
    const stagedSkillTree = extractSkillTreeMarkdown(stagedContent)

    // Parse both versions
    const oldSkills = parseSkillTree(committedSkillTree)
    const newSkills = parseSkillTree(stagedSkillTree)

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
    console.error('Error syncing staged changes:', error)
    process.exit(1)
  }
}

function getCommittedContent(filepath) {
  try {
    return execSync(`git show HEAD:${filepath}`, { encoding: 'utf-8' })
  } catch (error) {
    console.error('Error getting committed content:', error)
    return null
  }
}

function getStagedContent(filepath) {
  try {
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    if (!stagedFiles.includes(filepath)) {
      console.log('File is not staged')
      return null
    }

    const content = execSync('git show :./' + filepath, { encoding: 'utf-8' })
    if (!content) {
      console.log('No content found in staged version')
      return null
    }

    return content
  } catch (error) {
    console.error('Error getting staged content:', error)
    return null
  }
}

function stageFile(filepath) {
  execSync(`git add ${filepath}`)
}

function simplifyRenames(content) {
  return content.replace(/[\w\s-]+\s*->\s*([\w\s-]+)/g, '$1')
}

main() 