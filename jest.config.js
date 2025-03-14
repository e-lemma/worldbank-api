/** @type {import('ts-jest').JestConfigWithTsJest} **/
export const preset = 'ts-jest'
export const testEnvironment = 'node'
export const roots = ['<rootDir>/src/', '<rootDir>/tests/']
export const transform = {
  '^.+\.tsx?$': ['ts-jest', {}]
}
export const testRegex = '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$'
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
export const collectCoverage = true
export const coverageReporters = ['text', 'lcov']
export const coverageDirectory = './coverage'
export const coveragePathIgnorePatterns = [
  '/node_modules/',
  '/dist/',
  '/tests/'
]
export const moduleNameMapper = {
  '(.+)\\.js': '$1'
}
