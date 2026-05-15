/**
 * Tokens globaux — couleurs, espacements, rayons, ombres, dégradés.
 * Utiliser theme.colors.* / theme.spacing.* / theme.shadows.* / theme.gradients.*
 */

const colors = {
  // Marque — violet + vert forêt
  primary: "#6d28d9",
  primaryBright: "#8b5cf6",
  primaryDark: "#5b21b6",
  primaryLight: "#ede9fe",
  secondary: "#166534",
  secondaryLight: "#dcfce7",
  brandViolet: "#6d28d9",
  brandForest: "#166534",

  // Sémantique dashboard — violet demandes, vert livraisons, bleu suivi
  semanticRequest: "#7c3aed",
  semanticRequestBg: "rgba(124, 58, 237, 0.12)",
  semanticDelivery: "#166534",
  semanticDeliveryBg: "rgba(22, 101, 52, 0.12)",
  semanticTracking: "#2563eb",
  semanticTrackingBg: "rgba(37, 99, 235, 0.12)",
  semanticNeutral: "#64748b",
  semanticNeutralBg: "rgba(100, 116, 139, 0.12)",
  danger: "#e11d48",
  dangerLight: "#ffe4e9",
  warning: "#d97706",
  warningLight: "#fef3c7",

  // Neutres — fond brume légère, cartes lumineuses
  background: "#eef0fb",
  surface: "#ffffff",
  white: "#ffffff",
  black: "#000000",
  border: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#64748b",
  tabInactive: "#94a3b8",

  // Slate / en-têtes sombres
  slate900: "#0f172a",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",

  /** Ombre cartes — teinte violette (cohérente avec la marque) */
  cardShadow: "rgba(91, 33, 182, 0.14)",
  shadowSlate: "#5b21b6",

  // Badges / héros sur dégradé bleu
  overlayWhite22: "rgba(255,255,255,0.22)",
  overlayWhite20: "rgba(255,255,255,0.2)",
  overlayWhite24: "rgba(255,255,255,0.24)",
  overlayWhite35: "rgba(255,255,255,0.35)",
  overlayWhite55: "rgba(255,255,255,0.55)",

  transparent: "transparent",

  // Header sombre (onglet Profil)
  headerDarkText: "#f1f5f9",
  headerDarkBg: "#0f172a",
  headerDarkBorderBottom: "rgba(255,255,255,0.08)",

  // Profil (thème sombre / glass)
  profileBgOuter: "#071a1c",
  profileBgMid: "#0f2a2e",
  glassBg: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
  glassBgStrong: "rgba(255,255,255,0.06)",
  glassBorderStrong: "rgba(255,255,255,0.1)",
  glassBgSoft: "rgba(255,255,255,0.03)",
  glassBorderSoft: "rgba(255,255,255,0.06)",
  textOnDark: "#ffffff",
  textOnDarkMuted: "rgba(255,255,255,0.4)",
  textOnDarkSubtle: "rgba(255,255,255,0.35)",
  textOnDarkFaint: "rgba(255,255,255,0.25)",
  placeholderDark: "rgba(255,255,255,0.35)",
  slateOnDark: "#e2e8f0",
  slateOnDark90: "rgba(226,232,240,0.9)",
  dangerSoft: "#f87171",
  starFilled: "#EF9F27",
  starEmpty: "rgba(255,255,255,0.2)",
  amberWarningBg: "rgba(251,191,36,0.1)",
  amberWarningBorder: "rgba(251,191,36,0.3)",
  amberText: "#fbbf24",
  amberTextMuted: "rgba(251,191,36,0.75)",
  inputDarkBg: "#0f172a",
  inputDarkBorder: "rgba(255,255,255,0.15)",
  dividerDark: "rgba(255,255,255,0.08)",
  tabReviewBorder: "rgba(255,255,255,0.12)",
  reviewMeta: "rgba(255,255,255,0.45)",
  reviewTitleMuted: "rgba(255,255,255,0.75)",
  sectionLabel: "rgba(255,255,255,0.5)",
  rowBorder: "rgba(255,255,255,0.06)",
  iconMuted: "rgba(255,255,255,0.65)",
  pillBg: "rgba(255,255,255,0.05)",

  // Accents profil alignés avec la marque teal
  accentClientFrom: "#14b8a6",
  accentClientTo: "#0f766e",
  accentClientGlow: "rgba(20,184,166,0.45)",
  accentClientActive: "rgba(20,184,166,0.2)",
  accentClientActiveBorder: "rgba(45,212,191,0.35)",
  accentClientIcon: "#5eead4",
  accentTransporteurFrom: "#7c3aed",
  accentTransporteurTo: "#6d28d9",
  accentTransporteurGlow: "rgba(124,58,237,0.45)",
  accentTransporteurActive: "rgba(124,58,237,0.18)",
  accentTransporteurActiveBorder: "rgba(124,58,237,0.35)",
  accentTransporteurIcon: "#a78bfa",

  // Accents paiement — yellow/orange professionnel
  accentPayment: "#fbbf24",
  accentPaymentDark: "#f59e0b",
  accentPaymentLight: "rgba(251, 191, 36, 0.2)",
  accentPaymentBg: "rgba(251, 191, 36, 0.08)",
  accentPaymentBorder: "rgba(251, 191, 36, 0.3)",
  accentPaymentText: "rgba(251, 191, 36, 0.7)",
  accentPaymentTextMuted: "rgba(251, 191, 36, 0.5)",

  saveGradientStart: "#22c55e",
  saveGradientEnd: "#15803d",
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 22,
  xxxl: 26,
  section: 36,
};

const radius = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  round: 22,
  pill: 999,
};

const shadows = {
  /** Cartes sur fond clair (ClientScreen, KPI…) */
  card: {
    shadowColor: colors.shadowSlate,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 4,
  },
  /** RequestCard, légère */
  cardMedium: {
    shadowColor: colors.shadowSlate,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  /** KPI Home */
  cardSoft: {
    shadowColor: colors.shadowSlate,
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  /** AppButton */
  button: {
    shadowColor: colors.shadowSlate,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 5,
  },
  /** Header stack clair */
  header: {
    shadowColor: colors.cardShadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  /** Header profil sombre */
  headerDark: {
    shadowColor: colors.black,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  /** Welcome carte bas */
  welcomeCard: {
    shadowColor: colors.shadowSlate,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 7,
  },
  /** Login / Register carte formulaire */
  formCard: {
    shadowColor: colors.shadowSlate,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 18,
    elevation: 2,
  },
  /** Avatar anneau dégradé profil */
  avatarRing: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Bouton CTA profil */
  ctaWrap: {
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
  },
};

const gradients = {
  auth: [colors.primaryDark, colors.brandViolet, colors.brandForest],
  hero: [colors.primaryDark, colors.brandViolet, colors.brandForest],
  profileBackground: [colors.profileBgOuter, colors.profileBgMid, colors.profileBgOuter],
  saveButton: [colors.saveGradientStart, colors.saveGradientEnd],
};

const typography = {
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
};

/** Durées / ressorts pour react-native-reanimated */
const motion = {
  springSnappy: { damping: 16, stiffness: 280, mass: 0.8 },
  springSoft: { damping: 18, stiffness: 200, mass: 1 },
  enterDuration: 520,
  stagger: 70,
};

const theme = {
  colors,
  spacing,
  radius,
  shadows,
  gradients,
  typography,
  motion,
};

/** Accents navigation profil selon le rôle */
export function getProfileAccent(isTransporteur) {
  const c = colors;
  return isTransporteur
    ? {
        from: c.accentTransporteurFrom,
        to: c.accentTransporteurTo,
        glow: c.accentTransporteurGlow,
        active: c.accentTransporteurActive,
        activeBorder: c.accentTransporteurActiveBorder,
        icon: c.accentTransporteurIcon,
      }
    : {
        from: c.accentClientFrom,
        to: c.accentClientTo,
        glow: c.accentClientGlow,
        active: c.accentClientActive,
        activeBorder: c.accentClientActiveBorder,
        icon: c.accentClientIcon,
      };
}

export default theme;
