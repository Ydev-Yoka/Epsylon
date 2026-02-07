import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Messages() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/messages/:userId");
  const [message, setMessage] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const isDirectMessage = match && params?.userId;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {isDirectMessage && (
              <button onClick={() => navigate("/messages")} className="text-neon-cyan hover:text-neon-magenta transition">
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-xl font-bold text-neon-white">
              {isDirectMessage ? "Direct Message" : "Messages"}
            </h1>
          </div>
          {!isDirectMessage && (
            <button className="text-neon-cyan hover:text-neon-magenta transition">
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        {!isDirectMessage && (
          <div className="w-full md:w-80 border-r border-cyan-500/20 overflow-y-auto">
            <div className="p-4 space-y-2">
              <div className="text-center py-8">
                <p className="text-neon-cyan/50 font-mono text-sm">
                  &gt; NO_CONVERSATIONS
                </p>
                <p className="text-neon-cyan/30 text-xs mt-2">
                  Start a conversation to begin
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {isDirectMessage ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="text-center py-12">
                  <p className="text-neon-cyan/50 font-mono text-sm">
                    &gt; NO_MESSAGES
                  </p>
                  <p className="text-neon-cyan/30 text-xs mt-2">
                    Start the conversation
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neon-cyan/50 font-mono text-sm">
                  &gt; SELECT_CONVERSATION
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
