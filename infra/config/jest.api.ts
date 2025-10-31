import baseConfig from './jest.base'

export default {
  ...baseConfig,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  rootDir: './src',
  coverageDirectory: '../coverage',
}
