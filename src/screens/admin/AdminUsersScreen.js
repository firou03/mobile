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
import { deleteUser, getAllUsers } from "../../service/restApiAdmin";
import { extractUsersList, roleLabel } from "../../utils/adminHelpers";
import theme from "../../utils/theme";

function roleStyle(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return { bg: theme.colors.primaryLight, text: theme.colors.primary };
  if (r === "transporteur") return { bg: theme.colors.semanticDeliveryBg, text: theme.colors.semanticDelivery };
  return { bg: theme.colors.semanticTrackingBg, text: theme.colors.semanticTracking };
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

  const onDelete = (item) => {
    Alert.alert(
      "Supprimer l'utilisateur",
      `Supprimer ${item.name || item.email} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(item._id);
              setUsers((prev) => prev.filter((u) => u._id !== item._id));
              toast("Utilisateur supprime");
            } catch {
              toast("Suppression impossible");
            }
          },
        },
      ]
    );
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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={<EmptyState title="Aucun utilisateur" />}
        renderItem={({ item }) => {
          const rs = roleStyle(item.role);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{item.name || "—"}</Text>
                  <Text style={styles.email}>{item.email || "—"}</Text>
                  {item.tel ? <Text style={styles.tel}>{item.tel}</Text> : null}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: rs.bg }]}>
                  <Text style={[styles.roleText, { color: rs.text }]}>{roleLabel(item.role)}</Text>
                </View>
              </View>
              {String(item.role).toLowerCase() !== "admin" ? (
                <Text style={styles.deleteBtn} onPress={() => onDelete(item)}>
                  Supprimer
                </Text>
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
  roleBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.pill, alignSelf: "flex-start" },
  roleText: { fontSize: 11, fontWeight: "700" },
  deleteBtn: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.danger,
    textAlign: "right",
  },
});
