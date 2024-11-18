import { exportSkillTreeToMarkdown } from '../skillTreeExporter.js'

async function main() {
  try {
    const markdown = await exportSkillTreeToMarkdown()
    console.log(markdown)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main() 