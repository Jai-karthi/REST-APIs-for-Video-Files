module.exports = {
    testEnvironment: "node",
    coverageDirectory: "coverage",
    collectCoverage: true,
    coverageReporters: ["json", "lcov", "text", "clover"],
    testMatch: ["**/tests/**/*.[jt]s?(x)"], 
    "collectCoverageFrom": ["src/**/*.js"],
    "coveragePathIgnorePatterns": ["/node_modules/", "/dist/"],
  };
  