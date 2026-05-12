import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";
import theme from "../utils/theme";

const variantStyles = {
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    textColor: theme.colors.white,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
    textColor: theme.colors.white,
  },
  danger: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
    textColor: theme.colors.white,
  },
  outline: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.primary,
    textColor: theme.colors.primary,
  },
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) {
  const current = variantStyles[variant] || variantStyles.primary;
  const isDisabled = disabled || loading;

  const handlePress = async () => {
    if (isDisabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: current.backgroundColor, borderColor: current.borderColor },
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={current.textColor} />
      ) : (
        <Text style={[styles.label, { color: current.textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    ...theme.shadows.button,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.65,
  },
});
