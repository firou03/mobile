import React, { useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import theme from "../utils/theme";

const BORDER_DEFAULT = theme.colors.border;
const BORDER_FOCUS = theme.colors.primary;
const BG_DEFAULT = theme.colors.surface;
const BG_FOCUS = theme.colors.primaryLight;
const BORDER_ERR = theme.colors.danger;

export default function AppInput({
  icon,
  label,
  error,
  style,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) {
  const focusProgress = useSharedValue(0);
  const errorActive = useSharedValue(0);

  useEffect(() => {
    errorActive.value = error ? 1 : 0;
  }, [error, errorActive]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor =
      errorActive.value > 0.5
        ? BORDER_ERR
        : interpolateColor(focusProgress.value, [0, 1], [BORDER_DEFAULT, BORDER_FOCUS]);
    const backgroundColor =
      errorActive.value > 0.5 ? BG_DEFAULT : interpolateColor(focusProgress.value, [0, 1], [BG_DEFAULT, BG_FOCUS]);
    return { borderColor, backgroundColor };
  });

  const handleFocus = (e) => {
    focusProgress.value = withTiming(1, { duration: 180 });
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    focusProgress.value = withTiming(0, { duration: 220 });
    onBlur?.(e);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View
        style={[styles.inputContainer, animatedContainerStyle, style]}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 12,
  },
  errorText: {
    color: theme.colors.danger,
    marginTop: 6,
    fontSize: 12,
  },
});
