import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// 🔹 Aseguramos que Jest use el mock de AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

beforeAll(() => {
  console.log("🔹 Iniciando pruebas...");
});

afterAll(() => {
  console.log("✅ Pruebas finalizadas.");
});
