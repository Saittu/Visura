export default {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.(t|j)s?(x)'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/.storybook/',
    'index\\.ts$',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePaths: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.ts'],
}
