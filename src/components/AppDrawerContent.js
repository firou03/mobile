import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { AuthContext } from "../context/AuthContext";
import ChatAvatar from "./chat/ChatAvatar";
import theme from "../utils/theme";

const CLIENT_ITEMS = [
  { route: "Home", label: "Accueil", icon: "🏠" },
  { route: "Client", label: "Creer une demande", icon: "📦" },
  { route: "ClientRequests", label: "Mes demandes", icon: "📄" },
  { route: "Historique", label: "Historique", icon: "🕐" },
  { route: "Tracking", label: "Suivi colis", icon: "🗺️" },
  { route: "Chat", label: "Messagerie", icon: "💬" },
  { route: "Notifications", label: "Notifications", icon: "🔔" },
  { route: "Profile", label: "Mon profil", icon: "👤" },
];

const TRANSPORTEUR_ITEMS = [
  { route: "Home", label: "Accueil", icon: "🏠" },
  { route: "Requests", label: "Demandes disponibles", icon: "🚚" },
  { route: "MesRequests", label: "Mes trajets", icon: "✅" },
  { route: "Historique", label: "Historique", icon: "🕐" },
  { route: "Tracking", label: "Suivi colis", icon: "🗺️" },
  { route: "Chat", label: "Messagerie", icon: "💬" },
  { route: "Notifications", label: "Notifications", icon: "🔔" },
  { route: "Profile", label: "Mon profil", icon: "👤" },
];

export default function AppDrawerContent(props) {
  const { navigation, state } = props;
  const { user, signOut } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const role = String(user?.role || "").trim().toLowerCase();
  const isClient = role === "client";
  const menuItems = isClient ? CLIENT_ITEMS : TRANSPORTEUR_ITEMS;

  const activeRoute = state.routes[state.index]?.name;

  const navigateTo = async (routeName) => {
    await Haptics.selectionAsync();
    navigation.navigate(routeName);
    navigation.closeDrawer();
  };

  const handleLogout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    navigation.closeDrawer();
    await signOut();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={theme.gradients.auth} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Text style={styles.brand}>🚚 TransportTN</Text>
        <ChatAvatar user={user} size={52} style={styles.avatar} />
        <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>
        <Text style={styles.userRole}>{isClient ? "Client" : "Transporteur"}</Text>
        {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
      </LinearGradient>

      <View style={styles.menuSection}>
        <Text style={styles.sectionLabel}>Navigation</Text>
        {menuItems.map((item) => {
          const selected = activeRoute === item.route;
          return (
            <Pressable
              key={item.route}
              onPress={() => navigateTo(item.route)}
              style={[styles.menuItem, selected ? styles.menuItemActive : null]}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, selected ? styles.menuLabelActive : null]}>{item.label}</Text>
              {selected ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutIcon}>⎋</Text>
        <Text style={styles.logoutLabel}>Deconnexion</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    marginBottom: 8,
  },
  brand: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
    opacity: 0.95,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.overlayWhite24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: "800",
  },
  userName: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  userRole: {
    color: theme.colors.white,
    opacity: 0.9,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  userEmail: {
    color: theme.colors.white,
    opacity: 0.75,
    fontSize: 12,
    marginTop: 6,
  },
  menuSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: 12,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  menuLabelActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.dangerLight,
    backgroundColor: theme.colors.dangerLight,
  },
  logoutIcon: {
    fontSize: 18,
    width: 32,
    color: theme.colors.danger,
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.danger,
  },
});
