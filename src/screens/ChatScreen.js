import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import ChatAvatar from "../components/chat/ChatAvatar";
import DrawerMenuButton from "../components/DrawerMenuButton";
import {
  getConversations,
  getMessages,
  markMessagesAsRead,
  sendMessage,
} from "../service/restApiChat";
import {
  formatListTime,
  formatMessageTime,
  getOtherParticipant,
  getParticipantName,
  groupMessagesByDate,
} from "../utils/chatHelpers";
import theme from "../utils/theme";

function toast(msg) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

function DateSeparator({ label }) {
  return (
    <View style={styles.dateWrap}>
      <View style={styles.datePill}>
        <Text style={styles.dateText}>{label}</Text>
      </View>
    </View>
  );
}

function MessageBubble({ item, isMine }) {
  return (
    <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowOther]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : null]}>{item.content}</Text>
        <Text style={[styles.bubbleTime, isMine ? styles.bubbleTimeMine : null]}>
          {formatMessageTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const userId = useMemo(() => String(user?._id || ""), [user]);
  const listRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgBusy, setMsgBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const otherUser = useMemo(
    () => (selected ? getOtherParticipant(selected, userId) : null),
    [selected, userId]
  );
  const otherName = getParticipantName(otherUser);

  const loadConversations = useCallback(async (silent = false) => {
    try {
      const res = await getConversations();
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch {
      if (!silent) toast("Impossible de charger les conversations");
      if (!silent) setConversations([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId, silent = false) => {
      try {
        const res = await getMessages(conversationId);
        const next = Array.isArray(res.data) ? res.data : [];
        setMessages((prev) => {
          if (silent && JSON.stringify(prev) === JSON.stringify(next)) return prev;
          return next;
        });
        await markMessagesAsRead(conversationId).catch(() => {});
      } catch {
        if (!silent) toast("Impossible de charger les messages");
        if (!silent) setMessages([]);
      }
    },
    []
  );

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(true), 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!selected?._id) return undefined;
    let active = true;
    setLoadingMsgs(true);
    loadMessages(selected._id).finally(() => {
      if (active) setLoadingMsgs(false);
    });
    const interval = setInterval(() => loadMessages(selected._id, true), 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selected?._id, loadMessages]);

  useLayoutEffect(() => {
    if (selected) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerTitleRow}>
            <ChatAvatar user={otherUser} size={32} />
            <View>
              <Text style={styles.headerName} numberOfLines={1}>
                {otherName}
              </Text>
              <Text style={styles.headerSub}>Messagerie</Text>
            </View>
          </View>
        ),
        headerLeft: () => (
          <Pressable onPress={() => setSelected(null)} style={styles.headerBack} hitSlop={8}>
            <Text style={styles.headerBackIcon}>‹</Text>
          </Pressable>
        ),
      });
    } else {
      navigation.setOptions({
        headerTitle: () => <Text style={styles.headerPlain}>Messagerie</Text>,
        headerLeft: () => <DrawerMenuButton navigation={navigation} />,
      });
    }
  }, [navigation, selected, otherUser, otherName]);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const other = getOtherParticipant(conv, userId);
      const name = getParticipantName(other).toLowerCase();
      const preview = (conv.lastMessage?.content || "").toLowerCase();
      return name.includes(q) || preview.includes(q);
    });
  }, [conversations, search, userId]);

  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

  const openConversation = (conv) => {
    setSelected(conv);
    setDraft("");
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    if (!loadingMsgs && messages.length) scrollToEnd();
  }, [messages, loadingMsgs]);

  const submit = async () => {
    if (!selected?._id || !draft.trim() || msgBusy) return;
    const text = draft.trim();
    setMsgBusy(true);
    setDraft("");
    try {
      const res = await sendMessage(selected._id, { content: text });
      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);
      } else {
        await loadMessages(selected._id, true);
      }
      loadConversations(true);
      scrollToEnd();
    } catch {
      setDraft(text);
      toast("Envoi impossible");
    } finally {
      setMsgBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!selected) {
    return (
      <View style={styles.flex}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            filteredConversations.length === 0 && styles.listEmpty,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Aucune conversation</Text>
              <Text style={styles.emptyText}>
                {search
                  ? "Aucun resultat pour votre recherche."
                  : "Les discussions liees a vos demandes apparaitront ici."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const other = getOtherParticipant(item, userId);
            const name = getParticipantName(other);
            const unread = item.unreadCount > 0;
            return (
              <Pressable
                style={({ pressed }) => [styles.convRow, pressed && styles.convRowPressed]}
                onPress={() => openConversation(item)}
              >
                <ChatAvatar user={other} size={52} />
                <View style={styles.convBody}>
                  <View style={styles.convTop}>
                    <Text style={[styles.convName, unread && styles.convNameUnread]} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.convTime}>
                      {item.lastMessage?.createdAt ? formatListTime(item.lastMessage.createdAt) : ""}
                    </Text>
                  </View>
                  <View style={styles.convBottom}>
                    <Text
                      style={[styles.convPreview, unread && styles.convPreviewUnread]}
                      numberOfLines={1}
                    >
                      {item.lastMessage?.content || "Nouvelle conversation"}
                    </Text>
                    {unread ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {item.unreadCount > 9 ? "9+" : item.unreadCount}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View style={styles.threadBg}>
        {loadingMsgs ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messageGroups}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={scrollToEnd}
            renderItem={({ item }) => {
              if (item.type === "date") {
                return <DateSeparator label={item.label} />;
              }
              const msg = item.data;
              const mine =
                String(msg.senderId?._id || msg.senderId) === userId;
              return <MessageBubble item={msg} isMine={mine} />;
            }}
            ListEmptyComponent={
              <View style={styles.threadEmpty}>
                <Text style={styles.threadEmptyText}>Envoyez le premier message</Text>
              </View>
            }
          />
        )}
      </View>

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.composerInner}>
          <TextInput
            style={styles.composerInput}
            placeholder="Ecrire un message..."
            placeholderTextColor={theme.colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            editable={!msgBusy}
            multiline
            maxLength={2000}
          />
          <Pressable
            onPress={submit}
            disabled={msgBusy || !draft.trim()}
            style={[styles.sendFab, (!draft.trim() || msgBusy) && styles.sendFabDisabled]}
          >
            {msgBusy ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.sendFabIcon}>➤</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  threadBg: {
    flex: 1,
    backgroundColor: "#e8ecf4",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8, opacity: 0.5 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  listContent: { paddingBottom: 24 },
  listEmpty: { flexGrow: 1, justifyContent: "center" },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginLeft: 80,
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
  },
  convRowPressed: { backgroundColor: theme.colors.primaryLight },
  convBody: { flex: 1, marginLeft: 12, minWidth: 0 },
  convTop: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  convName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  convNameUnread: { fontWeight: "800" },
  convTime: { fontSize: 12, color: theme.colors.textMuted, marginLeft: 8 },
  convBottom: { flexDirection: "row", alignItems: "center" },
  convPreview: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  convPreviewUnread: { color: theme.colors.textPrimary, fontWeight: "600" },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: { color: theme.colors.white, fontSize: 11, fontWeight: "800" },
  emptyBox: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.textPrimary },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  headerPlain: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: 220,
  },
  headerName: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  headerBack: {
    marginLeft: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackIcon: {
    fontSize: 32,
    fontWeight: "300",
    color: theme.colors.primary,
    marginTop: -4,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  dateWrap: { alignItems: "center", marginVertical: 14 },
  datePill: {
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  bubbleRow: { marginBottom: 6, maxWidth: "82%" },
  bubbleRowMine: { alignSelf: "flex-end" },
  bubbleRowOther: { alignSelf: "flex-start" },
  bubble: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 4,
    ...theme.shadows.cardSoft,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.textPrimary,
  },
  bubbleTextMine: { color: theme.colors.white },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
    color: theme.colors.textMuted,
  },
  bubbleTimeMine: { color: "rgba(255,255,255,0.75)" },
  threadEmpty: { alignItems: "center", paddingTop: 40 },
  threadEmptyText: { color: theme.colors.textMuted, fontSize: 14 },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  composerInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  composerInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  sendFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendFabDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.7,
  },
  sendFabIcon: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 2,
  },
});
