import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppButton from "../components/AppButton";
import theme from "../utils/theme";

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={theme.gradients.auth} style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TransportTN Mobile</Text>
        </View>
        <Text style={styles.icon}>🚚</Text>
        <Text style={styles.title}>Livraison intelligente</Text>
        <Text style={styles.subtitle}>Une experience simple pour clients et transporteurs.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Commencer</Text>
        <Text style={styles.cardSubtitle}>Connectez-vous ou creez votre compte pour continuer.</Text>
        <View style={styles.actions}>
        <AppButton title="Se connecter" onPress={() => navigation.navigate("Login")} />
        <AppButton title="Creer un compte" onPress={() => navigation.navigate("Register")} variant="outline" />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.section,
  },
  hero: {
    marginTop: 72,
    alignItems: "center",
    gap: 12,
  },
  badge: {
    backgroundColor: theme.colors.overlayWhite20,
    borderColor: theme.colors.overlayWhite35,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: "600",
    fontSize: 12,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.95,
    maxWidth: 320,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.lg,
    ...theme.shadows.welcomeCard,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  actions: {
    gap: 12,
  },
});
