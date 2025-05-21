import React from "react";
import { View, Text, useWindowDimensions, StyleSheet } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
} from "victory-native";

type Props = {
  values: number[];
  labels: string[];
  activeIndex?: number;
  title?: string;
};

export default function BillingChartCompact({
  values,
  labels,
  activeIndex = values.length - 1,
  title,
}: Props) {
  const { width, height } = useWindowDimensions();
  const chartWidth = width - 32;
  const chartHeight = Math.max(200, height * 0.28);

  const data = labels.map((label, index) => ({
    x: label,
    y: values[index],
    isActive: index === activeIndex,
  }));

  return (
    <View style={[styles.card, { width: chartWidth, height: chartHeight }]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <VictoryChart
        width={chartWidth}
        height={chartHeight}
        domainPadding={{ x: 40 }}
        padding={{ top: 30, bottom: 85, left: 5, right: 5 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: "transparent" },
            ticks: { stroke: "transparent" },
            tickLabels: {
              fill: "#333",
              fontSize: 12,
              fontWeight: "500",
              padding: 6,
            },
          }}
        />
        <VictoryBar
          data={data}
          barWidth={40}
          cornerRadius={{ top: 6 }}
          labels={({ datum }) => `$${datum.y.toLocaleString("es-CO")}`}
          labelComponent={
            <VictoryLabel dy={-12} style={{ fontSize: 12, fill: "#222" }} />
          }
          style={{
            data: {
              fill: ({ datum }) => (datum.isActive ? "#2A6041" : "#A5D6BA"),
              stroke: "transparent",
            },
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
