import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useBillingContext } from "@/context/BillingContext";
import { Invoice } from "@/context/BillingContext";

interface InvoiceDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function InvoiceDetailsModal({
  isVisible,
  onClose,
  invoice,
}: InvoiceDetailsModalProps) {
  const router = useRouter();
  const { setSelectedInvoice } = useBillingContext();

  const handlePay = () => {
    if (!invoice) return;
    setSelectedInvoice(invoice);
    router.push("/billing/paymentMethods");
    // no llamar onClose aquí
  };

  const handleOpenPdf = async () => {
    if (!invoice?.pdfUrl || !invoice.pdfUrl.endsWith(".pdf")) {
      alert("No se encontró un PDF válido.");
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(invoice.pdfUrl);
    } catch (error) {
      console.error("Error al abrir el PDF:", error);
      alert("No se pudo abrir el archivo PDF.");
    }
  };

  if (!invoice) return null;

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Factura No. {invoice.invoice_id}</Text>
            <Text style={styles.subtext}>
              Fecha Vencimiento:{" "}
              {invoice.dueDate?.split?.("T")?.[0] ?? "Sin fecha"}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={22} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View style={styles.row}>
          <Text style={styles.label}>Total a pagar:</Text>
          <Text style={styles.value}>{invoice.amount}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>Predio #{invoice.propertyId}</Text>
          <Text style={styles.value}>{invoice.propertyName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Lote #{invoice.lotId}</Text>
          <Text style={styles.value}>{invoice.lotName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha Emisión</Text>
          <Text style={styles.value}>
            {invoice.emissionDate?.split?.("T")?.[0] ?? "Sin fecha"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Intervalo de pago</Text>
          <Text style={styles.value}>{invoice.paymentInterval}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>{invoice.status}</Text>
        </View>

        {/* Botones */}
        <View style={styles.actions}>
          {invoice.pdfUrl?.endsWith(".pdf") && (
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={handleOpenPdf}
            >
              <Feather name="download" size={16} color={colors.darkGray} />
              <Text style={styles.detailsText}>Ver PDF</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.buttonPrimary} onPress={handlePay}>
            <Text style={styles.buttonPrimaryText}>Pagar</Text>
            <FontAwesome name="dollar" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
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
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
    gap: 32,
  },
  detailsButton: {
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
  detailsText: {
    color: colors.gray,
    ...typography.medium.medium,
    marginLeft: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.tertiary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
  },
  buttonPrimaryText: {
    color: colors.primary,
    ...typography.medium.medium,
    marginRight: 8,
  },
});
