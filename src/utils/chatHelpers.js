export function getOtherParticipant(conversation, currentUserId) {
  const participants = conversation?.participants || [];
  return (
    participants.find((p) => String(p?._id || p) !== String(currentUserId)) || {
      name: "Utilisateur",
      email: "",
    }
  );
}

export function getParticipantName(user) {
  if (!user) return "Utilisateur";
  if (typeof user === "string") return "Utilisateur";
  return user.name || user.email || "Utilisateur";
}

export function getInitials(name) {
  const parts = String(name || "U").trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] || "U").toUpperCase();
}

export function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatListTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Maintenant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return date.toLocaleDateString("fr-FR", { weekday: "short" });
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatDateSeparator(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;

  (messages || []).forEach((message) => {
    const dateKey = new Date(message.createdAt).toDateString();
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ type: "date", id: `date-${dateKey}`, label: formatDateSeparator(message.createdAt) });
    }
    groups.push({ type: "message", id: String(message._id), data: message });
  });

  return groups;
}
