import React, { useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import { useLocalSearchParams } from "expo-router";
import InvoiceHistoryCard from "@/components/InvoiceHistoryCard";
import { useBillingContext } from "@/context/BillingContext";
import InvoiceHistoryModal from "@/components/InvoiceHistoryModal"; // Importa el modal

export default function BillingHistoryScreen() {
  const { lotName, lotId, propertyName, propertyId } = useLocalSearchParams();
  const { invoices, fetchInvoiceDetails, invoiceDetail, setInvoiceDetail } =
    useBillingContext();

  const [loadingId, setLoadingId] = useState<number | null>(null);

  const invoicesForLot = useMemo(() => {
    return invoices
      .filter((inv) => inv.lotId === lotId && inv.status === "Pagada")
      .sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )
      .slice(0, 4);
  }, [invoices, lotId]);

  const handleCardPress = async (invoiceId: number) => {
    setLoadingId(invoiceId);
    const detail = await fetchInvoiceDetails(invoiceId);
    setInvoiceDetail(detail);
    setLoadingId(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader
            title="Historial de facturas"
            backRoute="/(tabs)/home"
          />

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Conoce el historial de facturación del lote {lotName} en el predio{" "}
              {propertyName}.
            </Text>
          </View>

          <View style={styles.headerCard}>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Predio #{propertyId}</Text>
              <Text style={styles.value}>{propertyName}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Lote #{lotId}</Text>
              <Text style={styles.value}>{lotName}</Text>
            </View>
          </View>

          <View style={[styles.invoiceCardWrapper, { marginTop: 20 }]}>
            {invoicesForLot.length > 0 ? (
              invoicesForLot.map((inv, index) => (
                <InvoiceHistoryCard
                  key={inv.invoice_id}
                  invoiceNumber={inv.invoice_id.toString()}
                  dueDate={inv.dueDate}
                  amount={inv.amount}
                  isLast={index === invoicesForLot.length - 1}
                  onPress={() => handleCardPress(inv.invoice_id)}
                />
              ))
            ) : (
              <Text style={typography.regular.medium}>
                No hay facturas pagadas para este lote.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Modal con información detallada */}
        <InvoiceHistoryModal
          isVisible={!!invoiceDetail}
          onClose={() => setInvoiceDetail(null)}
          invoice={invoiceDetail}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.base,
    paddingBottom: 16,
  },
  textContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  headerCard: {
    margin: 20,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  value: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  invoiceCardWrapper: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    overflow: "hidden",
  },
});
