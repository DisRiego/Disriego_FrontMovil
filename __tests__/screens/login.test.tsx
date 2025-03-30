import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "../../app/(auth)/login";

// Mock the services/auth module
jest.mock("@/services/auth", () => ({
  login: jest.fn(),
}));

describe("LoginScreen - Inputs", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("Se puede escribir en el campo de correo", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("Correo Electrónico");

    fireEvent.changeText(emailInput, "usuario@email.com");

    expect(emailInput.props.value).toBe("usuario@email.com");
  });

  test("Se puede escribir en el campo de contraseña", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText("Contraseña");

    fireEvent.changeText(passwordInput, "miClave123");

    expect(passwordInput.props.value).toBe("miClave123");
  });
});
