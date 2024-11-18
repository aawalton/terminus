import { fileURLToPath } from 'node:url'
import supabase from '../database.js'

export { migrateOutlineOfKnowledge as default }
// Create root categories with complete nested structure
const outline = [
  {
    name: 'Matter and Energy',
    children: [
      {
        name: 'Atoms',
        children: [
          { name: 'Structure and Properties of Atoms' },
          { name: 'Atomic Nuclei and Elementary Particles' }
        ]
      },
      {
        name: 'Energy, Radiation, and States of Matter',
        children: [
          { name: 'Chemical Elements: Periodic Variation in Their Properties' },
          { name: 'Chemical Compounds: Molecular Structure and Chemical Bonding' },
          { name: 'Chemical Reactions' },
          { name: 'Heat, Thermodynamics, Liquids, Gases, Plasmas' },
          { name: 'The Solid State of Matter' },
          { name: 'Mechanics of Particles, Rigid and Deformable Bodies' },
          { name: 'Electricity and Magnetism' },
          { name: 'Waves and Wave Motion' }
        ]
      },
      {
        name: 'The Universe',
        children: [
          { name: 'The Cosmos' },
          { name: 'Galaxies and Stars' },
          { name: 'The Solar System' }
        ]
      }
    ]
  },
  {
    name: 'The Earth',
    children: [
      {
        name: 'Earth\'s Properties, Structure, Composition',
        children: [
          { name: 'The Planet Earth' },
          { name: 'Earth\'s Physical Properties' },
          { name: 'Structure and Composition of the Earth\'s Interior' },
          { name: 'Minerals and Rocks' }
        ]
      },
      {
        name: 'Earth\'s Envelope',
        children: [
          { name: 'The Atmosphere' },
          { name: 'The Hydrosphere: the Oceans, Freshwater and Ice Masses' },
          { name: 'Weather and Climate' }
        ]
      },
      {
        name: 'Surface Features',
        children: [
          { name: 'Physical Features of the Earth\'s Surface' },
          { name: 'Features Produced by Geomorphic Processes' }
        ]
      },
      {
        name: 'Earth\'s History',
        children: [
          { name: 'Origin and Development of the Earth and Its Envelopes' },
          { name: 'The Interpretation of the Geologic Record' },
          { name: 'Eras and Periods of Geologic Time' }
        ]
      }
    ]
  },
  {
    name: 'Life',
    children: [
      {
        name: 'The Nature and Diversity of Life',
        children: [
          { name: 'Characteristics of Life' },
          { name: 'The Origin and Evolution of Life' },
          { name: 'Classification of Living Things' }
        ]
      },
      {
        name: 'The Molecular Basis of Life',
        children: [
          { name: 'Chemicals and the Vital Processes' },
          { name: 'Metabolism: Bioenergetics and Biosynthesis' },
          { name: 'Vital Processes at the Molecular Level' }
        ]
      },
      {
        name: 'The Structures and Functions of Organisms',
        children: [
          { name: 'Cellular Basis of Form and Function' },
          { name: 'Relation of Form and Function in Organisms' },
          { name: 'Coordination of Vital Processes: Regulation and Integration' },
          { name: 'Covering and Support: Integumentary, Skeletal, and Musculatory Systems' },
          { name: 'Nutrition: the Procurement and Processing of Nutrients' },
          { name: 'Gas Exchange, Internal Transport, and Elimination' },
          { name: 'Reproduction and Sex' },
          { name: 'Development: Growth, Differentiation, and Morphogenesis' },
          { name: 'Heredity: the Transmission of Traits' }
        ]
      },
      {
        name: 'The Behavior of Organisms',
        children: [
          { name: 'Nature and Patterns of Behavior' },
          { name: 'Development and Range of Behavioral Capacities: Individual and Group Behavior' }
        ]
      },
      {
        name: 'The Biosphere',
        children: [
          { name: 'Basic Features of the Biosphere' },
          { name: 'Populations and Communities' },
          { name: 'Disease and Death' },
          { name: 'Biogeographic Distribution of Organisms: Ecosystems' },
          { name: 'The Place of Humans in the Biosphere' }
        ]
      }
    ]
  },
  {
    name: 'Human Life',
    children: [
      {
        name: 'The Development of Human Life',
        children: [
          { name: 'Human Evolution' },
          { name: 'Human Heredity: the Races' }
        ]
      },
      {
        name: 'The Human Body: Health and Disease',
        children: [
          { name: 'The Structures and Functions of the Human Body' },
          { name: 'Human Health' },
          { name: 'Human Diseases' },
          { name: 'The Practice of Medicine and Care of Health' }
        ]
      },
      {
        name: 'Human Behavior and Experience',
        children: [
          { name: 'General theories of human nature and behavior' },
          { name: 'Antecedent conditions and developmental processes affecting a person\'s behavior and conscious experience' },
          { name: 'Influence of the current environment on a person\'s behavior and conscious experience' },
          { name: 'Current Internal states affecting a person\'s behavior and conscious experience' },
          { name: 'Development of Learning and Thinking' },
          { name: 'Personality and the Self: Integration and Disintegration' }
        ]
      }
    ]
  },
  {
    name: 'Society',
    children: [
      {
        name: 'Social Groups: Ethnic groups and Cultures',
        children: [
          { name: 'Peoples and Cultures of the World' },
          { name: 'The Development of Human Culture' },
          { name: 'Major Cultural Components and Institutions of Societies' },
          { name: 'Language and Communication' }
        ]
      },
      {
        name: 'Social Organization and Social Change',
        children: [
          { name: 'Social Structure and Change' },
          { name: 'The Group Structure of Society' },
          { name: 'Social Status' },
          { name: 'Human Populations: Urban and Rural Communities' }
        ]
      },
      {
        name: 'The Production, Distribution, and Utilization of Wealth',
        children: [
          { name: 'Economic Concepts, Issues, and Systems' },
          { name: 'Consumer and Market: Pricing and Mechanisms for Distributing Goods' },
          { name: 'The Organization of Production and Distribution' },
          { name: 'The Distribution of Income and Wealth' },
          { name: 'Macroeconomics' },
          { name: 'Economic Growth and Planning' }
        ]
      },
      {
        name: 'Politics and Government',
        children: [
          { name: 'Political Theory' },
          { name: 'Political Institutions' },
          { name: 'Functioning of Government' },
          { name: 'International Relations: Peace and War' }
        ]
      },
      {
        name: 'Law',
        children: [
          { name: 'Philosophies and Systems of Law; the Practice of Law' },
          { name: 'Branches of Public Law, Substantive and Procedural' },
          { name: 'Branches of Private Law, Substantive and Procedural' }
        ]
      },
      {
        name: 'Education',
        children: [
          { name: 'Aims and Organization of Education' },
          { name: 'Education Around the World' }
        ]
      }
    ]
  },
  {
    name: 'Art',
    children: [
      {
        name: 'Art in General',
        children: [
          { name: 'Theory and Classification of the Arts' },
          { name: 'Experience and Criticism of Art; the Nonaesthetic Context of Art' },
          { name: 'Characteristics of the Arts in Particular Cultures' }
        ]
      },
      {
        name: 'Particular Arts',
        children: [
          { name: 'Literature' },
          { name: 'Theater' },
          { name: 'Motion Pictures' },
          { name: 'Music' },
          { name: 'Dance' },
          { name: 'Architecture, Garden and Landscape Design, and Urban Design' },
          { name: 'Sculpture' },
          { name: 'Drawing, Painting, Printmaking, Photography' },
          { name: 'Decoration and Design' }
        ]
      }
    ]
  },
  {
    name: 'Technology',
    children: [
      {
        name: 'Nature & Development of Technology',
        children: [
          { name: 'Technology: Its Scope and History' },
          { name: 'The Organization of Human Work' }
        ]
      },
      {
        name: 'Elements of Technology',
        children: [
          { name: 'Technology of Energy Conversion and Utilization' },
          { name: 'Technology of Tools and Machines' },
          { name: 'Technology of Measurement, Observation, and Control' },
          { name: 'Extraction and Conversion of Industrial Raw Materials' },
          { name: 'Technology of Industrial Production Processes' }
        ]
      },
      {
        name: 'Fields of Technology',
        children: [
          { name: 'Agriculture and Food Production' },
          { name: 'Technology of the Major Industries' },
          { name: 'Construction Technology' },
          { name: 'Transportation Technology' },
          { name: 'Technology of Information Processing and of Communications Systems' },
          { name: 'Military Technology' },
          { name: 'Technology of the Urban Community' },
          { name: 'Technology of Earth and Space Exploration' }
        ]
      }
    ]
  },
  {
    name: 'Religion',
    children: [
      {
        name: 'Religion in General',
        children: [
          { name: 'Knowledge and Understanding of Religion' },
          { name: 'Religious Life: Institutions and Practices' }
        ]
      },
      {
        name: 'Particular Religions',
        children: [
          { name: 'Prehistoric Religion and Primitive Religion' },
          { name: 'Religions of Ancient Peoples' },
          { name: 'Hinduism and Other Religions of India' },
          { name: 'Buddhism' },
          { name: 'Indigenous Religions of East Asia' },
          { name: 'Judaism' },
          { name: 'Christianity' },
          { name: 'Islam' },
          { name: 'Other Religions and Religious Movements in the Modern World' }
        ]
      }
    ]
  },
  {
    name: 'History',
    children: [
      {
        name: 'Ancient Southwest Asia, North Africa, and Europe',
        children: [
          { name: 'Ancient Southwest Asia and Egypt, the Aegean, and North Africa' },
          { name: 'Ancient Europe and Classical Civilizations of the Mediterranean to AD 395' }
        ]
      },
      {
        name: 'Medieval Southwest Asia, North Africa, and Europe',
        children: [
          { name: 'The Byzantine Empire and Europe from AD 395–1050' },
          { name: 'The Formative Period in Islamic History, AD 622–1055' },
          { name: 'Western Christendom in the High and Later Middle Ages 1050–1500' },
          { name: 'The Crusades, the Islamic States, and Eastern Christendom 1050–1480' }
        ]
      },
      {
        name: 'East, Central, South, and Southeast Asia',
        children: [
          { name: 'China to the Beginning of the Late T\'ang AD 755' },
          { name: 'China from the Late T\'ang to the Late Ch\'ing AD 755–1839' },
          { name: 'Central and Northeast Asia to 1750' },
          { name: 'Japan to the Meiji Restoration 1868, Korea to 1910' },
          { name: 'The Indian Subcontinent and Ceylon to AD 1200' },
          { name: 'The Indian Subcontinent 1200–1761, Ceylon 1200–1505' },
          { name: 'Southeast Asia to 1600' }
        ]
      },
      {
        name: 'Sub-Saharan Africa to 1885',
        children: [
          { name: 'West Africa to 1885' },
          { name: 'The Nilotic Sudan and Ethiopia AD 550–1885' },
          { name: 'East Africa and Madagascar to 1885' },
          { name: 'Central Africa to 1885' },
          { name: 'Southern Africa to 1885' }
        ]
      },
      {
        name: 'Pre-Columbian America',
        children: [
          { name: 'Andean Civilization to AD 1540' },
          { name: 'Meso-American Civilization to AD 1540' }
        ]
      },
      {
        name: 'The Modern World to 1920',
        children: [
          { name: 'Western Europe 1500–1789' },
          { name: 'Eastern Europe, Southwest Asia, and North Africa 1480–1800' },
          { name: 'Europe 1789–1920' },
          { name: 'European Colonies in the Americas 1492–1790' },
          { name: 'United States and Canada 1763–1920' },
          { name: 'Latin-America and Caribbean to 1920' },
          { name: 'Australia and Oceania to 1920' },
          { name: 'South Asia Under European Imperialism 1500–1920' },
          { name: 'Southeast Asia Under European Imperialism 1600–1920' },
          { name: 'China until Revolution 1839–1911, Japan from Meiji Restoration to 1910' },
          { name: 'Southwest Asia, North Africa 1800–1920, Sub-Saharan Africa 1885–1920' }
        ]
      },
      {
        name: 'The World Since 1920',
        children: [
          { name: 'International Movements, Diplomacy and War Since 1920' },
          { name: 'Europe Since 1920' },
          { name: 'The United States and Canada Since 1920' },
          { name: 'Latin American and Caribbean Nations Since 1920' },
          { name: 'China in Revolution, Japanese Hegemony' },
          { name: 'South and Southeast Asia: the Late Colonial Period and Nations Since 1920' },
          { name: 'Australia and Oceania Since 1920' },
          { name: 'Southwest Asia and Africa: the Late Colonial Period and Nations since 1920' }
        ]
      }
    ]
  },
  {
    name: 'Branches of Knowledge',
    children: [
      {
        name: 'Logic',
        children: [
          { name: 'History and Philosophy of Logic' },
          {
            name: 'Formal Logic, Metalogic, & Applied Logic',
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
              { name: 'Informal Logic' },
              { name: 'Mathematical Logic' },
              { name: 'Philosophical Logic' },
              { name: 'Computational Logic' },
              { name: 'Applied Logic' },
              { name: 'Non-Classical Logics' }
            ]
          }
        ]
      },
      {
        name: 'Mathematics',
        children: [
          { name: 'History and Foundations of Mathematics' },
          {
            name: 'Branches of Mathematics',
            children: [
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
              }
            ]
          },
          {
            name: 'Applications of Mathematics',
            children: [
              { name: 'Mathematical Physics' },
              { name: 'Mathematical Biology' },
              { name: 'Financial Mathematics' },
              { name: 'Operations Research' },
              { name: 'Cryptography' }
            ]
          }
        ]
      },
      {
        name: 'Science',
        children: [
          { name: 'History and Philosophy of Science' },
          { name: 'The Physical Sciences' },
          { name: 'The Earth Sciences' },
          { name: 'The Biological Sciences' },
          { name: 'Medicine' },
          { name: 'The Social Sciences, Psychology, Linguistics' },
          { name: 'The Technological Sciences' }
        ]
      },
      {
        name: 'History and The Humanities',
        children: [
          { name: 'Historiography' },
          { name: 'The Humanities and Humanistic Scholarship' }
        ]
      },
      {
        name: 'Philosophy',
        children: [
          { name: 'History of Philosophy' },
          { name: 'Divisions of Philosophy' },
          { name: 'Philosophical Schools and Doctrines' }
        ]
      },
      {
        name: 'Preservation of Knowledge',
        children: [
          { name: 'Institutions and Techniques for the Collection, Storage, Dissemination and Preservation of Knowledge' }
        ]
      }
    ]
  }
]


async function insertSkill(name, parentId = null, sortOrder = null) {
  console.log(`Inserting skill: ${name} (sort_order: ${sortOrder})`)

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

  return data.id
}

async function insertSkillTree(node, parentId = null, index = 0) {
  const skillId = await insertSkill(node.name, parentId, index)

  if (node.children) {
    for (const [childIndex, child] of node.children.entries()) {
      await insertSkillTree(child, skillId, childIndex)
    }
  }

  return skillId
}

async function migrateOutlineOfKnowledge() {
  try {
    console.log('Starting outline of knowledge migration...')

    // Create the root "Knowledge" node first
    const { data: rootData, error: rootError } = await supabase
      .schema('status')
      .from('skills')
      .insert({
        name: 'Knowledge',
        parent_skill_id: null,
        description: null
      })
      .select('id')
      .single()

    if (rootError) {
      console.error('Error creating root node:', rootError)
      throw rootError
    }

    const rootId = rootData.id
    console.log('Created root Knowledge node')

    // Process the entire tree recursively
    for (const [topLevelIndex, topLevel] of outline.entries()) {
      await insertSkillTree(topLevel, rootId, topLevelIndex)
    }

    console.log('Outline of knowledge migration completed successfully')
  } catch (error) {
    console.error('Error migrating outline of knowledge:', error)
    throw error
  }
}

// Run migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateOutlineOfKnowledge()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} 