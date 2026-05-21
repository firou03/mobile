import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getRequestStatusConfig } from "../utils/requestStatus";

export default function StatusBadge({ status = "pending" }) {
  const current = getRequestStatusConfig(status);
  return (
    <View style={[styles.badge, { backgroundColor: current.bg }]}>
      <Text style={[styles.label, { color: current.text }]}>{current.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  label: {
    fontWeight: "700",
    fontSize: 12,
  },
});
