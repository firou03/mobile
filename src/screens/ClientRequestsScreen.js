import React, { useCallback, useEffect, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import AppHeader from "../components/AppHeader";
import ConfirmationModal from "../components/ConfirmationModal";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import RequestCard from "../components/RequestCard";
import { getClientRequestsForDashboard } from "../service/restApiTransport";
import {
  extractTransportRequestsList,
  filterActiveRequests,
} from "../utils/requestStatus";
import theme from "../utils/theme";

export default function ClientRequestsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const showToast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  };

  const loadRequests = useCallback(async () => {
    try {
      const res = await getClientRequestsForDashboard();
      setItems(filterActiveRequests(extractTransportRequestsList(res)));
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

  const handleConfirmDone = () => {
    setSelectedRequest(null);
    loadRequests();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader title="Mes demandes" subtitle="Demandes en cours uniquement" />
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
              onConfirmPress={setSelectedRequest}
            />
          ))
        )}
      </ScrollView>

      <ConfirmationModal
        visible={!!selectedRequest}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onConfirm={handleConfirmDone}
        onRefuse={handleConfirmDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 14, paddingBottom: 24 },
});
