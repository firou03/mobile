import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../utils/theme";

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 900,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [opacity]);

  return (
    <LinearGradient colors={theme.gradients.auth} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity }]}>
        <Text style={styles.logo}>🚚</Text>
        <Text style={styles.title}>Transport App</Text>
      </Animated.View>
      <View style={styles.footerDot} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
  },
  logo: {
    fontSize: 68,
    marginBottom: 10,
  },
  title: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: 32,
  },
  footerDot: {
    position: "absolute",
    bottom: 80,
    width: 40,
    height: 6,
    borderRadius: 99,
    backgroundColor: theme.colors.overlayWhite55,
  },
});
