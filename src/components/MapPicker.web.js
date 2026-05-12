import React from "react";
import { StyleSheet, Text, View } from "react-native";
import theme from "../utils/theme";

export default function MapPicker() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>🗺️ Carte indisponible sur Web</Text>
      <Text style={styles.subtitle}>Utilisez Android/iOS pour la carte interactive.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    height: 220,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
