/** @type {import('jest').Config} */
export default {
  transform: {},
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  projects: ['<rootDir>/packages/*'],
  moduleDirectories: ['node_modules'],
  testMatch: [
    '<rootDir>/packages/**/*.test.js'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: '<rootDir>/coverage'
} 
