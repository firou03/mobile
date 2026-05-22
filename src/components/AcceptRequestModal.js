import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "./AppButton";
import UserRatingSummary from "./UserRatingSummary";
import { acceptTransportRequest } from "../service/restApiTransport";
import { createConversation, sendMessage } from "../service/restApiChat";
import theme from "../utils/theme";

function showToast(msg) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function AcceptRequestModal({ visible, request, onClose, onAccepted }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setCompleted(false);
    onClose?.();
  };

  const handleAccept = async () => {
    if (!request?._id) return;
    setLoading(true);
    try {
      await acceptTransportRequest(request._id);

      try {
        const clientId = request.client?._id;
        if (clientId) {
          const convRes = await createConversation(clientId, request._id);
          const convId = convRes.data?._id;
          if (convId) {
            await sendMessage(convId, {
              content:
                "Bonjour, j'ai accepté votre demande de transport. Nous pouvons discuter des détails ici.",
            });
          }
        }
      } catch (chatErr) {
        console.warn("Chat:", chatErr?.message);
      }

      setCompleted(true);
      setTimeout(() => {
        onAccepted?.(request._id);
        setCompleted(false);
        onClose?.();
      }, 1200);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Erreur lors de l'acceptation";
      showToast(msg);
      setLoading(false);
    }
  };

  if (!request) return null;

  const dateLabel = request.date
    ? new Date(request.date).toLocaleDateString("fr-FR")
    : "—";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <Text style={styles.title}>Accepter cette demande ?</Text>
              <TouchableOpacity onPress={handleClose} disabled={loading} hitSlop={12}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {completed ? (
              <View style={styles.successBox}>
                <Text style={styles.successEmoji}>✅</Text>
                <Text style={styles.successTitle}>Demande acceptée !</Text>
                <Text style={styles.successSub}>
                  Le client a été notifié et a 24h pour confirmer.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Client</Text>
                <UserRatingSummary user={request.client} showEvaluations />

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Trajet</Text>
                  <Text style={styles.infoValue}>
                    {request.pickupLocation} → {request.deliveryLocation}
                  </Text>
                  <View style={styles.infoRow}>
                    <View>
                      <Text style={styles.infoLabel}>Poids</Text>
                      <Text style={styles.infoValue}>{request.weight} kg</Text>
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>Date</Text>
                      <Text style={styles.infoValue}>{dateLabel}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  <AppButton
                    title="Annuler"
                    variant="outline"
                    onPress={handleClose}
                    disabled={loading}
                    style={styles.actionBtn}
                  />
                  <AppButton
                    title={loading ? "Traitement..." : "Confirmer l'acceptation"}
                    onPress={handleAccept}
                    loading={loading}
                    style={styles.actionBtn}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
    paddingBottom: 24,
  },
  scroll: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "800", color: theme.colors.textPrimary, flex: 1 },
  close: { fontSize: 22, color: theme.colors.textMuted, padding: 4 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  infoBox: {
    backgroundColor: theme.colors.slate100,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  infoRow: { flexDirection: "row", gap: 24 },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1 },
  successBox: { alignItems: "center", paddingVertical: 32 },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.secondary },
  successSub: { fontSize: 14, color: theme.colors.textMuted, textAlign: "center" },
});
