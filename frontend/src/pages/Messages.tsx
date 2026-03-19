import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  contractorId: string;
  contractorName: string;
  messages: Message[];
  createdAt: string;
}

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    try {
      const conversationsData = localStorage.getItem("conversations");
      const allConversations: Conversation[] = conversationsData ? JSON.parse(conversationsData) : [];
      
      // Filter conversations relevant to the current user
      const userConversations = allConversations.filter(
        c => c.userId === user?.id || c.contractorId === user?.id
      );

      setConversations(userConversations);
      if (userConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(userConversations[0]);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    try {
      const conversationsData = localStorage.getItem("conversations");
      const allConversations: Conversation[] = conversationsData ? JSON.parse(conversationsData) : [];

      const updatedConversations = allConversations.map(c => {
        if (c.id === selectedConversation.id) {
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                id: `msg-${Date.now()}`,
                sender: user.id,
                senderName: user.name || user.email || "User",
                text: messageText,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return c;
      });

      localStorage.setItem("conversations", JSON.stringify(updatedConversations));
      
      // Update selected conversation
      const updated = updatedConversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }

      setMessageText("");
      loadConversations(); // Refresh the list
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Please login to view messages</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Conversations List */}
          <div className="md:col-span-1 bg-card rounded-lg border border-border p-4 h-96 overflow-y-auto">
            <h2 className="font-bold mb-4">Conversations</h2>
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    <p className="font-medium text-sm truncate">
                      {user.id === conv.userId ? conv.contractorName : conv.userName}
                    </p>
                    <p className="text-xs text-muted truncate">Project: {conv.projectId}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-card rounded-lg border border-border p-4 flex flex-col h-96">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="border-b border-border pb-4 mb-4">
                  <h3 className="font-bold">
                    {user.id === selectedConversation.userId
                      ? selectedConversation.contractorName
                      : selectedConversation.userName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Project ID: {selectedConversation.projectId}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    selectedConversation.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === user.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">{msg.senderName}</p>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
