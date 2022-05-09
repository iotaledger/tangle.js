module.exports = {
    "testMatch": [
        "<rootDir>/test/**/*.(test|spec).ts"
    ],
    "transform": {
        "^.+\\.ts$": "ts-jest",
        "^.+\\.js$": "ts-jest"
    },
    "extensionsToTreatAsEsm": [".ts"],
    "collectCoverage": true,
    "collectCoverageFrom": [
        '<rootDir>/src/**/*.ts'
    ],
    "testEnvironment": "node"
}
