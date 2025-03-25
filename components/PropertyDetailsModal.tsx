import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { generatePropertyPDF } from "@/utils/generatePropertyPDF";

interface PropertyDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  name: string;
  id: string;
  real_estate_registration_number: string;
  latitude: string;
  longitude: string;
  extension: string;
}

export default function PropertyDetailsModal({
  isVisible,
  onClose,
  name,
  id,
  real_estate_registration_number,
  latitude,
  longitude,
  extension,
}: PropertyDetailsModalProps) {
  const router = useRouter();

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      {/* Contenedor principal */}
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
        </View>

        {/* Botones */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => {
              generatePropertyPDF({
                id,
                name,
                real_estate_registration_number,
                latitude,
                longitude,
                extension,
              });
            }}
          >
            <AntDesign name="download" size={17} color={colors.darkGray} />
            <Text style={styles.downloadText}>Descargar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              onClose();
              router.push({
                pathname: "/properties/detailsProperties",
                params: {
                  id,
                  name,
                  real_estate_registration_number,
                  latitude,
                  longitude,
                  extension,
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
