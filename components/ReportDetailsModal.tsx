import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { Feather, AntDesign } from "@expo/vector-icons";

interface ReportDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  reportId: number;
  reportDate: string;
  propertyName: string;
  lotName: string;
  failureType: string;
  onViewDetails: () => void;
  onFinalize?: () => void;
  onDownload?: () => void;
  mode: "assigned" | "see";
  source: "report" | "maintenance";
}

export default function ReportDetailsModal({
  isVisible,
  onClose,
  reportId,
  reportDate,
  propertyName,
  lotName,
  failureType,
  onViewDetails,
  onFinalize,
  onDownload,
  mode,
  source,
}: ReportDetailsModalProps) {
  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Feather name="clipboard" size={22} color={colors.primary} />
            </View>
            <Text style={styles.title}>
              {source === "maintenance" ? "Fallo Sistema" : "Reporte"} #
              {reportId}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={22} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha del reporte</Text>
            <Text style={styles.value}>{reportDate}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Predio</Text>
            <Text style={styles.value}>{propertyName || "No disponible"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Lote</Text>
            <Text style={styles.value}>{lotName || "No disponible"}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Tipo de fallo</Text>
            <Text style={styles.value}>{failureType}</Text>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.actions}>
          {mode === "assigned" && (
            <>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={onViewDetails}
              >
                <Feather name="eye" size={17} color={colors.primary} />
                <Text style={styles.viewDetailsText}>Ver Detalles</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.finalizeButton}
                onPress={onFinalize}
              >
                <Feather name="edit" size={17} color={colors.primary} />
                <Text style={styles.finalizeText}>Finalizar</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === "see" && (
            <>
              {/* Botón de descarga deshabilitado temporalmente */}
              {/*
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={onDownload}
              >
                <Feather name="download" size={17} color={colors.primary} />
                <Text style={styles.viewDetailsText}>Descargar</Text>
              </TouchableOpacity>
              */}

              <TouchableOpacity
                style={styles.finalizeButton}
                onPress={onViewDetails}
              >
                <Feather name="eye" size={17} color={colors.primary} />
                <Text style={styles.finalizeText}>Ver Detalles</Text>
              </TouchableOpacity>
            </>
          )}
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
    height: 0.8,
    backgroundColor: colors.border,
    marginVertical: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
    gap: 32,
  },
  viewDetailsButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailsText: {
    color: colors.gray,
    ...typography.medium.medium,
    marginLeft: 8,
  },
  finalizeButton: {
    backgroundColor: colors.tertiary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
  },
  finalizeText: {
    color: colors.primary,
    ...typography.medium.medium,
    marginLeft: 8,
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
