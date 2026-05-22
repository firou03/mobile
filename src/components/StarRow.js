import React from "react";
import { StyleSheet, Text, View } from "react-native";
import theme from "../utils/theme";

export default function StarRow({ value = 0, size = 14, emptyColor }) {
  const v = Math.round(Number(value) || 0);
  const empty = emptyColor || theme.colors.textMuted;
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text
          key={s}
          style={{ fontSize: size, color: s <= v ? theme.colors.starFilled : empty }}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
});
