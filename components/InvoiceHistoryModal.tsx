import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { InvoiceDetailResponse } from "@/context/BillingContext";

interface InvoiceHistoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  invoice: InvoiceDetailResponse | null;
}

export default function InvoiceHistoryModal({
  isVisible,
  onClose,
  invoice,
}: InvoiceHistoryModalProps) {
  const handleOpenPdf = async () => {
    const pdfUrl = invoice?.invoice?.pdf_url;
    if (!pdfUrl || !pdfUrl.endsWith(".pdf")) {
      alert("No se encontró un PDF válido.");
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch (error) {
      console.error("Error al abrir el PDF:", error);
      alert("No se pudo abrir el archivo PDF.");
    }
  };

  if (!invoice) return null;

  const { invoice: inv, payment } = invoice;

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Factura No. {inv.invoice_id}</Text>
            <Text style={styles.subtext}>
              Fecha Vencimiento: {inv.expiration_date?.split("T")[0] ?? "—"}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={22} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Info rows */}
        <View style={styles.row}>
          <Text style={styles.label}>Valor de transacción</Text>
          <Text style={styles.value}>
            ${payment?.transaction_amount?.toLocaleString("es-CO") ?? "—"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Periodo facturado</Text>
          <Text style={styles.value}>
            {inv.start_date?.split("T")[0] ?? "—"} al{" "}
            {inv.end_date?.split("T")[0] ?? "—"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>Referencia de pago</Text>
          <Text style={styles.value}>{payment?.reference_code ?? "—"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha de pago</Text>
          <Text style={styles.value}>
            {payment?.payment_date?.split("T")[0] ?? "—"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Método de pago</Text>
          <Text style={styles.value}>{payment?.payment_method ?? "—"}</Text>
        </View>

        {/* Botón de descarga */}
        {inv.pdf_url && inv.pdf_url.endsWith(".pdf") && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleOpenPdf}
          >
            <Text style={styles.downloadButtonText}>Descargar factura</Text>
            <Feather name="download" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  container: {
    backgroundColor: "white",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerText: { gap: 4 },
  title: {
    ...typography.medium.large,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  subtext: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  value: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  downloadButton: {
    backgroundColor: colors.tertiary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    justifyContent: "center",
    marginTop: 20,
  },
  downloadButtonText: {
    color: colors.primary,
    ...typography.medium.medium,
    marginRight: 8,
  },
});
