import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MonthlyDetailCardProps {
  average: number;
  projected: number;
  variation: number;
}

const MonthlyDetailCard: React.FC<MonthlyDetailCardProps> = ({
  average,
  projected,
  variation,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Detalle Mensual</Text>
      <View style={styles.row}>
        <DetailItem
          labelLine1="Consumo"
          labelLine2="Promedio"
          value={`${average} m³`}
        />
        <Divider />
        <DetailItem
          labelLine1="Consumo"
          labelLine2="Proyectado"
          value={`${projected} m³`}
        />
        <Divider />
        <DetailItem
          labelLine1="Variación"
          labelLine2="Esperada"
          value={`${variation > 0 ? "+" : ""}${variation}%`}
          highlight
        />
      </View>
    </View>
  );
};

const DetailItem = ({
  labelLine1,
  labelLine2,
  value,
  highlight = false,
}: {
  labelLine1: string;
  labelLine2: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.item}>
    <Text style={[styles.value, highlight && styles.highlightValue]}>
      {value}
    </Text>
    <Text style={styles.label}>{labelLine1}</Text>
    <Text style={styles.label}>{labelLine2}</Text>
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
    color: "#000",
    marginBottom: 4,
  },
  highlightValue: {
    color: "#2E7D32", // verde
  },
  divider: {
    width: 1,
    height: "60%",
    backgroundColor: "#e0e0e0",
  },
});

export default MonthlyDetailCard;
