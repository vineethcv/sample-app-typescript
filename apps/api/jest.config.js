
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.(t|j)sx?$': ['ts-jest', {}] },
  moduleFileExtensions: ['ts', 'js'],
  rootDir: '.',
  testMatch: ['**/*.spec.ts']
}
