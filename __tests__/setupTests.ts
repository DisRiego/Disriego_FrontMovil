import "@testing-library/jest-native/extend-expect"; // Agrega matchers extra para pruebas en RN
import "react-native-gesture-handler/jestSetup"; // Evita errores con `react-native-gesture-handler`

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
); // Mock para evitar errores en animaciones
