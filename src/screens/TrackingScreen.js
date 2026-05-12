import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import AppButton from "../components/AppButton";
import { AuthContext } from "../context/AuthContext";
import { getClientRequestsForDashboard, getMesRequests, updateRequestLocation } from "../service/restApiTransport";
import theme from "../utils/theme";

function toast(msg) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

const sameId = (a, b) => String(a ?? "") === String(b ?? "");

/**
 * Parité fonctionnelle simplifiée avec ColisTracking (web) : positions API
 * + saisie lat/lng pour le transporteur.
 */
export default function TrackingScreen() {
  const { user } = useContext(AuthContext);
  const isTransporteur = String(user?.role || "").trim().toLowerCase() === "transporteur";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latLng, setLatLng] = useState({}); // requestId -> "lat,lng"

  const load = useCallback(async () => {
    try {
      if (isTransporteur) {
        const res = await getMesRequests();
        const list = Array.isArray(res.data) ? res.data : [];
        setRequests(list.filter((r) => ["accepted_by_transporter", "confirmed", "delivered"].includes(String(r.status || "").toLowerCase())));
      } else {
        const res = await getClientRequestsForDashboard();
        const list = Array.isArray(res.data) ? res.data : [];
        const uid = String(user?._id || "");
        setRequests(
          list.filter(
            (r) =>
              ["accepted_by_transporter", "confirmed", "delivered"].includes(String(r.status || "").toLowerCase()) &&
              (sameId(r.client?._id, uid) || sameId(r.client, uid))
          )
        );
      }
    } catch {
      setRequests([]);
      toast("Impossible de charger le suivi");
    } finally {
      setLoading(false);
    }
  }, [isTransporteur, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const pushLoc = async (requestId) => {
    const raw = (latLng[requestId] || "").trim();
    const parts = raw.split(/[,;\s]+/).filter(Boolean);
    if (parts.length < 2) {
      toast("Indiquez latitude et longitude (ex: 36.8,10.18)");
      return;
    }
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast("Coordonnées invalides");
      return;
    }
    try {
      await updateRequestLocation(requestId, { latitude: lat, longitude: lng });
      toast("Position enregistrée");
      load();
    } catch {
      toast("Mise à jour impossible");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>Suivi colis</Text>
      <Text style={styles.sub}>
        {isTransporteur ? "Ajoutez votre position GPS pour les trajets acceptés." : "Position mise à jour par le transporteur."}
      </Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>Aucun colis accepté à suivre.</Text>
      ) : (
        requests.map((r) => {
          const loc = r.transporterLocation || {};
          return (
            <View key={r._id} style={styles.card}>
              <Text style={styles.route}>
                {(r.pickupLocation || "").slice(0, 42)} → {(r.deliveryLocation || "").slice(0, 42)}
              </Text>
              {loc.lat != null && loc.lng != null ? (
                <Text style={styles.coords}>
                  Dernière position : {loc.lat?.toFixed?.(5) ?? loc.lat}, {loc.lng?.toFixed?.(5) ?? loc.lng}
                </Text>
              ) : (
                <Text style={styles.muted}>Position pas encore envoyée.</Text>
              )}
              {isTransporteur ? (
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="lat, lng — ex: 36.8065, 10.1815"
                    placeholderTextColor={theme.colors.textMuted}
                    value={latLng[r._id] || ""}
                    onChangeText={(t) => setLatLng((p) => ({ ...p, [r._id]: t }))}
                  />
                  <AppButton title="Envoyer la position" onPress={() => pushLoc(r._id)} />
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  pad: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background },
  title: { fontSize: 20, fontWeight: "800", color: theme.colors.textPrimary },
  sub: { color: theme.colors.textSecondary, marginTop: 8, marginBottom: 18 },
  empty: { color: theme.colors.textMuted, marginTop: 24, textAlign: "center" },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  route: { fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 8 },
  coords: { color: theme.colors.primary, fontWeight: "600", marginBottom: 8 },
  muted: { color: theme.colors.textMuted, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: 12,
    marginBottom: 10,
    color: theme.colors.textPrimary,
  },
});
