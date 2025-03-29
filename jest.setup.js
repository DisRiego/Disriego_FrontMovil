// jest.setup.js
import "react-native-gesture-handler/jestSetup";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import "@testing-library/jest-native/extend-expect";

// Mocks necesarios
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);
jest.mock("expo-modules-core", () => ({
  EventEmitter: jest.fn(),
  NativeModule: jest.fn(),
}));
jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  useFonts: jest.fn().mockReturnValue([true, null]),
}));
jest.mock("@expo/vector-icons", () => ({
  AntDesign: jest.fn(),
  // Añade otros iconos que uses
}));
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

beforeAll(() => {
  process.env.EXPO_OS = "ios";
  console.log("🔹 Iniciando pruebas...");
});

afterAll(() => {
  console.log("✅ Pruebas finalizadas.");
});
