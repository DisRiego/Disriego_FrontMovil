import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface HistoryItem {
  date: string;
  recorded: string;
}

interface Props {
  data: HistoryItem[];
}

const ConsumptionHistoryCardList: React.FC<Props> = ({ data }) => {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Fecha de consumo</Text>
              <Text style={styles.value}>{item.date}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Consumo registrado</Text>
              <Text style={styles.valueBold}>{item.recorded} m³</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  column: {
    flex: 1,
    alignItems: "flex-start",
  },
  label: {
    ...typography.regular.medium,
    color: colors.gray,
    marginBottom: 4,
  },
  value: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  valueBold: {
    ...typography.medium.medium,
    color: colors.darkGray,
  },
});

export default ConsumptionHistoryCardList;
