/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // roots: ['<rootDir>/tests/'],
  // 実装の近くにテストコードを配置するため
  roots: ['<rootDir>/'],
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
};
