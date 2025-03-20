import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { generateLotPDF } from "@/utils/generatePDFLot";

interface LotDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  name: string;
  id: string;
  real_estate_registration_number: string;
  latitude: string;
  longitude: string;
  extension: string;
  cropType: string;
  paymentInterval: string;
  propertyId: string; // 🔹 ID del predio
  propertyName: string; // 🔹 Nombre del predio
}

export default function LotDetailsModal({
  isVisible,
  onClose,
  name,
  id,
  real_estate_registration_number,
  latitude,
  longitude,
  extension,
  cropType,
  paymentInterval,
  propertyId,
  propertyName,
}: LotDetailsModalProps) {
  const router = useRouter();

  // Función para generar el PDF y luego descargarlo
  const handleDownload = async () => {
    try {
      const pdfUri = await generateLotPDF({
        propertyId, // 🔹 ID del predio
        propertyName, // 🔹 Nombre del predio
        name, // Nombre del lote
        id, // ID del lote
        real_estate_registration_number,
        latitude,
        longitude,
        extension,
        cropType,
        paymentInterval,
      });
    } catch (error) {
      console.error("Error al generar o descargar el PDF:", error);
    }
  };

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Feather name="map" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>{name}</Text>
              <Text style={styles.idText}>#{id}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={22} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Folio Matrícula</Text>
            <Text style={styles.value}>{real_estate_registration_number}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Latitud</Text>
            <Text style={styles.value}>{latitude}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Longitud</Text>
            <Text style={styles.value}>{longitude}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Extensión (m²)</Text>
            <Text style={styles.value}>{extension}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Cultivo</Text>
            <Text style={styles.value}>{cropType}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Intervalo de Pago</Text>
            <Text style={styles.value}>{paymentInterval}</Text>
          </View>
          <View style={styles.separator} />
        </View>

        {/* Botones */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
          >
            <AntDesign name="download" size={17} color={colors.darkGray} />
            <Text style={styles.downloadText}>Descargar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              onClose(); // Cierra el modal antes de navegar
              router.push({
                pathname: "/properties/detailsLot",
                params: {
                  id,
                  name,
                  real_estate_registration_number,
                  latitude,
                  longitude,
                  extension,
                  cropType,
                  paymentInterval,
                },
              });
            }}
          >
            <Text style={styles.detailsText}>Ver Detalles</Text>
            <Feather name="eye" size={17} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: "white",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...typography.semibold.medium,
    marginLeft: 8,
  },
  idText: {
    color: colors.gray,
    ...typography.regular.large,
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: colors.white,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  label: {
    color: colors.darkGray,
    fontSize: 14,
  },
  value: {
    color: colors.darkGray,
    fontWeight: "600",
    fontSize: 14,
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
    gap: 32,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
  },
  downloadText: {
    color: colors.gray,
    ...typography.medium.medium,
    marginLeft: 8,
  },
  detailsButton: {
    backgroundColor: colors.tertiary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
  },
  detailsText: {
    color: colors.primary,
    ...typography.medium.medium,
    marginRight: 8,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F1F2F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
});
