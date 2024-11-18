import { fileURLToPath } from 'node:url'
import supabase from '../database.js'

// Update the helper function to better handle all numbering patterns
function cleanSkillName(name) {
  // Remove section numbers and trim whitespace
  // Matches patterns like:
  // "10.2.1 ", "10.2 ", "10. ", "1. ", "2. ", "1. Matter and Energy"
  return name
    .replace(/^\d+\.?\s*/, '')           // Remove leading numbers with optional dot
    .replace(/^\d+\.\d+\.?\s*/, '')      // Remove X.Y format
    .replace(/^\d+\.\d+\.\d+\.?\s*/, '') // Remove X.Y.Z format
    .trim()
}

async function insertSkill(name, parentId = null) {
  const cleanName = cleanSkillName(name)
  console.log(`Attempting to insert skill: ${name} -> ${cleanName} with parent: ${parentId}`)

  const { data, error } = await supabase
    .schema('status')
    .from('skills')
    .insert({
      name: cleanName,
      parent_skill_id: parentId,
      description: null
    })
    .select('id')
    .single()

  if (error) {
    console.error('Database error:', error)
    throw error
  }

  console.log(`Successfully inserted skill: ${cleanName} with id: ${data.id}`)
  return data.id
}

async function findMathematicsId() {
  const { data, error } = await supabase
    .schema('status')
    .from('skills')
    .select('id')
    .eq('name', 'Mathematics')
    .single()

  if (error) {
    console.error('Error finding Mathematics skill:', error)
    throw error
  }

  return data.id
}

async function updateMathematicsParent(mathId, newParentId) {
  const { error } = await supabase
    .schema('status')
    .from('skills')
    .update({ parent_skill_id: newParentId })
    .eq('id', mathId)

  if (error) {
    console.error('Error updating Mathematics parent:', error)
    throw error
  }
}

async function findSkillByName(name) {
  const { data, error } = await supabase
    .schema('status')
    .from('skills')
    .select('id')
    .eq('name', name)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error finding skill:', error)
    throw error
  }

  return data?.id
}

async function updateSkillParent(skillId, newParentId) {
  const { error } = await supabase
    .schema('status')
    .from('skills')
    .update({ parent_skill_id: newParentId })
    .eq('id', skillId)

  if (error) {
    console.error('Error updating skill parent:', error)
    throw error
  }
}

// Map existing skills to their new parents in the outline
const skillMappings = {
  'Logic': 'Logic', // Now maps to the clean name
  'Philosophy of Mathematics': 'History and Foundations of Mathematics',
  'Pure Mathematics': 'Branches of Mathematics',
  'Applied Mathematics': 'Applications of Mathematics',
  'Mathematical Physics': 'Applications of Mathematics',
  'Mathematical Biology': 'Applications of Mathematics',
  'Statistical Inference': 'Applications of Mathematics',
  'Theoretical Computer Science': 'Applications of Mathematics'
}

async function mergeExistingSkills(sectionIds) {
  console.log('Merging existing skills with outline...')

  // Create a mapping of clean names to section IDs
  const cleanNameToId = Object.entries(sectionIds).reduce((acc, [key, value]) => {
    acc[cleanSkillName(key)] = value
    return acc
  }, {})

  for (const [existingSkill, newParent] of Object.entries(skillMappings)) {
    const skillId = await findSkillByName(existingSkill)
    if (skillId && cleanNameToId[newParent]) {
      console.log(`Moving ${existingSkill} under ${newParent}`)
      await updateSkillParent(skillId, cleanNameToId[newParent])
    }
  }
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
    console.log('Created root Knowledge node with id:', rootId)

    // Store IDs for sections we need to reference later
    const sectionIds = {}

    // Create root categories with complete nested structure - no numbers
    const outline = {
      'Matter and Energy': {
        'Atoms': [
          'Structure and Properties of Atoms',
          'Atomic Nuclei and Elementary Particles'
        ],
        'Energy, Radiation, and States of Matter': [
          'Chemical Elements: Periodic Variation in Their Properties',
          'Chemical Compounds: Molecular Structure and Chemical Bonding',
          'Chemical Reactions',
          'Heat, Thermodynamics, Liquids, Gases, Plasmas',
          'The Solid State of Matter',
          'Mechanics of Particles, Rigid and Deformable Bodies',
          'Electricity and Magnetism',
          'Waves and Wave Motion'
        ],
        'The Universe': [
          'The Cosmos',
          'Galaxies and Stars',
          'The Solar System'
        ]
      },
      'The Earth': {
        'Earth\'s Properties, Structure, Composition': [
          'The Planet Earth',
          'Earth\'s Physical Properties',
          'Structure and Composition of the Earth\'s Interior',
          'Minerals and Rocks'
        ],
        'Earth\'s Envelope': [
          'The Atmosphere',
          'The Hydrosphere: the Oceans, Freshwater and Ice Masses',
          'Weather and Climate'
        ],
        'Surface Features': [
          'Physical Features of the Earth\'s Surface',
          'Features Produced by Geomorphic Processes'
        ],
        'Earth\'s History': [
          'Origin and Development of the Earth and Its Envelopes',
          'The Interpretation of the Geologic Record',
          'Eras and Periods of Geologic Time'
        ]
      },
      'Life': {
        'The Nature and Diversity of Life': [
          'Characteristics of Life',
          'The Origin and Evolution of Life',
          'Classification of Living Things'
        ],
        'The Molecular Basis of Life': [
          'Chemicals and the Vital Processes',
          'Metabolism: Bioenergetics and Biosynthesis',
          'Vital Processes at the Molecular Level'
        ],
        'The Structures and Functions of Organisms': [
          'Cellular Basis of Form and Function',
          'Relation of Form and Function in Organisms',
          'Coordination of Vital Processes: Regulation and Integration',
          'Covering and Support: Integumentary, Skeletal, and Musculatory Systems',
          'Nutrition: the Procurement and Processing of Nutrients',
          'Gas Exchange, Internal Transport, and Elimination',
          'Reproduction and Sex',
          'Development: Growth, Differentiation, and Morphogenesis',
          'Heredity: the Transmission of Traits'
        ],
        'The Behavior of Organisms': [
          'Nature and Patterns of Behavior',
          'Development and Range of Behavioral Capacities: Individual and Group Behavior'
        ],
        'The Biosphere': [
          'Basic Features of the Biosphere',
          'Populations and Communities',
          'Disease and Death',
          'Biogeographic Distribution of Organisms: Ecosystems',
          'The Place of Humans in the Biosphere'
        ]
      },
      'Human Life': {
        'The Development of Human Life': [
          'Human Evolution',
          'Human Heredity: the Races'
        ],
        'The Human Body: Health and Disease': [
          'The Structures and Functions of the Human Body',
          'Human Health',
          'Human Diseases',
          'The Practice of Medicine and Care of Health'
        ],
        'Human Behavior and Experience': [
          'General theories of human nature and behavior',
          'Antecedent conditions and developmental processes affecting a person\'s behavior and conscious experience',
          'Influence of the current environment on a person\'s behavior and conscious experience',
          'Current Internal states affecting a person\'s behavior and conscious experience',
          'Development of Learning and Thinking',
          'Personality and the Self: Integration and Disintegration'
        ]
      },
      'Society': {
        'Social Groups: Ethnic groups and Cultures': [
          'Peoples and Cultures of the World',
          'The Development of Human Culture',
          'Major Cultural Components and Institutions of Societies',
          'Language and Communication'
        ],
        'Social Organization and Social Change': [
          'Social Structure and Change',
          'The Group Structure of Society',
          'Social Status',
          'Human Populations: Urban and Rural Communities'
        ],
        'The Production, Distribution, and Utilization of Wealth': [
          'Economic Concepts, Issues, and Systems',
          'Consumer and Market: Pricing and Mechanisms for Distributing Goods',
          'The Organization of Production and Distribution',
          'The Distribution of Income and Wealth',
          'Macroeconomics',
          'Economic Growth and Planning'
        ],
        'Politics and Government': [
          'Political Theory',
          'Political Institutions',
          'Functioning of Government',
          'International Relations: Peace and War'
        ],
        'Law': [
          'Philosophies and Systems of Law; the Practice of Law',
          'Branches of Public Law, Substantive and Procedural',
          'Branches of Private Law, Substantive and Procedural'
        ],
        'Education': [
          'Aims and Organization of Education',
          'Education Around the World'
        ]
      },
      'Art': {
        'Art in General': [
          'Theory and Classification of the Arts',
          'Experience and Criticism of Art; the Nonaesthetic Context of Art',
          'Characteristics of the Arts in Particular Cultures'
        ],
        'Particular Arts': [
          'Literature',
          'Theater',
          'Motion Pictures',
          'Music',
          'Dance',
          'Architecture, Garden and Landscape Design, and Urban Design',
          'Sculpture',
          'Drawing, Painting, Printmaking, Photography',
          'Decoration and Design'
        ]
      },
      'Technology': {
        'Nature & Development of Technology': [
          'Technology: Its Scope and History',
          'The Organization of Human Work'
        ],
        'Elements of Technology': [
          'Technology of Energy Conversion and Utilization',
          'Technology of Tools and Machines',
          'Technology of Measurement, Observation, and Control',
          'Extraction and Conversion of Industrial Raw Materials',
          'Technology of Industrial Production Processes'
        ],
        'Fields of Technology': [
          'Agriculture and Food Production',
          'Technology of the Major Industries',
          'Construction Technology',
          'Transportation Technology',
          'Technology of Information Processing and of Communications Systems',
          'Military Technology',
          'Technology of the Urban Community',
          'Technology of Earth and Space Exploration'
        ]
      },
      'Religion': {
        'Religion in General': [
          'Knowledge and Understanding of Religion',
          'Religious Life: Institutions and Practices'
        ],
        'Particular Religions': [
          'Prehistoric Religion and Primitive Religion',
          'Religions of Ancient Peoples',
          'Hinduism and Other Religions of India',
          'Buddhism',
          'Indigenous Religions of East Asia',
          'Judaism',
          'Christianity',
          'Islam',
          'Other Religions and Religious Movements in the Modern World'
        ]
      },
      'History': {
        'Ancient Southwest Asia, North Africa, and Europe': [
          'Ancient Southwest Asia and Egypt, the Aegean, and North Africa',
          'Ancient Europe and Classical Civilizations of the Mediterranean to AD 395'
        ],
        'Medieval Southwest Asia, North Africa, and Europe': [
          'The Byzantine Empire and Europe from AD 395–1050',
          'The Formative Period in Islamic History, AD 622–1055',
          'Western Christendom in the High and Later Middle Ages 1050–1500',
          'The Crusades, the Islamic States, and Eastern Christendom 1050–1480'
        ],
        'East, Central, South, and Southeast Asia': [
          'China to the Beginning of the Late T\'ang AD 755',
          'China from the Late T\'ang to the Late Ch\'ing AD 755–1839',
          'Central and Northeast Asia to 1750',
          'Japan to the Meiji Restoration 1868, Korea to 1910',
          'The Indian Subcontinent and Ceylon to AD 1200',
          'The Indian Subcontinent 1200–1761, Ceylon 1200–1505',
          'Southeast Asia to 1600'
        ],
        'Sub-Saharan Africa to 1885': [
          'West Africa to 1885',
          'The Nilotic Sudan and Ethiopia AD 550–1885',
          'East Africa and Madagascar to 1885',
          'Central Africa to 1885',
          'Southern Africa to 1885'
        ],
        'Pre-Columbian America': [
          'Andean Civilization to AD 1540',
          'Meso-American Civilization to AD 1540'
        ],
        'The Modern World to 1920': [
          'Western Europe 1500–1789',
          'Eastern Europe, Southwest Asia, and North Africa 1480–1800',
          'Europe 1789–1920',
          'European Colonies in the Americas 1492–1790',
          'United States and Canada 1763–1920',
          'Latin-America and Caribbean to 1920',
          'Australia and Oceania to 1920',
          'South Asia Under European Imperialism 1500–1920',
          'Southeast Asia Under European Imperialism 1600–1920',
          'China until Revolution 1839–1911, Japan from Meiji Restoration to 1910',
          'Southwest Asia, North Africa 1800–1920, Sub-Saharan Africa 1885–1920'
        ],
        'The World Since 1920': [
          'International Movements, Diplomacy and War Since 1920',
          'Europe Since 1920',
          'The United States and Canada Since 1920',
          'Latin American and Caribbean Nations Since 1920',
          'China in Revolution, Japanese Hegemony',
          'South and Southeast Asia: the Late Colonial Period and Nations Since 1920',
          'Australia and Oceania Since 1920',
          'Southwest Asia and Africa: the Late Colonial Period and Nations since 1920'
        ]
      },
      'Branches of Knowledge': {
        'Logic': [
          'History and Philosophy of Logic',
          'Formal Logic, Metalogic, & Applied Logic'
        ],
        'Mathematics': [
          'History and Foundations of Mathematics',
          'Branches of Mathematics',
          'Applications of Mathematics'
        ],
        'Science': [
          'History and Philosophy of Science',
          'The Physical Sciences',
          'The Earth Sciences',
          'The Biological Sciences',
          'Medicine',
          'The Social Sciences, Psychology, Linguistics',
          'The Technological Sciences'
        ],
        'History and The Humanities': [
          'Historiography',
          'The Humanities and Humanistic Scholarship'
        ],
        'Philosophy': [
          'History of Philosophy',
          'Divisions of Philosophy',
          'Philosophical Schools and Doctrines'
        ],
        'Preservation of Knowledge': [
          'Institutions and Techniques for the Collection, Storage, Dissemination and Preservation of Knowledge'
        ]
      }
    }

    // Create all three levels of the hierarchy
    for (const [topLevel, secondLevel] of Object.entries(outline)) {
      const topLevelId = await insertSkill(topLevel, rootId)  // Set parent to rootId
      sectionIds[topLevel] = topLevelId

      for (const [secondLevelName, thirdLevel] of Object.entries(secondLevel)) {
        const secondLevelId = await insertSkill(secondLevelName, topLevelId)
        sectionIds[secondLevelName] = secondLevelId

        for (const thirdLevelName of thirdLevel) {
          const thirdLevelId = await insertSkill(thirdLevelName, secondLevelId)
          sectionIds[thirdLevelName] = thirdLevelId
        }
      }
    }

    // Update the skill mappings to use clean names
    const skillMappings = {
      'Logic': 'Logic',
      'Philosophy of Mathematics': 'History and Foundations of Mathematics',
      'Pure Mathematics': 'Branches of Mathematics',
      'Applied Mathematics': 'Applications of Mathematics',
      'Mathematical Physics': 'Applications of Mathematics',
      'Mathematical Biology': 'Applications of Mathematics',
      'Statistical Inference': 'Applications of Mathematics',
      'Theoretical Computer Science': 'Applications of Mathematics'
    }

    // Find existing Mathematics skill
    const mathId = await findMathematicsId()

    // Update Mathematics parent to point to "Mathematics" section (using clean name)
    const mathSectionId = sectionIds['Mathematics']
    if (mathSectionId) {
      await updateMathematicsParent(mathId, mathSectionId)
    }

    // After creating the outline structure, merge existing skills
    await mergeExistingSkills(sectionIds)

    console.log('Outline of knowledge migration completed successfully')
  } catch (error) {
    console.error('Error migrating outline of knowledge:', error)
    throw error
  }
}

export default migrateOutlineOfKnowledge

// Run migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateOutlineOfKnowledge()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} 