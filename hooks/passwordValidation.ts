import { useState } from "react";

// Hook para la validación de contraseñas
export const usePasswordValidation = () => {
  // Estado para almacenar los errores de validación
  const [errors, setErrors] = useState({
    password: false,
    confirmPassword: false,
  });

  // Valida que la contraseña tenga mínimo 12 caracteres, un número y una letra mayúscula y minúscula
  const validatePassword = (password: string) => {
    return (
      password.length >= 8 &&
      /\d/.test(password) &&
      /(?=.*[a-z])(?=.*[A-Z])/.test(password) &&
      /[.,;_@%+\-]/.test(password)
    );
  };

  // Maneja el cambio de la contraseña y actualiza los errores de validación
  const handlePasswordChange = (
    text: string,
    setPassword: (val: string) => void
  ) => {
    setPassword(text);
    setErrors((prev) => ({
      ...prev,
      password: text.length === 0 ? false : !validatePassword(text),
    }));
  };

  // Maneja la confirmación de contraseña y verifica que coincida con la original
  const handleConfirmPasswordChange = (
    text: string,
    password: string,
    setConfirmPassword: (val: string) => void
  ) => {
    setConfirmPassword(text);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: text.length === 0 ? false : text !== password,
    }));
  };

  return {
    errors,
    validatePassword,
    handlePasswordChange,
    handleConfirmPasswordChange,
  };
};
