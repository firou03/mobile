import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import UserRatingSummary from "../components/UserRatingSummary";
import {
  getClientRequestsForDashboard,
  getMesRequests,
} from "../service/restApiTransport";
import {
  extractTransportRequestsList,
  filterHistoryRequests,
  getRequestStatusFromItem,
  normalizeRequestStatus,
} from "../utils/requestStatus";
import theme from "../utils/theme";

export default function HistoriqueScreen() {
  const { user } = useContext(AuthContext);
  const isClient = String(user?.role || "").trim().toLowerCase() === "client";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const showToast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  };

  const loadHistory = useCallback(async () => {
    try {
      const res = isClient
        ? await getClientRequestsForDashboard()
        : await getMesRequests();
      const all = extractTransportRequestsList(res);
      setItems(filterHistoryRequests(all));
    } catch {
      setItems([]);
      showToast("Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isClient]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered =
    filter === "all"
      ? items
      : items.filter((r) =>
          filter === "delivered"
            ? normalizeRequestStatus(getRequestStatusFromItem(r)) === "delivered"
            : normalizeRequestStatus(getRequestStatusFromItem(r)) === "cancelled"
        );

  const deliveredCount = items.filter(
    (r) => normalizeRequestStatus(getRequestStatusFromItem(r)) === "delivered"
  ).length;
  const cancelledCount = items.filter(
    (r) => normalizeRequestStatus(getRequestStatusFromItem(r)) === "cancelled"
  ).length;

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Historique"
        subtitle={
          isClient
            ? "Livraisons terminées et demandes annulées"
            : "Vos missions terminées ou annulées"
        }
      />
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{deliveredCount}</Text>
          <Text style={styles.statLabel}>Livrées</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statValue}>{cancelledCount}</Text>
          <Text style={styles.statLabel}>Annulées</Text>
        </View>
      </View>
      <View style={styles.filters}>
        {[
          { key: "all", label: "Toutes" },
          { key: "delivered", label: "Livrées" },
          { key: "cancelled", label: "Annulées" },
        ].map((f) => (
          <Text
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterPill, filter === f.key ? styles.filterActive : null]}
          >
            {f.label}
          </Text>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadHistory();
            }}
            colors={[theme.colors.primary]}
          />
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="Aucun élément dans l'historique"
            subtitle="Les demandes livrées ou annulées apparaîtront ici."
          />
        ) : (
          filtered.map((item) => (
            <View key={item._id} style={styles.historyCard}>
              <View style={styles.historyTop}>
                <Text style={styles.route}>
                  {item.pickupLocation} → {item.deliveryLocation}
                </Text>
                <StatusBadge status={getRequestStatusFromItem(item)} />
              </View>
              <Text style={styles.meta}>
                {item.weight} kg · {String(item.date || "").slice(0, 10)}
              </Text>
              {isClient && item.transporteur ? (
                <UserRatingSummary user={item.transporteur} compact showEvaluations={false} />
              ) : null}
              {!isClient && item.client ? (
                <UserRatingSummary user={item.client} compact showEvaluations={false} />
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 14, paddingBottom: 24 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 12,
    alignItems: "center",
    ...theme.shadows.cardMedium,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: theme.colors.primary },
  statLabel: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
  },
  filterActive: {
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary,
  },
  historyCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: 14,
    marginBottom: 12,
    ...theme.shadows.cardMedium,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  route: {
    flex: 1,
    fontWeight: "700",
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  meta: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 8 },
});
