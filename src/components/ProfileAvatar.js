import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { getUserProfileImageUri } from "../utils/userImage";
import { getInitials } from "../utils/chatHelpers";
import theme from "../utils/theme";

/**
 * Avatar rond : photo si `user_image` existe et charge, sinon initiales.
 * `localUri` (ex. après ImagePicker) a priorité sur l’URL serveur.
 */
export default function ProfileAvatar({
  user,
  name,
  size = 88,
  localUri = null,
  ringColors,
  style,
}) {
  const displayName = name || user?.name || user?.email || "U";
  const remoteUri = getUserProfileImageUri(user);
  const uri = localUri || remoteUri;

  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(uri));

  useEffect(() => {
    setFailed(false);
    setLoading(Boolean(uri));
  }, [uri]);

  const showImage = Boolean(uri) && !failed;
  const innerSize = size - (ringColors ? 6 : 0);

  const inner = (
    <View
      style={[
        styles.inner,
        {
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
        },
      ]}
    >
      {showImage ? (
        <>
          <Image
            source={{ uri }}
            style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
            resizeMode="cover"
            onLoad={() => setLoading(false)}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
          />
          {loading ? (
            <View style={[styles.loader, { borderRadius: innerSize / 2 }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null}
        </>
      ) : (
        <Text style={[styles.initials, { fontSize: innerSize * 0.36 }]}>{getInitials(displayName)}</Text>
      )}
    </View>
  );

  if (ringColors) {
    return (
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <View style={[styles.ringBorder, { borderRadius: size / 2, borderColor: ringColors[0] }]}>
          {inner}
        </View>
      </View>
    );
  }

  return <View style={style}>{inner}</View>;
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringBorder: {
    padding: 3,
    borderWidth: 3,
    overflow: "hidden",
  },
  inner: {
    backgroundColor: theme.colors.slate900,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "800",
    color: theme.colors.textOnDark,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
});
