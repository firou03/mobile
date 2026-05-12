/**
 * Tokens globaux — couleurs, espacements, rayons, ombres, dégradés.
 * Utiliser theme.colors.* / theme.spacing.* / theme.shadows.* / theme.gradients.*
 */

const colors = {
  // Marque — teal profond + highlight cyan (distinct du précédent sky-blue)
  primary: "#0d9488",
  primaryBright: "#22d3ee",
  primaryDark: "#0f766e",
  primaryLight: "#ccfbf1",
  secondary: "#059669",
  secondaryLight: "#d1fae5",
  danger: "#e11d48",
  dangerLight: "#ffe4e9",
  warning: "#d97706",
  warningLight: "#fef3c7",

  // Neutres — fond plus doux, texte plus contrasté
  background: "#eef2f8",
  surface: "#f8fafc",
  white: "#ffffff",
  black: "#000000",
  border: "#d6dee9",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#7c8ea3",
  tabInactive: "#8b9caf",

  // Slate / en-têtes sombres
  slate900: "#0f172a",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",

  /** Ombre cartes — légère teinte teal foncée (plus lisible sur fond #eef2f8) */
  cardShadow: "rgba(13, 67, 78, 0.12)",
  shadowSlate: "#134e4a",

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
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 26,
  round: 21,
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
  auth: [colors.primary, colors.primaryBright],
  profileBackground: [colors.profileBgOuter, colors.profileBgMid, colors.profileBgOuter],
  saveButton: [colors.saveGradientStart, colors.saveGradientEnd],
};

const theme = {
  colors,
  spacing,
  radius,
  shadows,
  gradients,
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
