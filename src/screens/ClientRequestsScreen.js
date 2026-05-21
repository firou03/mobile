import React, { useCallback, useEffect, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import RequestCard from "../components/RequestCard";
import { confirmRequest, getClientRequests, refuseRequest } from "../service/restApiTransport";
import { extractTransportRequestsList } from "../utils/requestStatus";
import theme from "../utils/theme";

export default function ClientRequestsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);

  const showToast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else console.log(msg);
  };

  const loadRequests = useCallback(async () => {
    try {
      const res = await getClientRequests();
      setItems(extractTransportRequestsList(res));
    } catch {
      setItems([]);
      showToast("Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onConfirm = async (id) => {
    if (!id) return;
    setActionId(id);
    try {
      await confirmRequest(id);
      showToast("Demande confirmée");
      loadRequests();
    } catch {
      showToast("Confirmation impossible");
    } finally {
      setActionId(null);
    }
  };

  const onRefuse = async (id) => {
    if (!id) return;
    setActionId(id);
    try {
      await refuseRequest(id);
      showToast("Demande refusée");
      loadRequests();
    } catch {
      showToast("Action impossible");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader title="Mes demandes" subtitle="Historique client" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRequests();
            }}
            colors={[theme.colors.primary]}
          />
        }
      >
        {items.length === 0 ? (
          <EmptyState title="Aucune demande" subtitle="Vos demandes apparaitront ici." />
        ) : (
          items.map((item) => (
            <RequestCard
              key={item._id || `${item.pickupLocation}-${item.date}`}
              item={item}
              showAccept={false}
              showConfirmActions
              onConfirm={onConfirm}
              onRefuse={onRefuse}
              confirming={actionId === item._id}
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
