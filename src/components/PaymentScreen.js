import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  TextInput,
  StyleSheet,
} from "react-native";
import { getPriceForRequest, createPayment } from "../service/restApiPayment";
import theme from "../utils/theme";

export default function PaymentContent({ requestId, onPaymentSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(true);
  const [price, setPrice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrice();
  }, [requestId]);

  const fetchPrice = async () => {
    try {
      setFetchingPrice(true);
      const res = await getPriceForRequest(requestId);
      setPrice(res.data);
      setError("");
    } catch (err) {
      setError("Erreur lors du calcul du prix");
      console.error("Price fetch error:", err);
    } finally {
      setFetchingPrice(false);
    }
  };

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === "card" && (!cardNumber || !holderName)) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requestId,
        cardNumber: paymentMethod === "card" ? cardNumber : null,
        holderName: paymentMethod === "card" ? holderName : null,
        paymentMethod,
      };

      const res = await createPayment(payload);
      showToast(`Paiement réussi! ID: ${res.data.transactionId}`);
      onPaymentSuccess(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erreur lors du paiement";
      setError(errorMsg);
      showToast(errorMsg);
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPrice) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accentPayment} />
        <Text style={styles.loadingText}>Calcul du prix...</Text>
      </View>
    );
  }

  return (
    <View style={styles.paymentContent}>
      {/* Price Summary Card */}
      {price && (
        <View style={styles.priceCard}>
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Poids du colis</Text>
            <Text style={styles.priceValue}>{price.weight} kg</Text>
          </View>
          <View style={[styles.priceLine, { borderTopWidth: 1, borderTopColor: theme.colors.accentPaymentLight }]}>
            <Text style={styles.priceLabel}>Tarif</Text>
            <Text style={[styles.priceValue, { fontSize: 20, fontWeight: "800" }]}>
              {price.amount} <Text style={{ fontSize: 14 }}>DT</Text>
            </Text>
          </View>
          <Text style={styles.priceInfo}>
            📌 Tarification: 7 DT jusqu'à 10 kg + 1 DT par kg supplémentaire
          </Text>
        </View>
      )}

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Méthode de paiement</Text>
        <View style={styles.methodsContainer}>
          {[
            { id: "card", label: "Carte", icon: "💳" },
            { id: "transfer", label: "Virement", icon: "🏦" },
            { id: "cash", label: "Espèces", icon: "💵" },
          ].map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.methodButton,
                paymentMethod === method.id && styles.methodButtonActive,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <Text
                style={[
                  styles.methodLabel,
                  paymentMethod === method.id && styles.methodLabelActive,
                ]}
              >
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Card Fields - Only show if card method selected */}
      {paymentMethod === "card" && (
        <View style={styles.section}>
          <Text style={styles.label}>Numéro de carte (16 chiffres)</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={theme.colors.placeholderDark}
            value={cardNumber}
            onChangeText={(text) => setCardNumber(text.replace(/\D/g, ""))}
            maxLength={16}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Titulaire de la carte</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre nom complet"
            placeholderTextColor={theme.colors.placeholderDark}
            value={holderName}
            onChangeText={setHolderName}
          />
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.submitButton,
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>
              {paymentMethod === "cash" 
                ? "💵 Payer à la livraison" 
                : `💳 Payer ${price?.amount || "-"} DT`}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  paymentContent: {
    padding: 16,
    paddingBottom: 100,
  },
  priceCard: {
    backgroundColor: theme.colors.accentPaymentBg,
    borderWidth: 1.5,
    borderColor: theme.colors.accentPaymentBorder,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  priceLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.accentPaymentText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.accentPayment,
  },
  priceInfo: {
    fontSize: 11,
    color: theme.colors.accentPaymentTextMuted,
    marginTop: 12,
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 12,
  },
  methodsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.accentPaymentLight,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  methodButtonActive: {
    borderColor: theme.colors.accentPayment,
    backgroundColor: theme.colors.accentPaymentBg,
  },
  methodIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  methodLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  methodLabelActive: {
    color: theme.colors.accentPayment,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.accentPaymentBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  button: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  submitButton: {
    flex: 1.5,
    backgroundColor: theme.colors.accentPayment,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.white,
  },
});
