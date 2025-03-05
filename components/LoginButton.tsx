import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";

interface LoginButtonProps {
  text: string;
  icon: any;
  onPress: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ text, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row", // Coloca el icono y el texto en la misma línea
    alignItems: "center", // Asegura que estén alineados verticalmente
    justifyContent: "center", // Centra el contenido dentro del botón
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.white,
    marginBottom: 15,
    height: 55,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10, // Espacio entre icono y texto
  },
  text: {
    ...typography.medium.medium,
    color: colors.gray,
    textAlign: "center", // Asegura que el texto esté bien alineado
  },
});

export default LoginButton;
