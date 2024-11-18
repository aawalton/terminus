import { fileURLToPath } from 'node:url'
import supabase from '../database.js'

// Track IDs of nodes we create explicitly
const createdNodes = new Map()

async function insertSkill(name, parentId = null, sortOrder = null) {
  // If we've already created this node, just update its parent if needed
  if (createdNodes.has(name)) {
    const existingId = createdNodes.get(name)
    if (parentId !== null) {
      console.log(`Updating parent for existing ${name} to: ${parentId}`)
      await updateSkillParent(existingId, parentId)
    }
    return existingId
  }

  console.log(`Attempting to insert skill: ${name} with parent: ${parentId} (sort_order: ${sortOrder})`)

  const { data, error } = await supabase
    .schema('status')
    .from('skills')
    .insert({
      name,
      parent_skill_id: parentId,
      description: null,
      sort_order: sortOrder
    })
    .select('id')
    .single()

  if (error) {
    console.error('Database error:', error)
    throw error
  }

  console.log(`Successfully inserted skill: ${name} with id: ${data.id}`)
  createdNodes.set(name, data.id)
  return data.id
}

async function updateSkillParent(skillId, parentId) {
  const { error } = await supabase
    .schema('status')
    .from('skills')
    .update({ parent_skill_id: parentId })
    .eq('id', skillId)

  if (error) {
    console.error('Error updating skill parent:', error)
    throw error
  }
}

const mathTree = {
  name: 'Mathematics',
  children: [
    {
      name: 'Foundations and Philosophy',
      children: [
        {
          name: 'Logic',
          children: [
            {
              name: 'Formal Logic',
              children: [
                {
                  name: 'Propositional Logic',
                  children: [
                    {
                      name: 'Fundamentals',
                      children: [
                        { name: 'Propositions and Truth Values' },
                        { name: 'Logical Connectives' },
                        { name: 'Truth Tables' },
                        { name: 'Logical Equivalence' }
                      ]
                    },
                    {
                      name: 'Formal Systems',
                      children: [
                        { name: 'Syntax and Well-Formed Formulas' },
                        { name: 'Axioms and Inference Rules' },
                        { name: 'Proof Systems (Natural Deduction, Sequent Calculus)' },
                        { name: 'Soundness and Completeness' }
                      ]
                    },
                    {
                      name: 'Logical Operations',
                      children: [
                        { name: 'Conjunction and Disjunction' },
                        { name: 'Negation and Implication' },
                        { name: 'Exclusive OR and Biconditional' },
                        { name: 'Order of Operations' }
                      ]
                    },
                    {
                      name: 'Normal Forms',
                      children: [
                        { name: 'Conjunctive Normal Form (CNF)' },
                        { name: 'Disjunctive Normal Form (DNF)' },
                        { name: 'Negation Normal Form (NNF)' },
                        { name: 'Prenex Normal Form' }
                      ]
                    },
                    {
                      name: 'Logical Analysis',
                      children: [
                        { name: 'Tautologies and Contradictions' },
                        { name: 'Satisfiability and Validity' },
                        { name: 'Logical Consequence' },
                        { name: 'Argument Forms and Fallacies' }
                      ]
                    },
                    {
                      name: 'Advanced Concepts',
                      children: [
                        { name: 'Boolean Algebra and Propositional Logic' },
                        { name: 'Functional Completeness' },
                        { name: 'Decidability and Complexity' },
                        { name: 'Limitations of Propositional Logic' }
                      ]
                    },
                    {
                      name: 'Applications',
                      children: [
                        { name: 'Digital Circuit Design' },
                        { name: 'Expert Systems' },
                        { name: 'Automated Reasoning' },
                        { name: 'Formal Verification' }
                      ]
                    }
                  ]
                },
                { name: 'Predicate Logic' },
                { name: 'Modal Logic' },
                { name: 'Temporal Logic' }
              ]
            },
            {
              name: 'Informal Logic',
              children: [
                { name: 'Critical Thinking' },
                { name: 'Argumentation Theory' },
                { name: 'Fallacies' },
                { name: 'Rhetoric' }
              ]
            },
            {
              name: 'Mathematical Logic',
              children: [
                { name: 'Set Theory' },
                { name: 'Proof Theory' },
                { name: 'Model Theory' },
                { name: 'Recursion Theory' }
              ]
            },
            {
              name: 'Philosophical Logic',
              children: [
                { name: 'Epistemology and Logic' },
                { name: 'Metaphysics and Logic' },
                { name: 'Ethics and Logic' },
                { name: 'Philosophy of Language and Logic' }
              ]
            },
            {
              name: 'Computational Logic',
              children: [
                { name: 'Boolean Algebra' },
                { name: 'Fuzzy Logic' },
                { name: 'Quantum Logic' },
                { name: 'Logic Programming' }
              ]
            },
            {
              name: 'Applied Logic',
              children: [
                { name: 'Legal Reasoning' },
                { name: 'Scientific Method' },
                { name: 'Decision Theory' },
                { name: 'Game Theory' }
              ]
            },
            {
              name: 'Non-Classical Logics',
              children: [
                { name: 'Many-Valued Logic' },
                { name: 'Paraconsistent Logic' },
                { name: 'Intuitionistic Logic' },
                { name: 'Relevance Logic' }
              ]
            }
          ]
        },
        { name: 'Set Theory' },
        { name: 'Category Theory' },
        { name: 'Philosophy of Mathematics' }
      ]
    },
    {
      name: 'Pure Mathematics',
      children: [
        { name: 'Number Theory' },
        { name: 'Algebra' },
        { name: 'Geometry' },
        { name: 'Analysis' },
        { name: 'Topology' },
        { name: 'Combinatorics' }
      ]
    },
    {
      name: 'Discrete Mathematics',
      children: [
        { name: 'Graph Theory' },
        { name: 'Coding Theory' },
        { name: 'Combinatorics' }
      ]
    },
    {
      name: 'Probability and Statistics',
      children: [
        { name: 'Probability Theory' },
        { name: 'Statistical Inference' },
        { name: 'Data Science' }
      ]
    },
    {
      name: 'Computational Mathematics',
      children: [
        { name: 'Theoretical Computer Science' },
        { name: 'Numerical Analysis' },
        { name: 'Optimization' }
      ]
    },
    {
      name: 'Applied Mathematics',
      children: [
        { name: 'Mathematical Physics' },
        { name: 'Mathematical Biology' },
        { name: 'Financial Mathematics' },
        { name: 'Operations Research' },
        { name: 'Cryptography' }
      ]
    }
  ]
}

async function migrateSkillTree() {
  try {
    console.log('Starting migration...')

    // Test database connection
    const { data: testData, error: testError } = await supabase
      .schema('status')
      .from('skills')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('Database connection test failed:', testError)
      throw testError
    }

    console.log('Database connection test successful:', testData)

    // Recursive function to insert a node and all its children
    async function insertNode(node, parentId = null, index = 0) {
      const nodeId = await insertSkill(node.name, parentId, index)

      if (node.children) {
        for (const [childIndex, child] of node.children.entries()) {
          await insertNode(child, nodeId, childIndex)
        }
      }
    }

    // Start the insertion with the root node
    await insertNode(mathTree)

    console.log('Skill tree migration completed successfully')
  } catch (error) {
    console.error('Error migrating skill tree:', error)
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