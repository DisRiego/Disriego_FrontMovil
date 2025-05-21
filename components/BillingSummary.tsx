import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BillingSummaryProps {
  paid: number;
  pending: number;
  expired: number;
}

const BillingSummary: React.FC<BillingSummaryProps> = ({
  paid,
  pending,
  expired,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Total facturado</Text>
      <View style={styles.row}>
        <SummaryItem labelLine1="Facturas" labelLine2="Pagadas" value={paid} />
        <Divider />
        <SummaryItem
          labelLine1="Facturas"
          labelLine2="Pendientes"
          value={pending}
        />
        <Divider />
        <SummaryItem
          labelLine1="Facturas"
          labelLine2="Vencidas"
          value={expired}
        />
      </View>
    </View>
  );
};

const SummaryItem = ({
  labelLine1,
  labelLine2,
  value,
}: {
  labelLine1: string;
  labelLine2: string;
  value: number;
}) => (
  <View style={styles.item}>
    <Text style={styles.value}>{value}</Text>
    <View>
      <Text style={styles.label}>{labelLine1}</Text>
      <Text style={styles.label}>{labelLine2}</Text>
    </View>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 12,
    textAlign: "left",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 18,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 6,
  },
  divider: {
    width: 1,
    height: "60%",
    backgroundColor: "#e0e0e0",
  },
});

export default BillingSummary;
