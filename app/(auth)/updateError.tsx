import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/config/theme";
import StatusCard from "@/components/StatusCard";
import Button from "@/components/Button";
import Header from "@/components/Header";

interface UpdateErrorProps {
  message?: string;
  description?: string;
}

const UpdateError: React.FC<UpdateErrorProps> = ({
  message = "Error en la actualización",
  description = "Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.",
}) => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <StatusCard
            status="error"
            message={message}
            description={description}
          />
        </View>
        <View style={styles.footerContainer}>
          <Button
            text="Reintentar"
            onPress={() => router.push("/completeInfo")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UpdateError;

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
