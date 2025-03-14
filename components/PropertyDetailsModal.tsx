import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather } from "@expo/vector-icons";

interface PropertyDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  name: string;
  id: string;
  folio: string;
  latitud: string;
  longitud: string;
  extension: string;
}

export default function PropertyDetailsModal({
  isVisible,
  onClose,
  name,
  id,
  folio,
  latitud,
  longitud,
  extension,
}: PropertyDetailsModalProps) {
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
            <Text style={styles.value}>{folio}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.label}>Latitud</Text>
            <Text style={styles.value}>{latitud}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Longitud</Text>
            <Text style={styles.value}>{longitud}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Extensión (m²)</Text>
            <Text style={styles.value}>{extension}</Text>
          </View>
          <View style={styles.separator} />
        </View>

        {/* Botones */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.downloadButton}>
            <AntDesign name="download" size={16} color={colors.gray} />
            <Text style={styles.downloadText}>Descargar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsText}>Ver Detalles</Text>
            <Feather name="eye" size={16} color={colors.primary} />
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
    justifyContent: "space-between",
    marginTop: 12,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.gray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  downloadText: {
    color: colors.gray,
    fontSize: 14,
    marginLeft: 8,
  },
  detailsButton: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  detailsText: {
    color: colors.primary,
    fontSize: 14,
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
