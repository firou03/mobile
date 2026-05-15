import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import theme from "../../utils/theme";
import { getInitials } from "../../utils/chatHelpers";
import { getUserProfileImageUri } from "../../utils/userImage";

export default function ChatAvatar({ user, size = 48, style }) {
  const name = typeof user === "object" ? user?.name || user?.email : "";
  const uri = typeof user === "object" ? getUserProfileImageUri(user) : null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const showImage = Boolean(uri) && !failed;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
});
