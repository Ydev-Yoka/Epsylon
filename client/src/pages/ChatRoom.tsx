import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Users, Settings } from "lucide-react";

export default function ChatRoom() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/chat/:roomId");
  const [message, setMessage] = useState("");

  if (!match) {
    return null;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-neon-cyan hover:text-neon-magenta transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-neon-white">
                Channel #{params?.roomId}
              </h1>
              <p className="text-xs text-neon-cyan/50 font-mono">
                &gt; MEMBERS: 0
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-neon-cyan hover:text-neon-magenta transition">
              <Users size={20} />
            </button>
            <button className="text-neon-cyan hover:text-neon-magenta transition">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <p className="text-neon-cyan/50 font-mono text-sm">
            &gt; NO_MESSAGES_IN_CHANNEL
          </p>
          <p className="text-neon-cyan/30 text-xs mt-2">
            Be the first to send a message
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-cyan-500/20 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-dystopian flex-1 px-4 py-2 text-sm"
          />
          <button className="btn-neon p-2">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
