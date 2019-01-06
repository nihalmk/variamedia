module.exports = {
  globalSetup: './inMemoryTest/setup.js',
  globalTeardown: './inMemoryTest/teardown.js',
  testEnvironment: './inMemoryTest/mongo-environment.js',
    transform: {
      ".(ts|tsx)": "ts-jest"
    },
    testRegex: ".*\\.spec\\.ts$",
    moduleFileExtensions: [
      "ts",
      "js",
      "json"
    ]
};
