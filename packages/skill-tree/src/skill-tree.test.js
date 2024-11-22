import fs from 'fs/promises'
import { parseSkillTree, extractSkillTreeMarkdown } from './core/skill-tree-parser.js'
import { exportSkillTreeToMarkdown } from './core/skill-tree-exporter.js'

describe('Skill Tree Consistency', () => {
  it('database should match file representation', async () => {
    // Read the original file
    const fileContent = await fs.readFile('src/skill-tree.md', 'utf-8')
    const originalMarkdown = extractSkillTreeMarkdown(fileContent)

    // Get the database representation as markdown
    const exportedMarkdown = await exportSkillTreeToMarkdown()

    // Normalize both markdown strings (trim whitespace, normalize line endings)
    const normalizeMarkdown = (md) => {
      return md.split('\n')
        .map(line => line.trimEnd()) // Remove trailing whitespace
        .filter(line => line.trim() !== '') // Remove empty lines
        .join('\n')
    }

    const normalizedOriginal = normalizeMarkdown(originalMarkdown)
    const normalizedExported = normalizeMarkdown(exportedMarkdown)

    // Compare the markdown representations
    expect(normalizedExported).toBe(normalizedOriginal)

    // Also verify that parsing both produces the same structure
    const originalTree = parseSkillTree(originalMarkdown)
    const exportedTree = parseSkillTree(exportedMarkdown)

    // Compare the parsed trees (ignoring oldName since exports won't have it)
    const compareTrees = (tree1, tree2) => {
      expect(tree1.length).toBe(tree2.length)

      for (let i = 0; i < tree1.length; i++) {
        const skill1 = tree1[i]
        const skill2 = tree2[i]

        expect(skill1.name).toBe(skill2.name)
        expect(skill1.level).toBe(skill2.level)
        expect(skill1.sortOrder).toBe(skill2.sortOrder)
        expect(skill1.parentId).toBe(skill2.parentId)
      }
    }

    compareTrees(originalTree, exportedTree)
  })
}) 