import supabase from '../database.js'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Helper to insert a skill and return its ID
async function insertSkill(name, parentId = null) {
  console.log(`Attempting to insert skill: ${name} with parent: ${parentId}`)

  const { data, error } = await supabase
    .schema('status')
    .from('skills')
    .insert({
      name,
      parent_skill_id: parentId,
      description: null
    })
    .select('id')
    .single()

  if (error) {
    console.error('Database error:', {
      error: error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw error
  }

  console.log(`Successfully inserted skill: ${name} with id: ${data.id}`)
  return data.id
}

// Helper to parse a markdown list into a tree structure
function parseMarkdownList(content) {
  const lines = content.split('\n')
  const skills = []
  let currentCategory = null

  for (const line of lines) {
    // Match numbered categories (e.g., "1. Pure Mathematics")
    const categoryMatch = line.match(/^\d+\.\s+([^-].+)$/)
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim()
      skills.push({ name: currentCategory, level: 0 })
      continue
    }

    // Match bullet points
    const bulletMatch = line.match(/^(\s*)-\s*(.+)$/)
    if (bulletMatch) {
      const indent = bulletMatch[1].length
      const name = bulletMatch[2].trim()

      // Remove any [Level X] annotations
      const cleanName = name.replace(/\[Level \d+\]/, '').trim()

      skills.push({
        name: cleanName,
        level: (indent / 2) + 1  // Bullets are one level deeper than their category
      })
    }
  }

  return skills
}

async function migrateSkillTree() {
  try {
    console.log('Starting migration...')

    // Test database connection first
    const { data: testData, error: testError } = await supabase
      .schema('status')
      .from('skills')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('Database connection test failed:', {
        error: testError,
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code
      })
      throw testError
    }

    console.log('Database connection test successful:', testData)

    // First insert Mathematics as the root
    const mathId = await insertSkill('Mathematics')

    // Read and parse the main branches from math.md
    const mathContent = await fs.readFile(join(process.cwd(), 'learn-everything/math/math.md'), 'utf-8')
    const mainBranches = parseMarkdownList(mathContent)

    // Insert main branches under Mathematics
    for (const branch of mainBranches) {
      const branchId = await insertSkill(branch.name, mathId)

      // If this is "Foundations and Philosophy", add Logic under it
      if (branch.name.includes('Foundations and Philosophy')) {
        // Read and parse logic.md
        const logicContent = await fs.readFile(
          join(process.cwd(), 'learn-everything/math/1-foundations-and-philosophy/1-logic.md'),
          'utf-8'
        )
        const logicId = await insertSkill('Logic', branchId)
        const logicBranches = parseMarkdownList(logicContent)

        // Insert logic branches
        for (const logicBranch of logicBranches) {
          const logicBranchId = await insertSkill(logicBranch.name, logicId)

          // If this is "Formal Logic", add Propositional Logic under it
          if (logicBranch.name.includes('Formal Logic')) {
            // Read and parse propositional-logic.md
            const propLogicContent = await fs.readFile(
              join(process.cwd(), 'learn-everything/math/1-foundations-and-philosophy/1-logic/1-formal-logic/1-propositional-logic.md'),
              'utf-8'
            )
            const propLogicId = await insertSkill('Propositional Logic', logicBranchId)
            const propLogicBranches = parseMarkdownList(propLogicContent)

            // Insert propositional logic branches
            for (const propBranch of propLogicBranches) {
              await insertSkill(propBranch.name, propLogicId)
            }
          }
        }
      }
    }

    console.log('Skill tree migration completed successfully')
  } catch (error) {
    console.error('Error migrating skill tree:', {
      error: error,
      type: typeof error,
      keys: Object.keys(error),
      toString: error.toString(),
      name: error.name
    })
    throw error
  }
}

export default migrateSkillTree

// Run migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateSkillTree()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} 