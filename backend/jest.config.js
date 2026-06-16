module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  testMatch: ["<rootDir>/src/tests/**/*.test.js"],
  moduleNameMapper: {
    "^../utils/prisma$": "<rootDir>/src/__mocks__/prisma.js",
    "^../../utils/prisma$": "<rootDir>/src/__mocks__/prisma.js",
    "^../../../utils/prisma$": "<rootDir>/src/__mocks__/prisma.js",
  },
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/websocket.js",
  ],
};
