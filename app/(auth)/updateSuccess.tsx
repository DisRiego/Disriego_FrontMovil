import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/config/theme";
import StatusCard from "@/components/StatusCard";
import Button from "@/components/Button";
import Header from "@/components/Header";

interface UpdateSuccessProps {
  status?: "exito" | "error";
  message?: string;
  description?: string;
}

const UpdateSuccess: React.FC<UpdateSuccessProps> = ({
  status = "exito",
  message = status === "exito"
    ? "¡Actualización exitosa!"
    : "Error en la actualización",
  description = status === "exito"
    ? "Los cambios han sido guardados correctamente."
    : "Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.",
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      router.push(status === "exito" ? "/home" : "/completeInfo");
      setIsLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <StatusCard
            status={status}
            message={message}
            description={description}
          />
        </View>
        <View style={styles.footerContainer}>
          <Button
            text={status === "exito" ? "Siguiente" : "Reintentar"}
            onPress={handlePress}
            disabled={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UpdateSuccess;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
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
