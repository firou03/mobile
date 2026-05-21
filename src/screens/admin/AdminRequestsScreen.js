import React, { useCallback, useEffect, useState } from "react";
import {
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
import StatusBadge from "../../components/StatusBadge";
import { getAllTransportRequests } from "../../service/restApiTransport";
import { extractTransportRequestsList } from "../../utils/requestStatus";
import theme from "../../utils/theme";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "accepted_by_transporter", label: "A confirmer" },
  { key: "confirmed", label: "Confirmees" },
  { key: "delivered", label: "Livrees" },
  { key: "cancelled", label: "Annulees" },
];

export default function AdminRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const toast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else console.log(msg);
  };

  const load = useCallback(async () => {
    try {
      const res = await getAllTransportRequests();
      setRequests(extractTransportRequestsList(res));
    } catch {
      setRequests([]);
      toast("Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => String(r.status || "").toLowerCase() === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Expeditions"
        subtitle={`${filtered.length} demande(s)`}
      />
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Text
              style={[styles.filterPill, filter === item.key && styles.filterPillActive]}
              onPress={() => setFilter(item.key)}
            >
              {item.label}
            </Text>
          )}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={<EmptyState title="Aucune demande" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.route} numberOfLines={2}>
                {item.pickupLocation || "—"} → {item.deliveryLocation || "—"}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.meta}>
              Client: {item.client?.name || "—"} · Transporteur: {item.transporteur?.name || "Non assigne"}
            </Text>
            <Text style={styles.meta}>
              {item.weight != null ? `${item.weight} kg` : "—"} ·{" "}
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : ""}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  filters: { marginBottom: 4 },
  filterList: { paddingHorizontal: 14, gap: 8, paddingBottom: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    overflow: "hidden",
  },
  filterPillActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
    color: theme.colors.primary,
  },
  list: { paddingHorizontal: 14, paddingBottom: 24 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 10,
    ...theme.shadows.cardSoft,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  route: { flex: 1, fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary },
  meta: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
});
