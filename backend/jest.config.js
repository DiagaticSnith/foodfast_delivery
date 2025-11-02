module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  reporters: [
    'default',
    [ 'jest-junit', { outputDirectory: './reports/junit', outputName: 'junit.xml' } ]
  ],
};
