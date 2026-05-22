import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { getPendingRequests } from "../service/restApiTransport";
import AcceptRequestModal from "../components/AcceptRequestModal";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import RequestCard from "../components/RequestCard";
import theme from "../utils/theme";

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await getPendingRequests();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onAccepted = () => {
    setSelectedRequest(null);
    fetchRequests();
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
          requests.map((item) => (
            <RequestCard
              key={item._id}
              item={item}
              onAccept={setSelectedRequest}
              showAccept
            />
          ))
        )}
      </ScrollView>

      <AcceptRequestModal
        visible={!!selectedRequest}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onAccepted={onAccepted}
      />
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
