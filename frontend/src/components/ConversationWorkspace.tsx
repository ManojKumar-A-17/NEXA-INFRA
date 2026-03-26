import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { workflowApi, type WorkflowConversation } from "@/services/workflowApi";

interface ConversationWorkspaceProps {
  title: string;
  description: string;
  emptyLabel: string;
  role: "user" | "contractor";
}

const getComparableId = (value: unknown) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "_id" in value) {
    const nestedId = (value as { _id?: unknown })._id;
    return typeof nestedId === "string" ? nestedId : "";
  }

  return "";
};

const getMessageParticipantRole = (
  conversation: WorkflowConversation,
  senderId: unknown
) => {
  const normalizedSenderId = getComparableId(senderId);
  const userId = getComparableId(conversation.userId?._id);
  const contractorUserId = getComparableId(conversation.contractorId?.userId?._id);

  if (normalizedSenderId === userId) {
    return "user" as const;
  }

  if (normalizedSenderId === contractorUserId) {
    return "contractor" as const;
  }

  return null;
};

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const ConversationWorkspace = ({
  title,
  description,
  emptyLabel,
  role,
}: ConversationWorkspaceProps) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<WorkflowConversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestedConversationId = searchParams.get("conversation");

  const loadConversations = async (preferredConversationId?: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const items = await workflowApi.getConversations();
      setConversations(items);

      const nextSelectedId =
        (preferredConversationId && items.find((item) => item._id === preferredConversationId)?._id) ||
        items[0]?._id ||
        "";

      setSelectedId(nextSelectedId);

      if (nextSelectedId) {
        const updated = await workflowApi.markConversationRead(nextSelectedId);
        setConversations((current) =>
          current.map((conversation) => (conversation._id === nextSelectedId ? updated : conversation))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConversations(requestedConversationId);
  }, [requestedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedId) || null,
    [conversations, selectedId]
  );

  const getUnreadCount = (conversation: WorkflowConversation) =>
    role === "user" ? conversation.unreadCount.user : conversation.unreadCount.contractor;

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedId(conversationId);

    try {
      const updated = await workflowApi.markConversationRead(conversationId);
      setConversations((current) =>
        current.map((conversation) => (conversation._id === conversationId ? updated : conversation))
      );
    } catch {
      // Keep the chat usable even if the read-sync fails.
    }
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!selectedConversation || !trimmed) {
      return;
    }

    try {
      setSending(true);
      const updated = await workflowApi.sendMessage(selectedConversation._id, trimmed);
      setConversations((current) =>
        current.map((conversation) => (conversation._id === selectedConversation._id ? updated : conversation))
      );
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => void loadConversations(selectedId)}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex min-h-[520px] gap-4">
        <div className="hidden w-80 shrink-0 overflow-auto rounded-lg border border-border bg-card md:block">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">{emptyLabel}</div>
          ) : (
            conversations.map((conversation) => {
              const name =
                role === "user"
                  ? conversation.contractorId.company || conversation.contractorId.userId?.name || "Contractor"
                  : conversation.userId.name;
              const unread = getUnreadCount(conversation);

              return (
                <button
                  key={conversation._id}
                  onClick={() => void handleSelectConversation(conversation._id)}
                  className={`w-full border-b border-border p-4 text-left transition-colors ${
                    selectedId === conversation._id ? "bg-secondary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {conversation.projectId?.title || "Direct conversation"}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs text-secondary-foreground">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {conversation.lastMessage || "No messages yet"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="flex flex-1 flex-col rounded-lg border border-border bg-card">
          {!selectedConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10" />
              <p>{emptyLabel}</p>
            </div>
          ) : (
            <>
              <div className="border-b border-border p-4">
                <p className="font-medium text-foreground">
                  {role === "user"
                    ? selectedConversation.contractorId.company ||
                      selectedConversation.contractorId.userId?.name ||
                      "Contractor"
                    : selectedConversation.userId.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.projectId?.title || "Project conversation"}
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-auto p-4">
                {selectedConversation.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Start the conversation to discuss requirements, scope, and timelines.
                  </p>
                ) : (
                  selectedConversation.messages.map((item, index) => {
                    const messageRole = getMessageParticipantRole(selectedConversation, item.senderId);
                    const isOwnMessage = messageRole === role;
                    const senderLabel = isOwnMessage
                      ? "You"
                      : role === "user"
                        ? selectedConversation.contractorId.company ||
                          selectedConversation.contractorId.userId?.name ||
                          "Contractor"
                        : selectedConversation.userId.name || "Client";

                    return (
                      <div
                        key={`${item.timestamp}-${index}`}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-2.5 shadow-sm ${
                            isOwnMessage
                              ? "rounded-2xl rounded-br-md bg-secondary text-secondary-foreground"
                              : "rounded-2xl rounded-bl-md border border-border/60 bg-muted text-foreground"
                          }`}
                        >
                          <p
                            className={`mb-1 text-[11px] font-medium ${
                              isOwnMessage
                                ? "text-right text-secondary-foreground/80"
                                : "text-left text-muted-foreground"
                            }`}
                          >
                            {senderLabel}
                          </p>
                          <p className="text-sm">{item.message}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              isOwnMessage
                                ? "text-right text-secondary-foreground/75"
                                : "text-left text-muted-foreground"
                            }`}
                          >
                            {formatTimestamp(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={sending || message.trim().length === 0}
                    onClick={() => void handleSendMessage()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
