const path = require("path");

module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // Mapea @/ a la raíz del proyecto
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@config/(.*)$": "<rootDir>/config/$1",
    "^@app/(.*)$": "<rootDir>/app/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@expo/vector-icons|expo-font|expo-modules-core|react-native-reanimated)/)",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "@testing-library/jest-native/extend-expect",
  ],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
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
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
};
