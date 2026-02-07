import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Users, AtSign, Trash2 } from "lucide-react";

export default function Notifications() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<"all" | "likes" | "comments" | "follows" | "messages">("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-neon-cyan font-mono">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const notifications: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-neon-cyan hover:text-neon-magenta transition">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-neon-white">
              <span className="bracket-left">NOTIFICATIONS</span>
            </h1>
          </div>
          {notifications.length > 0 && (
            <button className="text-neon-magenta hover:text-neon-error transition text-sm font-mono">
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {["all", "likes", "comments", "follows", "messages"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-sm font-mono transition whitespace-nowrap ${
                  filter === f
                    ? "btn-neon"
                    : "border border-cyan-500/30 text-neon-cyan/70 hover:text-neon-cyan"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="dystopian-card p-12 text-center">
                <p className="text-neon-cyan/50 font-mono text-sm mb-2">
                  &gt; NO_NOTIFICATIONS
                </p>
                <p className="text-neon-cyan/30 text-xs">
                  You're all caught up with the network
                </p>
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div key={idx} className="dystopian-card p-4 flex items-center justify-between hover:bg-cyan-500/10 transition cursor-pointer">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500/30 to-magenta-500/30 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                      <Heart size={16} className="text-neon-cyan" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neon-white font-mono">Someone liked your post</p>
                      <p className="text-xs text-neon-cyan/50">2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-neon-magenta/50 hover:text-neon-magenta transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Notification Types Info */}
          <div className="mt-12 dystopian-card p-6">
            <h3 className="text-lg font-bold text-neon-magenta mb-4">
              <span className="bracket-left">NOTIFICATION_TYPES</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Heart size={16} className="text-neon-cyan mt-1 flex-shrink-0" />
                <div>
                  <p className="text-neon-white font-mono">Likes</p>
                  <p className="text-neon-cyan/50 text-xs">When someone likes your post</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-neon-cyan mt-1 flex-shrink-0" />
                <div>
                  <p className="text-neon-white font-mono">Comments</p>
                  <p className="text-neon-cyan/50 text-xs">When someone comments on your post</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={16} className="text-neon-cyan mt-1 flex-shrink-0" />
                <div>
                  <p className="text-neon-white font-mono">Follows</p>
                  <p className="text-neon-cyan/50 text-xs">When someone follows you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-neon-cyan mt-1 flex-shrink-0" />
                <div>
                  <p className="text-neon-white font-mono">Messages</p>
                  <p className="text-neon-cyan/50 text-xs">When you receive a direct message</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
