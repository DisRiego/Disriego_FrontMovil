import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "../../app/(auth)/login";

describe("LoginScreen - Inputs", () => {
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
