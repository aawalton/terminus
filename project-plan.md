# Objective

As I'm preparing to add an Expo app to the repo, it's time to convert the repo into a monorepo, so I can separate the client and server code.

I'd like to use Yarn Workspaces and Turborepo for my monorepo.

# Design

For structure, I'm thinking monorepo packages are represented as folders inside of a packages folder:
```
packages/
  ├── server/
  ├── client/
  ├── shared/
  ├── supabase/
  ├── skill-tree/
  └── exercise/
```

# Execution

1. Initialize Monorepo Structure
   - [x] Convert root package.json to support Yarn workspaces
   - [x] Create packages/ directory with initial structure:
     ```
     packages/
       ├── server/
       ├── client/
       ├── shared/
       ├── supabase/
       ├── skill-tree/
       └── exercise/
     ```
   - [x] Set up Turborepo configuration in root

2. Configure Root Package
   - [x] Update package.json to define workspaces
   - [x] Add turbo.json for build configuration
   - [ ] Move root-level dev dependencies needed across packages
   - [x] Set up root-level scripts for managing the monorepo

3. Initialize Package Structure
   - [x] Create package.json for each package (server, client, shared)
   - [x] Set up proper dependencies and peer dependencies
   - [x] Configure package-specific scripts
   - [ ] Ensure each package has proper tsconfig.json (if using TypeScript) [N/A - not using TypeScript]

4. Configure Build Pipeline
   - [x] Set up Turborepo pipeline configuration
   - [x] Define build dependencies between packages
   - [ ] Configure shared development scripts
   - [ ] Set up proper source maps and build output

5. Development Environment
   - [ ] Configure VS Code workspace settings
   - [ ] Update .gitignore for monorepo structure
   - [ ] Set up shared ESLint/Prettier config
   - [ ] Configure concurrent development scripts

6. Testing Infrastructure
   - [ ] Set up Jest configurations for each package
   - [ ] Configure test scripts in turbo.json
   - [ ] Ensure proper test isolation between packages

7. CI/CD Updates
   - [ ] Update any existing CI/CD pipelines for monorepo
   - [ ] Configure proper caching for Turborepo
   - [ ] Set up package-specific deployment flows

Next Steps:
1. Move skill tree code to @terminus/skill-tree package
   - Move src/skills/* to packages/skill-tree/src/
   - Move src/scripts/* to packages/skill-tree/src/scripts/
   - Update imports to use new package paths
   - Update server package to use @terminus/skill-tree
2. Update .gitignore for monorepo structure
3. Set up Jest configurations for each package
4. Configure VS Code workspace settings

Current Status:
- Basic monorepo structure is in place
- Package.json files are configured
- Turborepo is set up
- Supabase package extracted
- Need to continue code migration and environment configuration