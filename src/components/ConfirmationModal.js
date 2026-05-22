import React, { useEffect, useRef, useState } from "react";
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
import { confirmRequest, refuseRequest } from "../service/restApiTransport";
import { needsClientConfirmation } from "../utils/requestStatus";
import theme from "../utils/theme";

function showToast(msg) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function ConfirmationModal({
  visible,
  request,
  onClose,
  onConfirm,
  onRefuse,
}) {
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [refused, setRefused] = useState(false);
  const isMounted = useRef(true);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible || !request?.expiresAt) {
      setTimeRemaining(null);
      return undefined;
    }

    const tick = () => {
      if (!isMounted.current) return;
      const diff = new Date(request.expiresAt) - new Date();
      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }
      setTimeRemaining({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [visible, request?.expiresAt]);

  const handleClose = () => {
    if (loading) return;
    setCompleted(false);
    setRefused(false);
    onClose?.();
  };

  const scheduleClose = (done) => {
    closeTimerRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      done?.();
      onClose?.();
    }, 1200);
  };

  const handleConfirm = async () => {
    if (!request?._id || !needsClientConfirmation(request)) {
      showToast("Cette demande ne peut plus être confirmée");
      return;
    }
    setLoading(true);
    try {
      await confirmRequest(request._id);
      if (!isMounted.current) return;
      setCompleted(true);
      scheduleClose(() => {
        setCompleted(false);
        onConfirm?.();
      });
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Erreur lors de la confirmation"
      );
      if (isMounted.current) setLoading(false);
    }
  };

  const handleRefuse = async () => {
    if (!request?._id || !needsClientConfirmation(request)) {
      showToast("Cette demande ne peut plus être refusée");
      return;
    }
    setLoading(true);
    try {
      await refuseRequest(request._id);
      if (!isMounted.current) return;
      setRefused(true);
      scheduleClose(() => {
        setRefused(false);
        onRefuse?.();
      });
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Erreur lors du refus"
      );
      if (isMounted.current) setLoading(false);
    }
  };

  if (!request) return null;

  const dateLabel = request.date
    ? new Date(request.date).toLocaleDateString("fr-FR")
    : "—";

  const urgentTimer = timeRemaining && timeRemaining.hours < 2;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <Text style={styles.title}>Confirmer la livraison ?</Text>
              <TouchableOpacity onPress={handleClose} disabled={loading} hitSlop={12}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {completed ? (
              <View style={styles.successBox}>
                <Text style={styles.successEmoji}>✅</Text>
                <Text style={styles.successTitle}>Livraison confirmée !</Text>
                <Text style={styles.successSub}>Le transporteur a été notifié.</Text>
              </View>
            ) : refused ? (
              <View style={styles.successBox}>
                <Text style={styles.successEmoji}>❌</Text>
                <Text style={[styles.successTitle, { color: theme.colors.danger }]}>
                  Demande annulée
                </Text>
                <Text style={styles.successSub}>Le transporteur a été informé.</Text>
              </View>
            ) : (
              <>
                {request.transporteur ? (
                  <>
                    <Text style={styles.label}>Transporteur</Text>
                    <UserRatingSummary user={request.transporteur} showEvaluations />
                  </>
                ) : null}

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
                  {request.isSensitive === "oui" ? (
                    <Text style={styles.sensitive}>⚠️ Sensible / Fragile</Text>
                  ) : null}
                </View>

                {timeRemaining ? (
                  <View
                    style={[
                      styles.timerBox,
                      urgentTimer ? styles.timerUrgent : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timerText,
                        urgentTimer ? { color: theme.colors.danger } : null,
                      ]}
                    >
                      ⏱ Il vous reste {timeRemaining.hours}h {timeRemaining.minutes}m pour
                      confirmer
                    </Text>
                  </View>
                ) : null}

                <View style={styles.actions}>
                  <AppButton
                    title={loading ? "..." : "Refuser"}
                    variant="secondary"
                    onPress={handleRefuse}
                    disabled={loading}
                    style={styles.actionBtn}
                  />
                  <AppButton
                    title={loading ? "..." : "Confirmer"}
                    onPress={handleConfirm}
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
    marginBottom: 16,
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
  sensitive: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.warning,
    marginTop: 4,
  },
  timerBox: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  timerUrgent: {
    backgroundColor: theme.colors.dangerLight,
    borderColor: theme.colors.danger,
  },
  timerText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.warning,
    textAlign: "center",
  },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1 },
  successBox: { alignItems: "center", paddingVertical: 32 },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.secondary },
  successSub: { fontSize: 14, color: theme.colors.textMuted, textAlign: "center" },
});
