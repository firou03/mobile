import React, { useCallback, useEffect, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import { deliverTransportRequest, getMesRequests } from "../service/restApiTransport";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import RequestCard from "../components/RequestCard";
import {
  extractTransportRequestsList,
  filterActiveRequests,
} from "../utils/requestStatus";
import theme from "../utils/theme";

export default function MesRequestsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveringId, setDeliveringId] = useState(null);

  const showToast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else console.log(msg);
  };

  const fetchAccepted = useCallback(async () => {
    try {
      const res = await getMesRequests();
      setItems(filterActiveRequests(extractTransportRequestsList(res)));
    } catch {
      showToast("Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccepted();
  }, [fetchAccepted]);

  const onDeliver = async (id) => {
    if (!id) return;
    setDeliveringId(id);
    try {
      await deliverTransportRequest(id);
      showToast("Livraison confirmée");
      fetchAccepted();
    } catch {
      showToast("Action impossible");
    } finally {
      setDeliveringId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader title="Mes trajets" subtitle="En cours — livrées et annulées dans Historique" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAccepted();
            }}
            colors={[theme.colors.primary]}
          />
        }
      >
        {items.length === 0 ? (
          <EmptyState title="Aucune demande acceptee" subtitle="Vos trajets apparaitront ici." />
        ) : (
          items.map((item) => (
            <RequestCard
              key={item._id}
              item={item}
              acceptedMode
              showAccept={false}
              showDeliver
              onDeliver={onDeliver}
              delivering={deliveringId === item._id}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 14, paddingBottom: 24 },
});
