import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import AppHeader from "../../components/AppHeader";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import { banUser, getAllUsers, unbanUser } from "../../service/restApiAdmin";
import { extractUsersList, roleLabel } from "../../utils/adminHelpers";
import theme from "../../utils/theme";

function roleStyle(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return { bg: theme.colors.primaryLight, text: theme.colors.primary };
  if (r === "transporteur") return { bg: theme.colors.semanticDeliveryBg, text: theme.colors.semanticDelivery };
  return { bg: theme.colors.semanticTrackingBg, text: theme.colors.semanticTracking };
}

function isUserBanned(user) {
  if (!user?.isBanned) return false;
  if (user.bannedUntil && new Date(user.bannedUntil) < new Date()) return false;
  return true;
}

function formatBanUntil(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const toast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else console.log(msg);
  };

  const load = useCallback(async () => {
    try {
      const res = await getAllUsers();
      setUsers(extractUsersList(res));
    } catch {
      setUsers([]);
      toast("Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateUserInList = (userId, patch) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, ...patch } : u))
    );
  };

  const onBan = (item) => {
    if (String(item.role).toLowerCase() === "admin") {
      toast("Impossible de bannir un admin");
      return;
    }
    Alert.alert(
      "Bannir 1 mois",
      `Suspendre ${item.name || item.email} pendant 30 jours ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Bannir",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await banUser(item._id);
              updateUserInList(item._id, res.data?.data || { isBanned: true });
              toast("Utilisateur banni 1 mois");
              load();
            } catch (err) {
              toast(err?.response?.data?.message || "Bannissement impossible");
            }
          },
        },
      ]
    );
  };

  const onUnban = (item) => {
    Alert.alert("Lever le ban", `Réactiver ${item.name || item.email} ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Débannir",
        onPress: async () => {
          try {
            const res = await unbanUser(item._id);
            updateUserInList(item._id, res.data?.data || { isBanned: false });
            toast("Suspension levée");
            load();
          } catch {
            toast("Action impossible");
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader title="Utilisateurs" subtitle={`${users.length} compte(s)`} />
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={<EmptyState title="Aucun utilisateur" />}
        renderItem={({ item }) => {
          const rs = roleStyle(item.role);
          const banned = isUserBanned(item);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{item.name || "—"}</Text>
                  <Text style={styles.email}>{item.email || "—"}</Text>
                  {item.phone || item.tel ? (
                    <Text style={styles.tel}>{item.phone || item.tel}</Text>
                  ) : null}
                  {banned ? (
                    <Text style={styles.bannedLabel}>
                      Banni jusqu&apos;au {formatBanUntil(item.bannedUntil)}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: rs.bg }]}>
                  <Text style={[styles.roleText, { color: rs.text }]}>
                    {roleLabel(item.role)}
                  </Text>
                </View>
              </View>
              {String(item.role).toLowerCase() !== "admin" ? (
                banned ? (
                  <Text style={styles.unbanBtn} onPress={() => onUnban(item)}>
                    Lever le ban
                  </Text>
                ) : (
                  <Text style={styles.banBtn} onPress={() => onBan(item)}>
                    Bannir 1 mois
                  </Text>
                )
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { paddingHorizontal: 14, paddingBottom: 24 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 10,
    ...theme.shadows.cardSoft,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800", color: theme.colors.textPrimary },
  email: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  tel: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  bannedLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.danger,
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    alignSelf: "flex-start",
  },
  roleText: { fontSize: 11, fontWeight: "700" },
  banBtn: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.danger,
    textAlign: "right",
  },
  unbanBtn: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "right",
  },
});
