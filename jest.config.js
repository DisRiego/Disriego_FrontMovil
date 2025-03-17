const path = require("path");

module.exports = {
  preset: "jest-expo",
  setupFiles: [
    "<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "@testing-library/jest-native/extend-expect",
  ],
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo-router|expo-asset|expo-constants|expo-font|expo-linking|expo-modules-core|expo-status-bar|expo)/)",
  ],
  testPathIgnorePatterns: ["<rootDir>/__tests__/setupTests.ts"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Jest Test Report",
        outputPath: path.join(__dirname, "reports", "jest-report.html"),
        includeFailureMsg: true,
        includeSuiteFailure: true,
        sort: "titleAsc",
      },
    ],
  ],
};
