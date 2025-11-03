module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ["<rootDir>/tests"], // or wherever your tests are
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};