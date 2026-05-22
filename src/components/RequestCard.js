import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";
import StatusBadge from "./StatusBadge";
import UserRatingSummary from "./UserRatingSummary";
import { canDeliverRequest, needsClientConfirmation } from "../utils/requestStatus";
import theme from "../utils/theme";

export default function RequestCard({
  item,
  onAccept,
  showAccept = true,
  acceptedMode = false,
  showDeliver = false,
  onDeliver,
  delivering = false,
  showConfirmActions = false,
  onConfirmPress,
  confirming = false,
}) {
  const status = item?.status ?? item?.statut;
  const canDeliver = showDeliver && canDeliverRequest(status) && typeof onDeliver === "function";
  const showClientActions = showConfirmActions && needsClientConfirmation(status);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}>
      <View style={styles.topRow}>
        <Text style={styles.route}>
          🚚 {item?.pickupLocation} → {item?.deliveryLocation}
        </Text>
        <StatusBadge status={status} />
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>⚖️ {item?.weight} kg</Text>
        <Text style={styles.meta}>📅 {String(item?.date || "").slice(0, 10)}</Text>
        {item?.isSensitive === "oui" ? <Text style={styles.sensitive}>⚠️ Sensible</Text> : null}
      </View>
      {acceptedMode && item?.client ? (
        <View style={styles.userBlock}>
          <UserRatingSummary user={item.client} compact showEvaluations={false} />
        </View>
      ) : null}
      {!acceptedMode && item?.client && showAccept ? (
        <View style={styles.userBlock}>
          <UserRatingSummary user={item.client} compact showEvaluations={false} />
        </View>
      ) : null}
      {item?.transporteur && (acceptedMode || showClientActions) ? (
        <View style={styles.userBlock}>
          <UserRatingSummary user={item.transporteur} compact showEvaluations={false} />
        </View>
      ) : null}
      {showAccept ? (
        <AppButton title="Accepter" variant="secondary" onPress={() => onAccept?.(item)} />
      ) : null}
      {showClientActions ? (
        <AppButton
          title="Voir et confirmer"
          onPress={() => onConfirmPress?.(item)}
          loading={confirming}
        />
      ) : null}
      {canDeliver ? (
        <AppButton
          title={delivering ? "Confirmation..." : "Marquer comme livré"}
          onPress={() => onDeliver(item?._id)}
          loading={delivering}
          style={styles.deliverBtn}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    padding: 14,
    marginBottom: 14,
    ...theme.shadows.cardMedium,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  route: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  meta: {
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
    fontWeight: "600",
    fontSize: 12,
  },
  sensitive: {
    alignSelf: "center",
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.warning,
  },
  userBlock: {
    marginBottom: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  deliverBtn: {
    marginTop: 10,
  },
});
