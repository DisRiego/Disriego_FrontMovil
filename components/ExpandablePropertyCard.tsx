import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface Lot {
  id: string;
  name: string;
}

interface ExpandablePropertyCardProps {
  name: string;
  id: string;
  lots: Lot[];
  onLotPress: (lotId: string) => void;
}

export default function ExpandablePropertyCard({
  name,
  id,
  lots,
  onLotPress,
}: ExpandablePropertyCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View>
          <Text style={styles.propertyName}>{name}</Text>
          <Text style={styles.propertyId}>#{id}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.gray}
        />
      </TouchableOpacity>

      {expanded &&
        lots.map((lot) => (
          <TouchableOpacity
            key={lot.id}
            style={styles.lotItem}
            onPress={() => onLotPress(lot.id)}
          >
            <View>
              <Text style={styles.lotName}>{lot.name}</Text>

              <Text style={styles.lotId}>#{lot.id}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.gray} />
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyName: {
    ...typography.medium.medium,
    color: colors.darkGray,
  },
  propertyId: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  lotItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lotName: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  lotId: {
    ...typography.regular.medium,
    color: colors.gray,
  },
});
