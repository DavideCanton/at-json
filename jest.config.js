/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    setupFilesAfterEnv: ["jest-extended"],
    restoreMocks: true,
    globals: {
        'ts-jest': {

        }
    }
};

module.exports = config;
