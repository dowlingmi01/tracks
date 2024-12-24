// jest.config.js
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./src/tests/setup.js'],
    testMatch: ['**/*.test.js'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    verbose: true,
  };