module.exports = {
    preset: "ts-jest",
    testMatch: ["<rootDir>/test/**/*.spec.ts"],
    collectCoverage: true,
    collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!<rootDir>/src/index.*", "!<rootDir>/src/**/I[A-Z]*.ts"],
    testEnvironment: "node"
};
