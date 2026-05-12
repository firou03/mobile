import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../service/restApiNotification";
import theme from "../utils/theme";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notifRes.data || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
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
        <Text style={styles.notificationMessage} numberOfLines={3}>
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
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.auth} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount} non lu{unreadCount !== 1 ? "s" : ""}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllButtonText}>Tout marquer lu</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptySubtitle}>
            Les notifications s'afficheront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1e",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(59,130,246,0.15)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
  },
  markAllButtonText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
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
    gap: 12,
    marginVertical: 2,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
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
});
