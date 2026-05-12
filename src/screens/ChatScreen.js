import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { AuthContext } from "../context/AuthContext";
import {
  getConversations,
  getMessages,
  markMessagesAsRead,
  sendMessage,
} from "../service/restApiChat";
import theme from "../utils/theme";

function toast(msg) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else console.log(msg);
}

/** Logique équivalente à ChatComponent/React : liste + salon actif avec envoi `{ content }`. */
export default function ChatScreen() {
  const { user } = useContext(AuthContext);
  const userId = useMemo(() => String(user?._id || ""), [user]);

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgBusy, setMsgBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast("Impossible de charger les conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = async (conv) => {
    setSelected(conv);
    setLoadingMsgs(true);
    try {
      const res = await getMessages(conv._id);
      setMessages(Array.isArray(res.data) ? res.data : []);
      await markMessagesAsRead(conv._id).catch(() => {});
    } catch {
      toast("Impossible de charger les messages");
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const otherName = useCallback(
    (conv) => {
      const p = (conv.participants || []).find((x) => String(x?._id) !== userId);
      return p?.name || p?.email || "Participant";
    },
    [userId]
  );

  const submit = async () => {
    if (!selected?._id || !draft.trim() || msgBusy) return;
    setMsgBusy(true);
    try {
      await sendMessage(selected._id, { content: draft.trim() });
      setDraft("");
      const res = await getMessages(selected._id);
      setMessages(Array.isArray(res.data) ? res.data : []);
      loadConversations();
    } catch {
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
        <Text style={styles.header}>Messagerie</Text>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listPad}
          ListEmptyComponent={<Text style={styles.empty}>Aucune conversation. Créez-en depuis une demande sur le web.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => openConversation(item)}>
              <Text style={styles.rowTitle}>{otherName(item)}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {item.lastMessage?.content || "—"}
              </Text>
            </Pressable>
          )}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <Pressable onPress={() => setSelected(null)} style={styles.backRow}>
        <Text style={styles.back}>← Conversations</Text>
      </Pressable>
      <Text style={styles.header}>{otherName(selected)}</Text>
      {loadingMsgs ? (
        <ActivityIndicator style={{ marginVertical: 20 }} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(m) => String(m._id)}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => {
            const mine = String(item.senderId?._id || item.senderId) === userId;
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                {!mine ? <Text style={styles.sender}>{item.senderId?.name || "?"}</Text> : null}
                <Text style={styles.msgText}>{item.content}</Text>
              </View>
            );
          }}
        />
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={theme.colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          editable={!msgBusy}
        />
        <Pressable onPress={submit} disabled={msgBusy || !draft.trim()} style={styles.sendBtn}>
          <Text style={styles.sendLbl}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background },
  header: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  listPad: { paddingHorizontal: 12, paddingBottom: 24 },
  row: {
    backgroundColor: theme.colors.white,
    padding: 14,
    marginBottom: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowTitle: { fontWeight: "700", fontSize: 15, color: theme.colors.textPrimary },
  rowSub: { color: theme.colors.textSecondary, marginTop: 4, fontSize: 13 },
  empty: {
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 24,
  },
  backRow: { paddingHorizontal: 16, paddingTop: 8 },
  back: { color: theme.colors.primary, fontWeight: "700", fontSize: 14 },
  messages: { paddingHorizontal: 12, paddingBottom: 8 },
  bubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: theme.radius.sm,
    marginBottom: 8,
  },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: theme.colors.primaryLight },
  bubbleOther: { alignSelf: "flex-start", backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.border },
  sender: { fontSize: 11, color: theme.colors.primary, marginBottom: 4, fontWeight: "600" },
  msgText: { color: theme.colors.textPrimary, fontSize: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.textPrimary,
  },
  sendBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: theme.radius.sm, backgroundColor: theme.colors.primary },
  sendLbl: { color: theme.colors.white, fontWeight: "700", fontSize: 13 },
});
