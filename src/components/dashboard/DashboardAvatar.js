import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { getInitials } from "../../utils/chatHelpers";
import { getUserProfileImageUri } from "../../utils/userImage";
import theme from "../../utils/theme";

/** Avatar dashboard : photo si disponible, sinon initiales stylisées. */
export default function DashboardAvatar({ user, name, size = 44 }) {
  const displayName = name || user?.name || user?.email || "U";
  const uri = getUserProfileImageUri(user);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(uri));

  useEffect(() => {
    setFailed(false);
    setLoading(Boolean(uri));
  }, [uri]);

  const showImage = Boolean(uri) && !failed;
  const initials = getInitials(displayName);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {showImage ? (
        <>
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            resizeMode="cover"
            onLoad={() => setLoading(false)}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
          />
          {loading ? (
            <View style={[styles.loader, { borderRadius: size / 2 }]}>
              <ActivityIndicator size="small" color={theme.colors.white} />
            </View>
          ) : null}
        </>
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.overlayWhite22,
    borderWidth: 2,
    borderColor: theme.colors.overlayWhite35,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
