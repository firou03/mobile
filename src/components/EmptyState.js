import React from "react";
import { StyleSheet, Text, View } from "react-native";
import theme from "../utils/theme";

export default function EmptyState({ title = "Aucune donnee", subtitle = "Revenez plus tard." }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📭</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 48,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 20,
    alignItems: "center",
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
});
