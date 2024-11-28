import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const projectId = process.env.SUPABASE_PROJECT_ID;

const command =
  `npx supabase gen types typescript --project-id "${projectId}" --schema status`;

try {
  // Generate types
  const types = execSync(command).toString();

  // Write to file
  const typesPath = path.resolve('./src/database.types.ts');
  fs.writeFileSync(typesPath, types);

  console.log('Successfully generated database types!');
} catch (error) {
  console.error('Error generating database types:', error);
  process.exit(1);
} 