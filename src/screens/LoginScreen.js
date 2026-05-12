import React, { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { loginUser } from "../service/restApiUser";
import { AuthContext } from "../context/AuthContext";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import theme from "../utils/theme";

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showToast = (message) => {
    if (Platform.OS === "android") ToastAndroid.show(message, ToastAndroid.SHORT);
    else console.log(message);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Remplissez tous les champs.");
      showToast("Veuillez remplir les champs");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const { token, user } = res.data;
      await signIn({ token, user });
      showToast(`Bienvenue ${user?.name || ""}`.trim());
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const status = error?.response?.status;
      const msg =
        backendMessage ||
        (status ? `Connexion echouee (HTTP ${status})` : "Connexion echouee: verifier backend/CORS");
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={theme.gradients.auth} style={styles.topGradient}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Connexion securisee</Text>
        </View>
        <Text style={styles.brandIcon}>🚚</Text>
        <Text style={styles.brandTitle}>Transport App</Text>
      </LinearGradient>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Connexion</Text>
        <Text style={styles.formSubtitle}>Connectez-vous a votre compte</Text>

        <AppInput
          icon="📧"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <AppInput
          icon="🔒"
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={error}
        />

        <AppButton title="Se connecter" onPress={handleLogin} loading={loading} />
        <Text style={styles.helper}>Utilisez un compte existant dans votre base de donnees.</Text>
        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          Pas de compte ? S'inscrire
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topGradient: {
    height: "42%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: theme.colors.overlayWhite22,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.overlayWhite35,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  brandIcon: {
    fontSize: 62,
  },
  brandTitle: {
    marginTop: 6,
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: "800",
  },
  formCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    marginTop: -theme.spacing.section,
    borderTopLeftRadius: theme.radius.xxxl,
    borderTopRightRadius: theme.radius.xxxl,
    padding: theme.spacing.xxl,
    ...theme.shadows.formCard,
  },
  formTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  formSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: 18,
  },
  link: {
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: 14,
    fontWeight: "600",
  },
  helper: {
    marginTop: 10,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});