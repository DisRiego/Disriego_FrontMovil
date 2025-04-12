import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotification } from "@/context/NotificationContext";
import { colors } from "@/config/theme";

const NotificationIcon = ({ color }: { color: string }) => {
  const { unreadCount } = useNotification();

  return (
    <View style={{ position: "relative" }}>
      <Ionicons name="notifications-outline" size={22} color={color} />
      {unreadCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -6,
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingHorizontal: 5,
            paddingVertical: 1,
            minWidth: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
            {unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotificationIcon;
