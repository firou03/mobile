import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";
import theme from "../utils/theme";

export default function DrawerMenuButton({ navigation, variant = "default" }) {
  const isDark = variant === "dark";

  const openDrawer = () => {
    const drawerNav = navigation.getParent?.("Drawer") ?? navigation;
    if (typeof drawerNav?.openDrawer === "function") {
      drawerNav.openDrawer();
    } else if (typeof navigation.openDrawer === "function") {
      navigation.openDrawer();
    }
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openDrawer();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.button, isDark ? styles.buttonDark : null]}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir le menu"
    >
      <Text style={[styles.icon, isDark ? styles.iconDark : null]}>☰</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  buttonDark: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  icon: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.primary,
    marginTop: -2,
  },
  iconDark: {
    color: theme.colors.white,
  },
});
