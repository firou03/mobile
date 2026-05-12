import React, { useContext, useEffect, useMemo, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppButton from "../components/AppButton";
import NotificationBell from "../components/NotificationBell";
import { AuthContext } from "../context/AuthContext";
import { getClientRequests, getMesRequests, getPendingRequests } from "../service/restApiTransport";
import theme from "../utils/theme";

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const role = String(user?.role || "").trim().toLowerCase();
  const isClient = role === "client";
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (message) => {
    if (Platform.OS === "android") ToastAndroid.show(message, ToastAndroid.SHORT);
    else console.log(message);
  };

  const loadDashboardData = async () => {
    try {
      if (isClient) {
        const res = await getClientRequests();
        const requests = Array.isArray(res?.data) ? res.data : [];
        setStats({
          a: requests.length,
          b: requests.filter((item) => item?.status === "accepted").length,
          c: requests.filter((item) => !item?.status || item?.status === "pending").length,
        });
        return;
      }
      const [pendingRes, mesRes] = await Promise.all([getPendingRequests(), getMesRequests()]);
      const pending = Array.isArray(pendingRes?.data) ? pendingRes.data : [];
      const mes = Array.isArray(mesRes?.data) ? mesRes.data : [];
      setStats({
        a: pending.length,
        b: mes.length,
        c: mes.filter((item) => item?.status === "delivered").length,
      });
    } catch {
      showToast("Impossible de charger le tableau de bord");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isClient]);

  const firstAction = useMemo(
    () =>
      isClient
        ? { title: "Creer une demande", route: "Client" }
        : { title: "Mes trajets", route: "MesRequests" },
    [isClient]
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.auth} style={styles.hero}>
        <View style={styles.topRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Bienvenue {user?.name || ""}</Text>
            <Text style={styles.subtitle}>
              {isClient
                ? "Creez une demande ou suivez vos actions rapidement."
                : "Consultez vos trajets et les demandes disponibles."}
            </Text>
          </View>
          <View style={styles.topRowButtons}>
            <NotificationBell onNotificationPress={() => navigation.navigate("Notifications")} />
            <AppButton title="Logout" variant="danger" onPress={signOut} style={styles.logoutBtn} />
          </View>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name?.[0] || "U").toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.identityName}>{user?.name || "Utilisateur"}</Text>
            <Text style={styles.identityRole}>{isClient ? "Client" : "Transporteur"}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboardData();
            }}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{stats.a}</Text>
            <Text style={styles.kpiLabel}>{isClient ? "Demandes totales" : "Demandes disponibles"}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{stats.b}</Text>
            <Text style={styles.kpiLabel}>{isClient ? "Acceptees" : "Mes trajets"}</Text>
          </View>
        </View>

        <View style={styles.kpiCardLarge}>
          <Text style={styles.kpiValueDark}>{stats.c}</Text>
          <Text style={styles.kpiLabelDark}>{isClient ? "En attente" : "Livrees"}</Text>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions rapides</Text>
          <AppButton title={firstAction.title} onPress={() => navigation.navigate(firstAction.route)} />
          {isClient && (
            <AppButton
              title="Mes demandes"
              variant="outline"
              onPress={() => navigation.navigate("ClientRequests")}
            />
          )}
          {!isClient && (
            <AppButton
              title="Demandes disponibles"
              variant="outline"
              onPress={() => navigation.navigate("Requests")}
            />
          )}
          <AppButton title="Suivi colis" variant="secondary" onPress={() => navigation.navigate("Tracking")} />
          <AppButton title="Messagerie" variant="outline" onPress={() => navigation.navigate("Chat")} />
          <AppButton title="Mon profil" variant="secondary" onPress={() => navigation.navigate("Profile")} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  topRowButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  header: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.95,
  },
  logoutBtn: {
    height: 42,
    minWidth: 96,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.overlayWhite24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: 18,
  },
  identityName: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  identityRole: {
    color: theme.colors.white,
    opacity: 0.9,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.cardSoft,
  },
  kpiCardLarge: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  kpiValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  kpiLabel: {
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: "600",
  },
  kpiValueDark: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "800",
  },
  kpiLabelDark: {
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: "600",
  },
  actionsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 10,
  },
  actionsTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    marginBottom: 2,
  },
});
