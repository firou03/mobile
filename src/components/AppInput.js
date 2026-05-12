import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import theme from "../utils/theme";

export default function AppInput({
  icon,
  label,
  error,
  style,
  containerStyle,
  ...props
}) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error ? styles.inputError : null, style]}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.input}
          {...props}
        />
      </View>
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
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    marginTop: 6,
    fontSize: 12,
  },
});
