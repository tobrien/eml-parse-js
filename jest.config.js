module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    collectCoverageFrom: ['src/**/*.ts'],
    coverageThreshold: {
        global: {
            branches: 45,
            functions: 70,
            lines: 56,
            statements: 57,
        },
    },
}; 