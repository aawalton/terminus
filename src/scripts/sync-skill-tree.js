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

    console.log('Content lengths - Committed:', committedContent.length, 'Staged:', stagedContent.length)

    // Extract skill tree markdown
    const committedSkillTree = extractSkillTreeMarkdown(committedContent)
    const stagedSkillTree = extractSkillTreeMarkdown(stagedContent)

    console.log('\nFirst few lines of committed skill tree:')
    console.log(committedSkillTree.split('\n').slice(0, 5).join('\n'))
    console.log('\nFirst few lines of staged skill tree:')
    console.log(stagedSkillTree.split('\n').slice(0, 5).join('\n'))

    // Parse both versions
    const oldSkills = parseSkillTree(committedSkillTree)
    const newSkills = parseSkillTree(stagedSkillTree)

    console.log('\nSample of parsed skills:')
    console.log('Old first 3:', oldSkills.slice(0, 3))
    console.log('New first 3:', newSkills.slice(0, 3))

    console.log('Parsed skill counts - Old:', oldSkills.length, 'New:', newSkills.length)

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

function getCommittedContent(filepath) {
  try {
    // Get the content from the last commit
    return execSync(`git show HEAD:${filepath}`, { encoding: 'utf-8' })
  } catch (error) {
    console.error('Error getting committed content:', error)
    return null
  }
}

function getStagedContent(filepath) {
  try {
    // First, check if the file is staged
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    if (!stagedFiles.includes(filepath)) {
      console.log('File is not staged')
      return null
    }

    // Get the staged content
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
  // Replace "old_name -> new_name" with "new_name"
  return content.replace(/[\w\s-]+\s*->\s*([\w\s-]+)/g, '$1')
}

main() 