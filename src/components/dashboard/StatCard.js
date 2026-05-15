import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../utils/theme";

export default function StatCard({ value, label, icon, color, bgColor }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconPill, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "center",
    gap: 6,
    ...theme.shadows.cardSoft,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 13,
  },
});
