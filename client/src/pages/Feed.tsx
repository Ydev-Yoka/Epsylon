import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreVertical, Image as ImageIcon } from "lucide-react";

export default function Feed() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [postContent, setPostContent] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-black text-neon-cyan chromatic">
            epsYlon
          </h1>
          <p className="text-xs text-neon-cyan/50 font-mono">
            &gt; NEURAL_FEED_v7.2
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="dystopian-card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-neon-magenta mb-4">
                <span className="bracket-left">TRENDING</span>
              </h3>
              <div className="space-y-4 text-sm">
                <div className="cursor-pointer hover:bg-cyan-500/10 p-2 rounded transition">
                  <p className="text-neon-cyan font-mono">#SYSTEM_FAILURE</p>
                  <p className="text-neon-cyan/50 text-xs">1.2K posts</p>
                </div>
                <div className="cursor-pointer hover:bg-cyan-500/10 p-2 rounded transition">
                  <p className="text-neon-cyan font-mono">#NEURAL_NETWORK</p>
                  <p className="text-neon-cyan/50 text-xs">892 posts</p>
                </div>
                <div className="cursor-pointer hover:bg-cyan-500/10 p-2 rounded transition">
                  <p className="text-neon-cyan font-mono">#DYSTOPIA</p>
                  <p className="text-neon-cyan/50 text-xs">654 posts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="lg:col-span-2">
            {/* Create Post */}
            <div className="dystopian-card p-6 mb-6">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-500/30 to-magenta-500/30 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-neon-cyan/50 text-xs font-mono">A</span>
                </div>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's happening in the system?"
                  className="input-dystopian flex-1 p-3 text-sm resize-none"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="text-neon-cyan hover:text-neon-magenta transition p-2">
                    <ImageIcon size={18} />
                  </button>
                </div>
                <button className="btn-neon text-sm">
                  Transmit
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {/* Empty State */}
              <div className="dystopian-card p-12 text-center">
                <p className="text-neon-cyan/50 font-mono text-sm mb-2">
                  &gt; FEED_EMPTY
                </p>
                <p className="text-neon-cyan/30 text-xs">
                  Follow users to see their posts in your feed
                </p>
                <button className="btn-neon mt-6 text-sm">
                  Discover Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
