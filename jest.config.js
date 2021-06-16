module.exports = {
    "testMatch": [
        "<rootDir>/test/**/*.active.(test|spec).ts"
    ],
    "transform": {
        "^.+\\.ts$": "ts-jest"
    },
    "collectCoverage": true,
    "collectCoverageFrom": [
        '<rootDir>/src/**/*.ts'
    ],
    "testEnvironment": "node"
}
