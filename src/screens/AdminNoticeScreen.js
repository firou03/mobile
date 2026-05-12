import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import { AuthContext } from "../context/AuthContext";
import theme from "../utils/theme";

/** Même rôle que /admin sur le web : l’administration complète se fait sur pfe-front-react. */
export default function AdminNoticeScreen() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>🛡️</Text>
      <Text style={styles.title}>Administration web</Text>
      <Text style={styles.text}>
        Comme sur le tableau de bord React, les outils administrateur sont prévus pour le navigateur
        à l&apos;adresse&nbsp;
        <Text style={styles.bold}>/admin</Text>
        après connexion (compte demo admin identique au site).
      </Text>
      <Text style={styles.hint}>Déconnectez-vous puis ouvrez le site sur ordinateur pour gérer les utilisateurs et les stats.</Text>
      <AppButton title="Se déconnecter" variant="danger" onPress={signOut} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  emoji: { fontSize: 48 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  text: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  bold: { fontWeight: "700", color: theme.colors.textPrimary },
  hint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  btn: { alignSelf: "stretch", marginTop: 8 },
});
