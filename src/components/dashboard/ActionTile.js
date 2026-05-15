import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../utils/theme";

export default function ActionTile({ title, subtitle, icon, color, bgColor, onPress, isLast }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, isLast && styles.tileLast, pressed && styles.tilePressed]}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
    >
      <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.tabInactive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  tilePressed: {
    opacity: 0.72,
  },
  tileLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...theme.typography.cardTitle,
  },
  subtitle: {
    ...theme.typography.cardSubtitle,
  },
});
