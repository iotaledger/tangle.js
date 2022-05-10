module.exports = {
    globals: {
      "ts-jest": {
        useESM: true,
      },
    },
    preset: "ts-jest/presets/js-with-ts-esm-legacy",
    testMatch: ["<rootDir>/test/**/*.(test|spec).ts"],
    extensionsToTreatAsEsm: [".ts"],
    collectCoverage: true,
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
    testEnvironment: "node",
    moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.js$": "$1",
    },
  };
  