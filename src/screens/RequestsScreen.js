import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { acceptTransportRequest, getPendingRequests } from "../service/restApiTransport";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import RequestCard from "../components/RequestCard";
import theme from "../utils/theme";

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await getPendingRequests();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      ToastAndroid.show("Erreur de chargement", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onAccept = async (id) => {
    try {
      await acceptTransportRequest(id);
      ToastAndroid.show("Demande acceptee", ToastAndroid.SHORT);
      fetchRequests();
    } catch {
      ToastAndroid.show("Action impossible", ToastAndroid.SHORT);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Demandes en attente"
        subtitle={`${requests.length} disponibles`}
        rightContent={<Text style={styles.counter}>{requests.length}</Text>}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchRequests();
            }}
            colors={[theme.colors.primary]}
          />
        }
      >
        {requests.length === 0 ? (
          <EmptyState title="Aucune demande en attente" subtitle="Tirez pour actualiser." />
        ) : (
          requests.map((item) => <RequestCard key={item._id} item={item} onAccept={onAccept} showAccept />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 14, paddingBottom: 24 },
  counter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "700",
  },
});
