import React, { useContext, useEffect, useMemo, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionTile from "../../components/dashboard/ActionTile";
import DashboardAvatar from "../../components/dashboard/DashboardAvatar";
import StatCard from "../../components/dashboard/StatCard";
import NotificationBell from "../../components/NotificationBell";
import StatusBadge from "../../components/StatusBadge";
import { AuthContext } from "../../context/AuthContext";
import { getAdminDashboardStats } from "../../service/restApiAdmin";
import { extractDashboardStats } from "../../utils/adminHelpers";
import theme from "../../utils/theme";

const { colors } = theme;

export default function AdminHomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else console.log(msg);
  };

  const load = async () => {
    try {
      const res = await getAdminDashboardStats();
      setStats(extractDashboardStats(res));
    } catch {
      showToast("Impossible de charger les statistiques");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = navigation?.addListener?.("focus", load);
    return unsub;
  }, [navigation]);

  const statItems = useMemo(
    () => [
      {
        value: stats?.totalRequests ?? 0,
        label: "Total",
        icon: "cube-outline",
        color: colors.semanticRequest,
        bgColor: colors.semanticRequestBg,
      },
      {
        value: stats?.pendingRequests ?? 0,
        label: "En attente",
        icon: "time-outline",
        color: colors.warning,
        bgColor: colors.warningLight,
      },
      {
        value: stats?.deliveredRequests ?? 0,
        label: "Livrees",
        icon: "checkmark-done-outline",
        color: colors.semanticDelivery,
        bgColor: colors.semanticDeliveryBg,
      },
    ],
    [stats]
  );

  const revenue = typeof stats?.totalRevenue === "number" ? stats.totalRevenue.toFixed(2) : "0.00";
  const recent = Array.isArray(stats?.recentRequests) ? stats.recentRequests.slice(0, 5) : [];

  const actions = [
    {
      title: "Utilisateurs",
      subtitle: "Gerer les comptes",
      icon: "people-outline",
      color: colors.semanticRequest,
      bgColor: colors.semanticRequestBg,
      route: "AdminUsers",
    },
    {
      title: "Expeditions",
      subtitle: "Toutes les demandes",
      icon: "document-text-outline",
      color: colors.semanticTracking,
      bgColor: colors.semanticTrackingBg,
      route: "AdminRequests",
    },
    {
      title: "Avis clients",
      subtitle: "Moderation des avis",
      icon: "star-outline",
      color: colors.warning,
      bgColor: colors.warningLight,
      route: "AdminReviews",
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#5b21b6", "#4c1d95", "#166534"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: 12 + insets.top }]}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={styles.heroGreeting}>Administration</Text>
            <Text style={styles.heroName}>{user?.name || "Admin"}</Text>
            <Text style={styles.heroSub}>Vue d'ensemble de la plateforme</Text>
          </View>
          <NotificationBell onNotificationPress={() => navigation.navigate("Notifications")} />
        </View>
        <View style={styles.identityRow}>
          <DashboardAvatar user={user} size={44} />
          <View>
            <Text style={styles.identityName}>{user?.email || "admin"}</Text>
            <Text style={styles.identityRole}>Administrateur</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />
        }
      >
        <Text style={styles.sectionLabel}>Indicateurs</Text>
        <View style={styles.statsRow}>{statItems.map((s) => <StatCard key={s.label} {...s} />)}</View>

        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Revenu plateforme</Text>
          <Text style={styles.revenueValue}>{revenue} DT</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Actions rapides</Text>
          {actions.map((a, i) => (
            <ActionTile
              key={a.route}
              {...a}
              onPress={() => navigation.navigate(a.route)}
              isLast={i === actions.length - 1}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Demandes recentes</Text>
          {recent.length === 0 ? (
            <Text style={styles.empty}>Aucune demande</Text>
          ) : (
            recent.map((r) => (
              <View key={r._id} style={styles.recentRow}>
                <View style={styles.recentBody}>
                  <Text style={styles.recentRoute} numberOfLines={1}>
                    {r.pickupLocation || "—"} → {r.deliveryLocation || "—"}
                  </Text>
                  <Text style={styles.recentMeta}>
                    {r.client?.name || "Client"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : ""}
                  </Text>
                </View>
                <StatusBadge status={r.status} />
              </View>
            ))
          )}
          <Text style={styles.seeAll} onPress={() => navigation.navigate("AdminRequests")}>
            Voir toutes les demandes →
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  hero: { paddingHorizontal: 16, paddingBottom: 18 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroText: { flex: 1, paddingRight: 8 },
  heroGreeting: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  heroName: { color: theme.colors.white, fontSize: 22, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  identityName: { color: theme.colors.white, fontSize: 14, fontWeight: "700" },
  identityRole: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: {
    ...theme.typography.sectionLabel,
    marginBottom: 10,
    color: theme.colors.textSecondary,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  revenueCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 14,
    ...theme.shadows.cardSoft,
  },
  revenueLabel: { fontSize: 12, fontWeight: "600", color: theme.colors.textMuted, textTransform: "uppercase" },
  revenueValue: { fontSize: 26, fontWeight: "800", color: theme.colors.primary, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 14,
    ...theme.shadows.cardSoft,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  recentBody: { flex: 1 },
  recentRoute: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
  recentMeta: { fontSize: 11, color: theme.colors.textMuted, marginTop: 3 },
  empty: { fontSize: 13, color: theme.colors.textMuted, paddingVertical: 12 },
  seeAll: { fontSize: 13, fontWeight: "700", color: theme.colors.primary, marginTop: 12, textAlign: "center" },
});
