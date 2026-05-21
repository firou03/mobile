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
import { deleteReview, getAllReviews } from "../../service/restApiAdmin";
import { extractReviewsList } from "../../utils/adminHelpers";
import theme from "../../utils/theme";

export default function AdminReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const toast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else console.log(msg);
  };

  const load = useCallback(async () => {
    try {
      const res = await getAllReviews();
      setReviews(extractReviewsList(res));
    } catch {
      setReviews([]);
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
    Alert.alert("Supprimer l'avis", "Cette action est irreversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(item._id);
            setReviews((prev) => prev.filter((r) => r._id !== item._id));
            toast("Avis supprime");
          } catch {
            toast("Suppression impossible");
          }
        },
      },
    ]);
  };

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "—";

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <AppHeader title="Avis clients" subtitle={`${reviews.length} avis · Moyenne ${avg}★`} />
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={<EmptyState title="Aucun avis" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.stars}>
                <Text style={styles.starText}>{"★".repeat(item.rating || 0)}{"☆".repeat(5 - (item.rating || 0))}</Text>
                <Text style={styles.ratingNum}>{item.rating}/5</Text>
              </View>
              <Text style={styles.deleteBtn} onPress={() => onDelete(item)}>
                Supprimer
              </Text>
            </View>
            <Text style={styles.author}>
              {item.ratedBy?.name || "Auteur"} → {item.ratedUser?.name || "Evalue"}
            </Text>
            {item.comment ? (
              <Text style={styles.comment} numberOfLines={3}>
                {item.comment}
              </Text>
            ) : (
              <Text style={styles.noComment}>Sans commentaire</Text>
            )}
            {item.transportRequest ? (
              <Text style={styles.route} numberOfLines={1}>
                {item.transportRequest.pickupLocation} → {item.transportRequest.deliveryLocation}
              </Text>
            ) : null}
          </View>
        )}
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
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  stars: { flexDirection: "row", alignItems: "center", gap: 8 },
  starText: { fontSize: 14, color: "#fbbf24" },
  ratingNum: { fontSize: 12, fontWeight: "700", color: theme.colors.textMuted },
  deleteBtn: { fontSize: 13, fontWeight: "700", color: theme.colors.danger },
  author: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
  comment: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 6, lineHeight: 18 },
  noComment: { fontSize: 12, fontStyle: "italic", color: theme.colors.textMuted, marginTop: 6 },
  route: { fontSize: 11, color: theme.colors.textMuted, marginTop: 8 },
});
