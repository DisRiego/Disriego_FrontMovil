import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.setTimeout(30000); // ⏳ Aumenta el tiempo máximo de ejecución de las pruebas

beforeAll(() => {
  console.log("🔹 Iniciando pruebas...");
});

afterAll(() => {
  console.log("✅ Pruebas finalizadas.");
});
