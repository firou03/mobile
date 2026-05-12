import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { createTransportRequest } from "../service/restApiTransport";
import PaymentContent from "../components/PaymentScreen";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import MapPicker from "../components/MapPicker";
import theme from "../utils/theme";

export default function ClientScreen() {
  const [step, setStep] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);
  
  const getDateToday = () => new Date().toISOString().split("T")[0];
  
  const [formData, setFormData] = useState({
    pickupLocation: "", deliveryLocation: "",
    date: getDateToday(), weight: 10, isSensitive: "non",
  });
  const [selectedPoint, setSelectedPoint] = useState({
    latitude: 36.8065,
    longitude: 10.1815,
  });

  const showToast = (message) => {
    if (Platform.OS === "android") ToastAndroid.show(message, ToastAndroid.SHORT);
    else console.log(message);
  };

  // Date constraints: today to end of current year
  const getYearEndString = () => {
    const d = new Date();
    d.setMonth(11);
    d.setDate(31);
    return d.toISOString().split("T")[0];
  };

  const minDate = getDateToday();
  const maxDate = getYearEndString();

  const handleSubmit = async () => {
    if (!formData.pickupLocation || !formData.deliveryLocation || !formData.date || !formData.weight) {
      showToast("Remplissez tous les champs");
      return;
    }

    // Validate weight
    if (formData.weight <= 0) {
      showToast("Le poids doit être supérieur à 0 kg");
      return;
    }

    // Validate date is within allowed range
    if (formData.date < minDate) {
      showToast("La date doit être à partir d'aujourd'hui");
      return;
    }

    if (formData.date > maxDate) {
      showToast("La date doit être dans l'année en cours");
      return;
    }

    setLoading(true);
    try {
      const res = await createTransportRequest({
        ...formData,
        weight: Math.round(formData.weight),
      });
      const requestId = res?.data?.request?._id;
      if (requestId) {
        setCreatedRequestId(requestId);
        setStep(4); // Go to payment step
      } else {
        showToast("Erreur: ID de demande non reçu");
      }
    } catch (error) {
      showToast(error?.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    showToast("Paiement et demande confirmés ✅");
    setFormData({ pickupLocation: "", deliveryLocation: "", date: getDateToday(), weight: 10, isSensitive: "non" });
    setCreatedRequestId(null);
    setStep(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepper}>
        {[1, 2, 3, 4].map((current) => (
          <View key={current} style={[styles.stepDot, step >= current ? styles.stepActive : null]}>
            <Text style={[styles.stepText, step >= current ? styles.stepTextActive : null]}>{current}</Text>
          </View>
        ))}
      </View>

      {step === 4 && createdRequestId ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <PaymentContent 
            requestId={createdRequestId} 
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => {
              setCreatedRequestId(null);
              setStep(3);
            }}
          />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {step === 1 ? (
            <View style={styles.card}>
              <AppInput
                label="Lieu de depart"
                icon="📍"
                placeholder="Ex: Tunis"
                value={formData.pickupLocation}
                onChangeText={(v) => setFormData({ ...formData, pickupLocation: v })}
              />
              <AppInput
                label="Lieu d'arrivee"
                icon="📦"
                placeholder="Ex: Sfax"
                value={formData.deliveryLocation}
                onChangeText={(v) => setFormData({ ...formData, deliveryLocation: v })}
              />
              <Pressable style={styles.mapButton} onPress={() => setShowMap((prev) => !prev)}>
                <Text style={styles.mapButtonText}>🗺️ {showMap ? "Masquer la carte" : "Choisir sur la carte"}</Text>
              </Pressable>
              {showMap ? (
                <MapPicker selectedPoint={selectedPoint} onSelectPoint={setSelectedPoint} />
              ) : null}
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.card}>
              <AppInput
                label="Date de livraison souhaitée (YYYY-MM-DD)"
                placeholder={minDate}
                value={formData.date}
                onChangeText={(v) => setFormData({ ...formData, date: v })}
              />
              <Text style={styles.helperText}>De {minDate} à {maxDate}</Text>
              <Text style={styles.label}>Poids: {Math.round(formData.weight)} kg</Text>
              <Slider
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={formData.weight}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                onValueChange={(v) => setFormData({ ...formData, weight: v })}
              />
              <View style={styles.switchRow}>
                <Text style={styles.label}>Colis sensible / Fragile</Text>
                <Switch
                  value={formData.isSensitive === "oui"}
                  onValueChange={(v) => setFormData({ ...formData, isSensitive: v ? "oui" : "non" })}
                  trackColor={{ true: theme.colors.danger, false: theme.colors.border }}
                />
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.card}>
              <Text style={styles.summaryTitle}>Recapitulatif</Text>
              <Text style={styles.summaryLine}>📍 Départ: {formData.pickupLocation || "-"}</Text>
              <Text style={styles.summaryLine}>📦 Arrivée: {formData.deliveryLocation || "-"}</Text>
              <Text style={styles.summaryLine}>📅 Date: {formData.date || "-"}</Text>
              <Text style={styles.summaryLine}>⚖️ Poids: {Math.round(formData.weight)} kg</Text>
              <Text style={styles.summaryLine}>⚠️ Type: {formData.isSensitive === "oui" ? "Sensible / Fragile" : "Standard"}</Text>
              <View style={styles.priceInfoBox}>
                <Text style={styles.priceInfoLabel}>💰 Tarification estimée:</Text>
                <Text style={styles.priceInfoText}>
                  {Math.round(formData.weight) <= 10 
                    ? "7 DT" 
                    : `${7 + (Math.round(formData.weight) - 10)} DT`}
                </Text>
              </View>
              <AppButton 
                title="Procéder au paiement →" 
                onPress={handleSubmit} 
                loading={loading} 
                style={styles.sendButton}
              />
            </View>
          ) : null}
        </ScrollView>
      )}

      {step < 4 && (
        <View style={styles.footerActions}>
          <AppButton 
            title="Retour" 
            variant="outline" 
            disabled={step === 1} 
            onPress={() => setStep((s) => Math.max(1, s - 1))} 
            style={styles.actionBtn} 
          />
          <AppButton 
            title={step === 3 ? "Payer →" : "Suivant"} 
            disabled={step === 3 ? loading : false} 
            onPress={() => step === 3 ? handleSubmit() : setStep((s) => Math.min(3, s + 1))} 
            style={styles.actionBtn} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  stepper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingTop: 12,
    paddingBottom: 6,
  },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepText: { color: theme.colors.textSecondary, fontWeight: "700" },
  stepTextActive: { color: theme.colors.white },
  content: { padding: 16, paddingBottom: 110 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  mapButton: {
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  mapButtonText: { color: theme.colors.primary, fontWeight: "700" },
  label: { color: theme.colors.textPrimary, fontWeight: "700", marginBottom: 8, marginTop: 6 },
  switchRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTitle: { fontSize: 20, fontWeight: "800", color: theme.colors.textPrimary, marginBottom: 12 },
  summaryLine: { color: theme.colors.textSecondary, marginBottom: 8, fontSize: 15 },
  sendButton: { marginTop: 10 },
  priceInfoBox: {
    backgroundColor: theme.colors.accentPaymentBg,
    borderWidth: 1.5,
    borderColor: theme.colors.accentPaymentBorder,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  priceInfoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.accentPaymentText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  priceInfoText: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.accentPayment,
  },
  helperText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 12,
    fontStyle: "italic",
  },
  footerActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionBtn: { flex: 1 },
});