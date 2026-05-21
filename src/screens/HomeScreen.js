import React, { useContext, useEffect, useMemo, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionTile from "../components/dashboard/ActionTile";
import DashboardAvatar from "../components/dashboard/DashboardAvatar";
import StatCard from "../components/dashboard/StatCard";
import NotificationBell from "../components/NotificationBell";
import { AuthContext } from "../context/AuthContext";
import { getClientRequests, getMesRequests, getPendingRequests } from "../service/restApiTransport";
import {
  countClientAccepted,
  countDelivered,
  countPending,
  extractTransportRequestsList,
} from "../utils/requestStatus";
import theme from "../utils/theme";

const { colors, typography } = theme;

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
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
        const requests = extractTransportRequestsList(res);
        setStats({
          a: requests.length,
          b: countClientAccepted(requests),
          c: countPending(requests),
        });
        return;
      }
      const [pendingRes, mesRes] = await Promise.all([getPendingRequests(), getMesRequests()]);
      const pending = extractTransportRequestsList(pendingRes);
      const mes = extractTransportRequestsList(mesRes);
      setStats({
        a: pending.length,
        b: mes.length,
        c: countDelivered(mes),
      });
    } catch {
      showToast("Impossible de charger le tableau de bord");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = navigation?.addListener?.("focus", loadDashboardData);
    return unsubscribe;
  }, [isClient, navigation]);

  const statItems = useMemo(
    () =>
      isClient
        ? [
            {
              value: stats.a,
              label: "Total",
              icon: "document-text-outline",
              color: colors.semanticRequest,
              bgColor: colors.semanticRequestBg,
            },
            {
              value: stats.b,
              label: "Acceptees",
              icon: "checkmark-circle-outline",
              color: colors.semanticDelivery,
              bgColor: colors.semanticDeliveryBg,
            },
            {
              value: stats.c,
              label: "En attente",
              icon: "time-outline",
              color: colors.semanticRequest,
              bgColor: colors.semanticRequestBg,
            },
          ]
        : [
            {
              value: stats.a,
              label: "Disponibles",
              icon: "cube-outline",
              color: colors.semanticRequest,
              bgColor: colors.semanticRequestBg,
            },
            {
              value: stats.b,
              label: "Mes trajets",
              icon: "car-outline",
              color: colors.semanticRequest,
              bgColor: colors.semanticRequestBg,
            },
            {
              value: stats.c,
              label: "Livrees",
              icon: "checkmark-done-outline",
              color: colors.semanticDelivery,
              bgColor: colors.semanticDeliveryBg,
            },
          ],
    [isClient, stats]
  );

  const actionItems = useMemo(() => {
    const pendingLabel = (n) => `${n} ${n === 1 ? "nouvelle demande" : "nouvelles demandes"}`;
    const totalLabel = (n) => `${n} demande${n !== 1 ? "s" : ""} au total`;

    if (isClient) {
      return [
        {
          title: "Creer une demande",
          subtitle: stats.c > 0 ? `${stats.c} en attente de traitement` : "Nouvelle livraison",
          icon: "add-circle-outline",
          color: colors.semanticRequest,
          bgColor: colors.semanticRequestBg,
          route: "Client",
        },
        {
          title: "Mes demandes",
          subtitle: totalLabel(stats.a),
          icon: "list-outline",
          color: colors.semanticRequest,
          bgColor: colors.semanticRequestBg,
          route: "ClientRequests",
        },
        {
          title: "Suivi colis",
          subtitle: "Suivre un envoi en temps reel",
          icon: "locate-outline",
          color: colors.semanticTracking,
          bgColor: colors.semanticTrackingBg,
          route: "Tracking",
        },
        {
          title: "Messagerie",
          subtitle: "Discuter avec les transporteurs",
          icon: "chatbubbles-outline",
          color: colors.semanticNeutral,
          bgColor: colors.semanticNeutralBg,
          route: "Chat",
        },
        {
          title: "Mon profil",
          subtitle: "Compte et parametres",
          icon: "person-outline",
          color: colors.semanticNeutral,
          bgColor: colors.semanticNeutralBg,
          route: "Profile",
        },
      ];
    }

    return [
      {
        title: "Mes trajets",
        subtitle: stats.b > 0 ? `${stats.b} trajet${stats.b !== 1 ? "s" : ""} actif${stats.b !== 1 ? "s" : ""}` : "Aucun trajet en cours",
        icon: "car-outline",
        color: colors.semanticRequest,
        bgColor: colors.semanticRequestBg,
        route: "MesRequests",
      },
      {
        title: "Demandes disponibles",
        subtitle: stats.a > 0 ? pendingLabel(stats.a) : "Aucune demande pour le moment",
        icon: "cube-outline",
        color: colors.semanticRequest,
        bgColor: colors.semanticRequestBg,
        route: "Requests",
      },
      {
        title: "Suivi colis",
        subtitle: "Localiser un colis",
        icon: "locate-outline",
        color: colors.semanticTracking,
        bgColor: colors.semanticTrackingBg,
        route: "Tracking",
      },
      {
        title: "Messagerie",
        subtitle: "Contacter vos clients",
        icon: "chatbubbles-outline",
        color: colors.semanticNeutral,
        bgColor: colors.semanticNeutralBg,
        route: "Chat",
      },
      {
        title: "Mon profil",
        subtitle: "Compte et parametres",
        icon: "person-outline",
        color: colors.semanticNeutral,
        bgColor: colors.semanticNeutralBg,
        route: "Profile",
      },
    ];
  }, [isClient, stats]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: 16 + insets.top }]}
      >
        <View style={styles.decorCircleLarge} pointerEvents="none" />
        <View style={styles.decorCircleSmall} pointerEvents="none" />

        <Animated.View entering={FadeInDown.duration(theme.motion.enterDuration).springify()} style={styles.heroInner}>
          <View style={styles.topRow}>
            <View style={styles.header}>
              <Text style={styles.heroGreeting}>Bienvenue</Text>
              <Text style={styles.heroName}>{user?.name || "Utilisateur"}</Text>
              <Text style={styles.heroSubtitle}>
                {isClient
                  ? "Creez une demande ou suivez vos livraisons."
                  : "Consultez vos trajets et les demandes disponibles."}
              </Text>
            </View>
            <NotificationBell onNotificationPress={() => navigation.navigate("Notifications")} />
          </View>

          <View style={styles.identityRow}>
            <DashboardAvatar user={user} size={44} />
            <View style={styles.identityText}>
              <Text style={styles.identityName}>{user?.name || "Utilisateur"}</Text>
              <Text style={styles.identityRole}>{isClient ? "Client" : "Transporteur"}</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboardData();
            }}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View
          entering={FadeInUp.delay(theme.motion.stagger).duration(theme.motion.enterDuration).springify()}
        >
          <Text style={styles.sectionLabel}>Apercu</Text>
          <View style={styles.statsRow}>
            {statItems.map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(theme.motion.stagger * 2).duration(theme.motion.enterDuration).springify()}
          style={styles.actionsCard}
        >
          <Text style={styles.sectionLabel}>Actions rapides</Text>
          <View style={styles.actionsList}>
            {actionItems.map((item, index) => (
              <ActionTile
                key={item.route}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                color={item.color}
                bgColor={item.bgColor}
                onPress={() => navigation.navigate(item.route)}
                isLast={index === actionItems.length - 1}
              />
            ))}
          </View>
        </Animated.View>
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
    paddingBottom: 20,
    overflow: "hidden",
  },
  decorCircleLarge: {
    position: "absolute",
    right: -48,
    top: -32,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.overlayWhite20,
  },
  decorCircleSmall: {
    position: "absolute",
    left: -24,
    bottom: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.overlayWhite22,
  },
  heroInner: {
    gap: 14,
    zIndex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  header: {
    flex: 1,
    gap: 4,
  },
  heroGreeting: {
    fontSize: 13,
    color: theme.colors.white,
    opacity: 0.85,
    fontWeight: "500",
  },
  heroName: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.white,
  },
  heroSubtitle: {
    fontSize: 13,
    color: theme.colors.white,
    opacity: 0.88,
    marginTop: 2,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identityText: {
    gap: 2,
  },
  identityName: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  identityRole: {
    color: theme.colors.white,
    opacity: 0.88,
    fontSize: 12,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    ...theme.shadows.card,
  },
  actionsList: {
    marginTop: 2,
  },
});
