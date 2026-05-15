import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { registerUser } from "../service/restApiUser";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import theme from "../utils/theme";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [permisUri, setPermisUri] = useState(null);

  const showToast = (message) => {
    if (Platform.OS === "android") ToastAndroid.show(message, ToastAndroid.SHORT);
    else console.log(message);
  };

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Nom obligatoire";
    if (!email.includes("@")) nextErrors.email = "Email invalide";
    if (password.length < 6) nextErrors.password = "Au moins 6 caracteres";
    if (role === "transporteur" && !permisUri) nextErrors.permis = "Permis requis (comme sur le web)";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const pickPermis = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      showToast("Autorisation galerie requise");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPermisUri(result.assets[0].uri);
      setErrors((e) => ({ ...e, permis: undefined }));
    }
  };

  const handleRegister = async () => {
    if (!validate()) {
      showToast("Verifier vos informations");
      return;
    }
    setLoading(true);
    try {
      if (role === "transporteur" && permisUri) {
        const fd = new FormData();
        fd.append("name", name.trim());
        fd.append("email", email.trim());
        fd.append("password", password);
        fd.append("role", role);
        fd.append("permis", {
          uri: permisUri,
          name: "permis.jpg",
          type: "image/jpeg",
        });
        await registerUser(fd);
      } else {
        await registerUser({ name: name.trim(), email: email.trim(), password, role });
      }
      showToast("Compte cree avec succes");
      navigation.goBack();
    } catch (error) {
      showToast(error?.response?.data?.message || "Echec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient
        colors={theme.gradients.auth}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topGradient}
      >
        <Animated.View entering={FadeInDown.duration(theme.motion.enterDuration).springify()} style={styles.topInner}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Inscription</Text>
          </View>
          <Text style={styles.brandIcon}>📝</Text>
          <Text style={styles.brandTitle}>Creation de compte</Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View entering={FadeInUp.delay(80).duration(theme.motion.enterDuration).springify()} style={styles.formCard}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formScroll}
          nestedScrollEnabled
        >
          <AppInput label="Nom" placeholder="Votre nom" value={name} onChangeText={setName} error={errors.name} />
          <AppInput
            label="Email"
            icon="📧"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />
          <AppInput
            label="Mot de passe"
            icon="🔒"
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Text style={styles.roleLabel}>Choisir un role</Text>
          <Text style={styles.roleHint}>Le role determine vos pages apres connexion.</Text>
          <View style={styles.rolesRow}>
            {["client", "transporteur"].map((item) => {
              const selected = role === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setRole(item);
                    if (item === "client") setPermisUri(null);
                  }}
                  style={[styles.roleCard, selected ? styles.roleSelected : null]}
                >
                  <Text style={[styles.roleText, selected ? styles.roleTextSelected : null]}>
                    {item === "client" ? "Client" : "Transporteur"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {role === "transporteur" ? (
            <>
              <Text style={styles.permisHint}>Ajoutez une photo du permis (obligatoire, comme sur le site web).</Text>
              <AppButton
                title={permisUri ? "✓ Photo permis choisie" : "Choisir une photo du permis"}
                variant="outline"
                onPress={pickPermis}
              />
              {errors.permis ? <Text style={styles.permisErr}>{errors.permis}</Text> : null}
            </>
          ) : null}

          <AppButton title="S'inscrire" onPress={handleRegister} loading={loading} style={styles.button} />
          <Text style={styles.link} onPress={() => navigation.goBack()}>
            Deja un compte ? Se connecter
          </Text>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topGradient: {
    flex: 2,
    minHeight: 140,
    maxHeight: 280,
    justifyContent: "center",
  },
  topInner: {
    alignItems: "center",
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
    fontSize: 52,
  },
  brandTitle: {
    color: theme.colors.white,
    marginTop: 8,
    fontSize: 24,
    fontWeight: "800",
  },
  formCard: {
    flex: 3,
    minHeight: 0,
    backgroundColor: theme.colors.white,
    marginTop: -theme.spacing.xxxl,
    borderTopLeftRadius: theme.radius.xxxl,
    borderTopRightRadius: theme.radius.xxxl,
    ...theme.shadows.formCard,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  formScroll: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.section,
  },
  roleLabel: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleHint: {
    color: theme.colors.textSecondary,
    marginBottom: 10,
    fontSize: 12,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: theme.colors.white,
  },
  roleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  roleText: {
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  roleTextSelected: {
    color: theme.colors.primary,
  },
  button: {
    marginTop: 8,
  },
  link: {
    marginTop: 14,
    color: theme.colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
  permisHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  permisErr: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
});
