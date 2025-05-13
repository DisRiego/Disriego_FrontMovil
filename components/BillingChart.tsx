import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";

// Ancho de la pantalla para dimensionar la gráfica
const screenWidth = Dimensions.get("window").width - 32; // 16px de padding a cada lado

// Datos de ejemplo (ajusta los valores según tu API o estado)
const data = {
  labels: ["Oct", "Nov", "Dic", "Ene"],
  datasets: [
    {
      data: [50, 100, 80, 120], // valores de facturación
    },
  ],
};

// Configuración de la gráfica con un azul sólido
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  barRadius: 6,
  color: () => "#0069FF", // Azul sólido sin opacidad
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.6})`,
  style: {
    borderRadius: 12,
  },
  propsForBackgroundLines: {
    strokeWidth: 0, // elimina líneas horizontales
  },
};

type Props = {
  title?: string;
  values: number[];
  labels: string[];
};

export default function BillingChart({
  title = "Facturación",
  values = data.datasets[0].data,
  labels = data.labels,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <BarChart
        data={{ labels, datasets: [{ data: values }] }}
        width={screenWidth}
        height={220}
        fromZero
        showBarTops={false}
        chartConfig={chartConfig}
        style={styles.chart}
        withInnerLines={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16, // alinea el eje Y con el título
  },
});
