import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "../components/AppButton";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_CANDIDATES } from "../service/apiConfig";
import { getUserReviews } from "../service/restApiReview";
import { updateUser, uploadProfilePicture } from "../service/restApiUser";
import theme, { getProfileAccent } from "../utils/theme";

const PREFERENCE_OPTIONS = ["Standard", "Express", "Économique", "Urgent"];

function StarRow({ value, size = 14 }) {
  const v = Math.round(Number(value) || 0);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text
          key={s}
          style={{ fontSize: size, color: s <= v ? theme.colors.starFilled : theme.colors.starEmpty }}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

function GlassCard({ children, style }) {
  return <View style={[styles.glass, style]}>{children}</View>;
}

export default function ProfileScreen({ navigation }) {
  const { user, token, signIn, signOut } = useContext(AuthContext);
  const role = String(user?.role || "").trim().toLowerCase();
  const isClient = role === "client";
  const isTransporteur = role === "transporteur";

  const accent = useMemo(() => getProfileAccent(isTransporteur), [isTransporteur]);

  const fullName =
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Utilisateur";

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    preference: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const imageBase = API_BASE_CANDIDATES[0];
  const profileImageUri =
    previewUri ||
    (user?.user_image ? `${imageBase}/images/${user.user_image}` : null);

  useEffect(() => {
    setFormData({
      phone: user?.phone || user?.telephone || "",
      address: user?.address || user?.adresse || "",
      city: user?.city || user?.ville || "",
      postalCode: user?.postalCode || user?.zipCode || "",
      preference: user?.preference || "",
    });
  }, [user]);

  const loadReviews = useCallback(async () => {
    const id = user?._id;
    if (!id) {
      setReviewData(null);
      setReviewsLoading(false);
      return;
    }
    try {
      setReviewsLoading(true);
      const res = await getUserReviews(id);
      setReviewData(res?.data || null);
    } catch {
      setReviewData(null);
    } finally {
      setReviewsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const isProfileIncomplete =
    !formData.phone ||
    !formData.address ||
    !formData.city ||
    !formData.postalCode ||
    !formData.preference;

  const handleSave = async () => {
    if (!user?._id || !token) return;
    try {
      setSaving(true);
      const res = await updateUser(user._id, formData);
      const updated = res?.data?.data;
      if (updated) {
        await signIn({ token, user: updated });
        setIsEditing(false);
        Alert.alert("Succès", "Profil mis à jour avec succès !");
      }
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      phone: user?.phone || user?.telephone || "",
      address: user?.address || user?.adresse || "",
      city: user?.city || user?.ville || "",
      postalCode: user?.postalCode || user?.zipCode || "",
      preference: user?.preference || "",
    });
    setIsEditing(false);
  };

  const pickAndUploadPhoto = async () => {
    if (!user?._id || !token) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission", "Accès à la photothèque requis pour changer la photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setPreviewUri(asset.uri);

    const formDataImg = new FormData();
    formDataImg.append("user_image", {
      uri: asset.uri,
      name: asset.fileName || "profile.jpg",
      type: asset.mimeType || "image/jpeg",
    });

    try {
      setUploading(true);
      const res = await uploadProfilePicture(user._id, formDataImg);
      const updated = res?.data?.data;
      if (updated) {
        await signIn({ token, user: updated });
        setPreviewUri(null);
        Alert.alert("Succès", "Photo de profil mise à jour.");
      }
    } catch {
      setPreviewUri(null);
      Alert.alert("Erreur", "Échec du téléversement de la photo.");
    } finally {
      setUploading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const vehicleLabel = user?.vehicleType || user?.vehicule || "—";
  const capacityLabel = user?.capacity || user?.capacite || "—";

  return (
    <LinearGradient colors={theme.gradients.profileBackground} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.white} />
            }
          >
            <View style={styles.pageHeader}>
              <Text style={styles.kicker}>Compte</Text>
              <Text style={styles.pageTitle}>Mon profil</Text>
              <Text style={styles.pageSubtitle}>Gérez vos informations personnelles</Text>
            </View>

            {isProfileIncomplete && (
              <View style={styles.warnBanner}>
                <Text style={styles.warnTitle}>Profil incomplet</Text>
                <Text style={styles.warnText}>
                  Complétez téléphone, adresse, ville, code postal et préférence pour une meilleure expérience.
                </Text>
              </View>
            )}

            <GlassCard style={styles.heroCard}>
              <LinearGradient
                colors={[accent.from, accent.to]}
                style={styles.avatarRing}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.avatarInner}>
                  {profileImageUri ? (
                    <Image source={{ uri: profileImageUri }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarLetter}>{fullName.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
              </LinearGradient>
              <View style={styles.heroMeta}>
                <Text style={styles.heroName}>{fullName}</Text>
                <Text style={styles.heroEmail}>{user?.email || "—"}</Text>
                <View style={[styles.rolePill, { borderColor: accent.activeBorder, backgroundColor: accent.active }]}>
                  <Text style={[styles.rolePillText, { color: accent.icon }]}>
                    {isTransporteur ? "Transporteur" : "Client"}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <Pressable
              onPress={pickAndUploadPhoto}
              disabled={uploading}
              style={({ pressed }) => [
                styles.photoBtn,
                { opacity: pressed ? 0.9 : 1 },
                uploading && { opacity: 0.6 },
              ]}
            >
              <LinearGradient colors={[accent.from, accent.to]} style={styles.photoBtnGrad}>
                {uploading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.photoBtnText}>📷 Changer la photo</Text>
                )}
              </LinearGradient>
            </Pressable>

            {reviewData && reviewData.total > 0 && (
              <GlassCard style={styles.ratingMini}>
                <Text style={styles.ratingBig}>{Number(reviewData.average).toFixed(1)}</Text>
                <StarRow value={reviewData.average} size={16} />
                <Text style={styles.ratingSub}>
                  {reviewData.total} avis reçu{reviewData.total > 1 ? "s" : ""}
                </Text>
              </GlassCard>
            )}

            <GlassCard style={styles.coordCard}>
              <View style={styles.coordHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Coordonnées</Text>
                  <Text style={styles.sectionHint}>Vos informations de contact</Text>
                </View>
                {!isEditing ? (
                  <Pressable onPress={() => setIsEditing(true)}>
                    <LinearGradient colors={[accent.from, accent.to]} style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Modifier</Text>
                    </LinearGradient>
                  </Pressable>
                ) : (
                  <View style={styles.editActions}>
                    <Pressable onPress={handleSave} disabled={saving}>
                      <LinearGradient colors={theme.gradients.saveButton} style={styles.smallBtn}>
                        {saving ? (
                          <ActivityIndicator color={theme.colors.white} size="small" />
                        ) : (
                          <Text style={styles.smallBtnText}>Enregistrer</Text>
                        )}
                      </LinearGradient>
                    </Pressable>
                    <Pressable onPress={handleCancel} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>Annuler</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <FieldBlock label="Nom complet" value={fullName} />
              <FieldBlock label="Email" value={user?.email || "—"} />

              <FieldBlock
                label="Téléphone"
                required
                editable={isEditing}
                value={formData.phone}
                onChangeText={(t) => setFormData((p) => ({ ...p, phone: t }))}
                placeholder="Ex: +216 20 123 456"
              />
              <FieldBlock
                label="Adresse"
                required
                editable={isEditing}
                value={formData.address}
                onChangeText={(t) => setFormData((p) => ({ ...p, address: t }))}
                placeholder="Votre adresse complète"
              />
              <FieldBlock
                label="Ville"
                required
                editable={isEditing}
                value={formData.city}
                onChangeText={(t) => setFormData((p) => ({ ...p, city: t }))}
                placeholder="Votre ville"
              />
              <FieldBlock
                label="Code postal"
                required
                editable={isEditing}
                value={formData.postalCode}
                onChangeText={(t) => setFormData((p) => ({ ...p, postalCode: t }))}
                placeholder="Ex: 1000"
              />

              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>
                  {isTransporteur ? "Type de véhicule" : "Type de compte"}
                </Text>
                <Text style={styles.fieldValueStatic}>
                  {isTransporteur ? vehicleLabel : "Client"}
                </Text>
              </View>

              {isClient ? (
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldLabel}>
                    Préférence de transport {!formData.preference && isEditing ? "*" : ""}
                  </Text>
                  {isEditing ? (
                    <View style={styles.chips}>
                      {PREFERENCE_OPTIONS.map((opt) => {
                        const on = formData.preference === opt;
                        return (
                          <Pressable
                            key={opt}
                            onPress={() => setFormData((p) => ({ ...p, preference: opt }))}
                            style={[
                              styles.chip,
                              on && {
                                borderColor: accent.activeBorder,
                                backgroundColor: accent.active,
                              },
                            ]}
                          >
                            <Text style={[styles.chipText, on && { color: accent.icon }]}>
                              {opt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.fieldValue}>
                      {formData.preference || "Non renseigné"}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldLabel}>Capacité (kg)</Text>
                  <Text style={styles.fieldValueStatic}>{capacityLabel}</Text>
                </View>
              )}

              {isEditing && (
                <Text style={styles.requiredHint}>
                  <Text style={{ color: theme.colors.dangerSoft }}>*</Text> Champs obligatoires pour compléter votre profil
                </Text>
              )}
            </GlassCard>

            <Pressable
              onPress={() =>
                navigation.navigate(isClient ? "Client" : isTransporteur ? "Requests" : "Home")
              }
              style={styles.ctaWrap}
            >
              <LinearGradient colors={[accent.from, accent.to]} style={styles.ctaBtn}>
                <Text style={styles.ctaText}>
                  {isClient ? "Nouvelle demande" : isTransporteur ? "Voir les demandes" : "Accueil"}
                </Text>
              </LinearGradient>
            </Pressable>

            <GlassCard style={styles.shortcuts}>
              <Text style={styles.shortcutsTitle}>Accès rapide</Text>
              <Pressable
                style={styles.shortcutRow}
                onPress={() => navigation.navigate(isClient ? "ClientRequests" : "MesRequests")}
              >
                <Text style={styles.shortcutText}>
                  {isClient ? "Mes demandes" : "Mes trajets"}
                </Text>
                <Text style={styles.shortcutChev}>›</Text>
              </Pressable>
              <Pressable style={styles.shortcutRow} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.shortcutText}>Tableau de bord</Text>
                <Text style={styles.shortcutChev}>›</Text>
              </Pressable>
            </GlassCard>

            <GlassCard style={styles.reviewsCard}>
              <Text style={styles.sectionTitle}>Évaluations reçues</Text>
              {reviewsLoading ? (
                <ActivityIndicator color={accent.icon} style={{ marginVertical: 24 }} />
              ) : !reviewData || reviewData.total === 0 ? (
                <Text style={styles.emptyReviews}>Aucun avis reçu pour le moment.</Text>
              ) : (
                <>
                  <View style={styles.reviewSummary}>
                    <Text style={styles.ratingHuge}>{Number(reviewData.average).toFixed(1)}</Text>
                    <StarRow value={reviewData.average} size={20} />
                    <Text style={styles.ratingSub}>{reviewData.total} avis</Text>
                  </View>
                  {(reviewData.reviews || []).map((review) => (
                    <View key={review._id} style={styles.reviewItem}>
                      <View style={styles.reviewTop}>
                        <View style={[styles.reviewAvatar, { backgroundColor: accent.active }]}>
                          <Text style={[styles.reviewAvatarTxt, { color: accent.icon }]}>
                            {review.ratedBy?.name?.charAt(0)?.toUpperCase() || "?"}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reviewName}>{review.ratedBy?.name || "Anonyme"}</Text>
                          <Text style={styles.reviewRole}>
                            {review.ratedBy?.role === "transporteur" ? "Transporteur" : "Client"}
                          </Text>
                        </View>
                        <StarRow value={review.rating} size={12} />
                      </View>
                      {review.comment ? (
                        <Text style={styles.reviewComment}>“{review.comment}”</Text>
                      ) : null}
                      {review.transportRequest ? (
                        <Text style={styles.reviewTrip}>
                          {review.transportRequest.pickupLocation} →{" "}
                          {review.transportRequest.deliveryLocation}
                        </Text>
                      ) : null}
                      <Text style={styles.reviewDate}>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("fr-FR")
                          : ""}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </GlassCard>

            <AppButton title="Déconnexion" variant="danger" onPress={signOut} style={styles.logout} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FieldBlock({ label, value, editable, onChangeText, placeholder, required }) {
  const showStar = required && editable && !value;
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.fieldLabel}>
        {label}
        {showStar ? <Text style={{ color: theme.colors.dangerSoft }}> *</Text> : null}
      </Text>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholderDark}
          style={styles.input}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || "Non renseigné"}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 20,
  },
  kicker: {
    fontSize: 11,
    color: theme.colors.textOnDarkSubtle,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.textOnDark,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: theme.colors.textOnDarkMuted,
  },
  warnBanner: {
    backgroundColor: theme.colors.amberWarningBg,
    borderWidth: 1,
    borderColor: theme.colors.amberWarningBorder,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 16,
  },
  warnTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.amberText,
    marginBottom: 4,
  },
  warnText: {
    fontSize: 12,
    color: theme.colors.amberTextMuted,
    lineHeight: 18,
  },
  glass: {
    backgroundColor: theme.colors.glassBg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    ...theme.shadows.avatarRing,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 41,
    backgroundColor: theme.colors.slate900,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.textOnDark,
  },
  heroMeta: {
    flex: 1,
  },
  heroName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.slateOnDark,
  },
  heroEmail: {
    fontSize: 12,
    color: theme.colors.textOnDarkMuted,
    marginTop: 4,
    marginBottom: 10,
  },
  rolePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  photoBtn: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  photoBtnGrad: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoBtnText: {
    color: theme.colors.textOnDark,
    fontWeight: "700",
    fontSize: 13,
  },
  ratingMini: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 16,
  },
  ratingBig: {
    fontSize: 36,
    fontWeight: "800",
    color: theme.colors.starFilled,
  },
  ratingHuge: {
    fontSize: 48,
    fontWeight: "800",
    color: theme.colors.starFilled,
    textAlign: "center",
  },
  ratingSub: {
    fontSize: 12,
    color: theme.colors.textOnDarkSubtle,
    marginTop: 6,
  },
  coordCard: {
    marginBottom: 16,
  },
  coordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.dividerDark,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textOnDark,
  },
  sectionHint: {
    fontSize: 12,
    color: theme.colors.textOnDarkSubtle,
    marginTop: 4,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editBtnText: {
    color: theme.colors.textOnDark,
    fontWeight: "700",
    fontSize: 12,
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  smallBtnText: {
    color: theme.colors.textOnDark,
    fontWeight: "700",
    fontSize: 12,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.glassBgStrong,
    borderWidth: 1,
    borderColor: theme.colors.glassBorderStrong,
  },
  cancelBtnText: {
    color: theme.colors.iconMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  fieldBox: {
    marginBottom: 14,
    backgroundColor: theme.colors.glassBgSoft,
    borderWidth: 1,
    borderColor: theme.colors.glassBorderSoft,
    borderRadius: theme.radius.sm,
    padding: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.sectionLabel,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.slateOnDark,
  },
  fieldValueStatic: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.slateOnDark,
  },
  input: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textOnDark,
    backgroundColor: theme.colors.inputDarkBg,
    borderWidth: 1,
    borderColor: theme.colors.inputDarkBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.tabReviewBorder,
    backgroundColor: theme.colors.glassBg,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.slateOnDark90,
  },
  requiredHint: {
    marginTop: 8,
    fontSize: 11,
    color: theme.colors.textOnDarkSubtle,
  },
  ctaWrap: {
    marginBottom: 16,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    ...theme.shadows.ctaWrap,
  },
  ctaBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: {
    color: theme.colors.textOnDark,
    fontWeight: "700",
    fontSize: 14,
  },
  shortcuts: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  shortcutsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.reviewMeta,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  shortcutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.rowBorder,
  },
  shortcutText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.slateOnDark,
  },
  shortcutChev: {
    fontSize: 22,
    color: theme.colors.textOnDarkFaint,
    fontWeight: "300",
  },
  reviewsCard: {
    marginBottom: 20,
  },
  emptyReviews: {
    textAlign: "center",
    color: theme.colors.textOnDarkSubtle,
    paddingVertical: 16,
    fontSize: 13,
  },
  reviewSummary: {
    alignItems: "center",
    marginBottom: 20,
  },
  reviewItem: {
    backgroundColor: theme.colors.glassBgSoft,
    borderWidth: 1,
    borderColor: theme.colors.glassBorderSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarTxt: {
    fontSize: 15,
    fontWeight: "700",
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.slateOnDark,
  },
  reviewRole: {
    fontSize: 11,
    color: theme.colors.textOnDarkSubtle,
  },
  reviewComment: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.reviewTitleMuted,
    fontStyle: "italic",
    backgroundColor: theme.colors.pillBg,
    padding: 10,
    borderRadius: 8,
  },
  reviewTrip: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.textOnDarkSubtle,
  },
  reviewDate: {
    marginTop: 6,
    fontSize: 11,
    color: theme.colors.textOnDarkFaint,
  },
  logout: {
    marginTop: 8,
  },
});
