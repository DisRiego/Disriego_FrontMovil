import "react-native-gesture-handler/jestSetup";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import "@testing-library/jest-native/extend-expect";
import fetchMock from "jest-fetch-mock";

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
}));
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("lucide-react-native", () => ({
  Eye: jest.fn(({ children }) => children),
  EyeOff: jest.fn(({ children }) => children),
}));
// jest.setup.js
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn((title, message) =>
    console.log(`Alert: ${title} - ${message}`)
  ),
}));
jest.mock("axios");
// Agrega esto al inicio del archivo
jest.mock("expo-modules-core", () => ({
  requireNativeModule: jest.fn(() => ({
    requestMediaLibraryPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" })
    ),
    launchImageLibraryAsync: jest.fn(),
  })),
}));

// Mock completo para expo-image-picker
jest.mock("expo-image-picker", () => {
  const mockLaunchImageLibrary = jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "file://mock-image.jpg" }],
    })
  );

  return {
    launchImageLibraryAsync: mockLaunchImageLibrary,
    MediaTypeOptions: {
      Images: "Images",
    },
    requestMediaLibraryPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" })
    ),
  };
});

fetchMock.enableMocks();
beforeAll(() => {
  process.env.EXPO_OS = "android";
  console.log("🔹 Iniciando pruebas...");
});

afterAll(() => {
  console.log("✅ Pruebas finalizadas.");
});
jest.mock("@expo/vector-icons", () => ({
  Feather: jest.fn(),
}));

jest.mock("react-native-svg", () => {
  const React = require("react");
  return {
    Svg: jest.fn(({ children }) => React.createElement("Svg", {}, children)),
    Circle: jest.fn((props) => React.createElement("Circle", props)),
    Text: jest.fn((props) => React.createElement("Text", props)),
  };
});

jest.mock("@/services/auth", () => ({
  getUserData: jest.fn(),
}));

