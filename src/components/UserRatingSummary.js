import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getUserReviews } from "../service/restApiReview";
import { getUserProfileImageUri } from "../utils/userImage";
import theme from "../utils/theme";
import StarRow from "./StarRow";

const PREVIEW_LIMIT = 3;

export default function UserRatingSummary({
  user,
  compact = false,
  showEvaluations = true,
  previewLimit = PREVIEW_LIMIT,
}) {
  const [reviewData, setReviewData] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const userId = user?._id || user?.id;

  useEffect(() => {
    setShowAllReviews(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    setLoadingReviews(true);
    getUserReviews(userId)
      .then((res) => {
        if (!cancelled) setReviewData(res.data);
      })
      .catch(() => {
        if (!cancelled) setReviewData(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingReviews(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!user) {
    return <Text style={styles.muted}>—</Text>;
  }

  const roleLabel = user.role === "transporteur" ? "Transporteur" : "Client";
  const rating = Number(reviewData?.average ?? user.averageRating ?? 0);
  const reviewCount = Number(reviewData?.total ?? user.totalReviews ?? 0);
  const allReviews = reviewData?.reviews || [];
  const hasMore = allReviews.length > previewLimit;
  const visibleReviews = showAllReviews
    ? allReviews
    : allReviews.slice(0, previewLimit);
  const avatarUri = getUserProfileImageUri(user);
  const initials = (user.name || user.email || "?").charAt(0).toUpperCase();

  const ratingLine = (
    <View style={styles.ratingRow}>
      <StarRow value={rating} size={compact ? 12 : 14} emptyColor={theme.colors.border} />
      <Text style={styles.ratingValue}>{rating.toFixed(1)} / 5</Text>
      {loadingReviews ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <Text style={styles.reviewCount}>
          {reviewCount} évaluation{reviewCount !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );

  const renderReview = (rev) => (
    <View key={rev._id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <StarRow value={rev.rating} size={11} emptyColor={theme.colors.border} />
        <Text style={styles.reviewRating}>{rev.rating}/5</Text>
        <Text style={styles.reviewAuthor}>— {rev.ratedBy?.name || "Utilisateur"}</Text>
      </View>
      <Text style={styles.reviewComment}>
        {rev.comment ? `« ${rev.comment} »` : "Pas de commentaire"}
      </Text>
    </View>
  );

  const evaluationsBlock =
    showEvaluations && !compact && visibleReviews.length > 0 ? (
      <View style={styles.evaluationsSection}>
        <Text style={styles.sectionLabel}>
          {showAllReviews
            ? `Toutes les évaluations (${allReviews.length})`
            : allReviews.length <= previewLimit
              ? `Évaluations récentes (${allReviews.length})`
              : `${previewLimit} dernières évaluations`}
        </Text>
        {visibleReviews.map(renderReview)}
        {hasMore ? (
          <Pressable style={styles.moreBtn} onPress={() => setShowAllReviews((v) => !v)}>
            <Text style={styles.moreBtnText}>
              {showAllReviews
                ? "Voir moins"
                : `Voir plus (${allReviews.length - previewLimit} autre${
                    allReviews.length - previewLimit > 1 ? "s" : ""
                  })`}
            </Text>
          </Pressable>
        ) : null}
      </View>
    ) : showEvaluations && !compact && !loadingReviews && reviewCount === 0 ? (
      <Text style={styles.noReviews}>Aucune évaluation pour le moment</Text>
    ) : null;

  if (compact) {
    return (
      <View style={styles.compactWrap}>
        <Text style={styles.compactName}>{user.name || "—"}</Text>
        <Text style={styles.roleBadge}>{roleLabel}</Text>
        {ratingLine}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarLetter}>{initials}</Text>
          )}
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name || "—"}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{roleLabel}</Text>
            </View>
          </View>
          {user.email ? <Text style={styles.email}>{user.email}</Text> : null}
          <View style={{ marginTop: 6 }}>{ratingLine}</View>
        </View>
      </View>
      {evaluationsBlock}
    </View>
  );
}

const styles = StyleSheet.create({
  muted: { color: theme.colors.textMuted, fontSize: 12 },
  compactWrap: { marginBottom: 8 },
  compactName: { fontWeight: "700", fontSize: 14, color: theme.colors.textPrimary },
  roleBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  card: {
    backgroundColor: theme.colors.slate100,
    borderRadius: theme.radius.lg,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: { flexDirection: "row", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 48, height: 48 },
  avatarLetter: { fontSize: 20, fontWeight: "800", color: theme.colors.primary },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary },
  rolePill: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
  },
  email: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  ratingValue: { fontSize: 13, fontWeight: "700", color: theme.colors.starFilled },
  reviewCount: { fontSize: 12, color: theme.colors.textMuted },
  evaluationsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  reviewCard: {
    padding: 10,
    marginBottom: 6,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  reviewRating: { fontSize: 11, fontWeight: "700", color: theme.colors.starFilled },
  reviewAuthor: { fontSize: 10, color: theme.colors.textMuted },
  reviewComment: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },
  moreBtn: {
    marginTop: 4,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  moreBtnText: { fontSize: 13, fontWeight: "700", color: theme.colors.primary },
  noReviews: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: "italic",
    marginTop: 12,
  },
});
