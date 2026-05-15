import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";
import theme from "../utils/theme";

const { motion } = theme;

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, theme.spacing.md) + theme.spacing.sm;

  return (
    <LinearGradient
      colors={theme.gradients.auth}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingBottom: bottomPad }]}
    >
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <Animated.View entering={FadeInDown.duration(motion.enterDuration).springify()} style={styles.hero}>
        <Animated.View
          entering={FadeInRight.delay(motion.stagger).duration(420).springify()}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>TransportTN Mobile</Text>
        </Animated.View>
        <Text style={styles.icon}>🚚</Text>
        <Text style={styles.title}>Livraison intelligente</Text>
        <Text style={styles.subtitle}>Une experience simple pour clients et transporteurs.</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(motion.stagger * 2).duration(motion.enterDuration).springify()}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Commencer</Text>
        <Text style={styles.cardSubtitle}>Connectez-vous ou creez votre compte pour continuer.</Text>
        <View style={styles.actions}>
          <AppButton title="Se connecter" onPress={() => navigation.navigate("Login")} />
          <AppButton title="Creer un compte" onPress={() => navigation.navigate("Register")} variant="outline" />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  glowBottom: {
    position: "absolute",
    bottom: 120,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(34, 211, 238, 0.15)",
  },
  hero: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: theme.spacing.md,
  },
  badge: {
    backgroundColor: theme.colors.overlayWhite20,
    borderColor: theme.colors.overlayWhite35,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.95,
    maxWidth: 320,
    lineHeight: 21,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.lg,
    ...theme.shadows.welcomeCard,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
});
