import React from "react";
import StatusCard from "@/components/StatusCard";
import { View, StyleSheet, Text } from "react-native";
import { colors } from "../../config/theme";
import { typography } from "../../config/typography";
import Button from "../../components/Button";

interface UpdateSuccessProps {
  status?: "exito" | "error";
  message?: string;
  description?: string;
  onPress: () => void;
}

const UpdateSuccess: React.FC<UpdateSuccessProps> = ({
  status = "exito",
  message = status === "exito"
    ? "¡Actualización exitosa!"
    : "Error en la actualización",
  description = status === "error"
    ? "Los cambios han sido guardados correctamente."
    : "Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.",
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <StatusCard
          status={status}
          message={message}
          description={description}
          onPress={onPress}
        />
      </View>
      <View style={styles.footerContainer}>
        <Button
          text={status === "error" ? "Siguiente" : "Reintentar"}
          onPress={onPress}
        />
      </View>
    </View>
  );
};

export default UpdateSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  formContainer: {
    flex: 1,
    gap: 14,
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.base,
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
});