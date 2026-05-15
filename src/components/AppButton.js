import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import theme from "../utils/theme";

const spring = theme.motion.springSnappy;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    if (isDisabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        if (!isDisabled) scale.value = withSpring(0.96, spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring);
      }}
      style={[animatedStyle, styles.pressableOuter]}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: current.backgroundColor, borderColor: current.borderColor },
          isDisabled ? styles.disabled : null,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={current.textColor} />
        ) : (
          <Text style={[styles.label, { color: current.textColor }]}>{title}</Text>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressableOuter: {
    alignSelf: "stretch",
  },
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
  disabled: {
    opacity: 0.65,
  },
});
