import React from "react";
import { StyleSheet, Text, View } from "react-native";
import theme from "../utils/theme";

const map = {
  pending: { bg: theme.colors.warningLight, text: theme.colors.warning, label: "Pending" },
  accepted: { bg: theme.colors.secondaryLight, text: theme.colors.secondary, label: "Acceptee ✅" },
  delivered: { bg: theme.colors.primaryLight, text: theme.colors.primary, label: "Livree" },
};

export default function StatusBadge({ status = "pending" }) {
  const current = map[status] || map.pending;
  return (
    <View style={[styles.badge, { backgroundColor: current.bg }]}>
      <Text style={[styles.label, { color: current.text }]}>{current.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  label: {
    fontWeight: "700",
    fontSize: 12,
  },
});
