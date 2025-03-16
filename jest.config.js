module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo-router|expo-asset|expo-constants|expo-font|expo-linking|expo-modules-core|expo-status-bar|expo)/)",
  ],
  testPathIgnorePatterns: ["<rootDir>/__tests__/setupTests.ts"],
  setupFiles: [
    "<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/jest.setup.js"
  ],  
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
        outputPath: "reports/jest-report.html",
        includeFailureMsg: true,
        includeSuiteFailure: true,
        append: true, // 🔹 Evita sobrescribir el archivo, acumula resultados
        sort: "titleAsc",
      },
    ],
  ],
};
