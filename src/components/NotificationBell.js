import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getUnreadCount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../service/restApiNotification";
import { isNetworkFailure } from "../service/apiClient";
import { AuthContext } from "../context/AuthContext";
import theme from "../utils/theme";

export default function NotificationBell({ onNotificationPress }) {
  const { token } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return undefined;
    }

    const fetchUnreadCount = async () => {
      const stored = await AsyncStorage.getItem("token");
      if (!stored) return;
      try {
        const response = await getUnreadCount();
        setUnreadCount(response.data?.count || 0);
      } catch (error) {
        if (__DEV__ && isNetworkFailure(error)) {
          console.warn(
            "Notifications: serveur injoignable. Demarrez le backend (port 5000) et verifiez EXPO_PUBLIC_API_URL."
          );
        }
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleBellPress = async () => {
    setModalVisible(true);
    setLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id, isRead) => {
    if (!isRead) {
      try {
        await markNotificationRead(id);
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error.message);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error.message);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      const response = await getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error("Error deleting notification:", error.message);
    }
  };

  const getNotificationDotColor = (type) => {
    const colors = {
      request_accepted: "#97c459",
      new_request: "#60a5fa",
      request_cancelled: "#f09595",
      new_review: "#EF9F27",
    };
    return colors[type] || "#94a3b8";
  };

  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const date = new Date(createdAt);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    return `il y a ${diffDays}j`;
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMarkRead(item._id, item.isRead)}
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.isRead ? "transparent" : "rgba(59,130,246,0.08)",
          borderLeftColor: item.isRead ? "transparent" : "#3b82f6",
        },
      ]}
    >
      <View
        style={[
          styles.dotIndicator,
          { backgroundColor: getNotificationDotColor(item.type) },
        ]}
      />

      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            { color: item.isRead ? "#94a3b8" : "#e2e8f0", fontWeight: item.isRead ? "400" : "600" },
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteNotification(item._id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Bell Button */}
      <TouchableOpacity
        onPress={handleBellPress}
        style={[
          styles.bellButton,
          { borderColor: unreadCount > 0 ? "#60a5fa" : "rgba(96,165,250,0.4)" },
        ]}
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={styles.markAllReadButton}>Tout marquer lu</Text>
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucune notification</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item._id}
                scrollEnabled
                contentContainerStyle={styles.listContent}
              />
            )}

            {/* Footer */}
            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => {
                setModalVisible(false);
                onNotificationPress?.();
              }}
            >
              <Text style={styles.footerLinkText}>Voir toutes les notifications</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.15)",
    borderWidth: 1.5,
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0a0f1e",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#161b27",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f1f5f9",
  },
  markAllReadButton: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 2,
    alignItems: "flex-start",
    gap: 10,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 11,
    color: "#64748b",
  },
  deleteButton: {
    padding: 4,
    marginTop: 2,
  },
  deleteButtonText: {
    fontSize: 18,
    color: "#94a3b8",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  footerLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
  },
  footerLinkText: {
    fontSize: 12,
    color: "#3b82f6",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 10,
    margin: 16,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
});
