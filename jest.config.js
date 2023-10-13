/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    restoreMocks: true,
    setupFilesAfterEnv: ['./setupJest.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {}],
    },
    collectCoverageFrom: ['lib/**/*.ts'],
};

module.exports = config;
