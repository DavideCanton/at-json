/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    testEnvironment: 'node',
    restoreMocks: true,
    setupFilesAfterEnv: ['./setupJest.ts'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
    collectCoverageFrom: ['lib/**/*.ts'],
};

module.exports = config;
