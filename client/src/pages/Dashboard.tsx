import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { MessageCircle, Users, Home, Settings, Bell, Search, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();

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
      {/* Navigation Bar */}
      <nav className="border-b border-cyan-500/20 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black text-neon-cyan chromatic">
              epsYlon
            </h1>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate("/feed")} className="text-neon-cyan hover:text-neon-magenta transition flex items-center gap-2">
                <Home size={20} />
                <span className="text-sm font-mono">FEED</span>
              </button>
              <button onClick={() => navigate("/messages")} className="text-neon-cyan hover:text-neon-magenta transition flex items-center gap-2">
                <MessageCircle size={20} />
                <span className="text-sm font-mono">MESSAGES</span>
              </button>
              <button onClick={() => navigate("/search")} className="text-neon-cyan hover:text-neon-magenta transition flex items-center gap-2">
                <Search size={20} />
                <span className="text-sm font-mono">SEARCH</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/notifications")} className="text-neon-cyan hover:text-neon-magenta transition">
              <Bell size={20} />
            </button>
            <button onClick={() => navigate(`/profile/${user.username || user.name}`)} className="text-neon-cyan hover:text-neon-magenta transition">
              <Users size={20} />
            </button>
            <button onClick={() => navigate("/settings")} className="text-neon-cyan hover:text-neon-magenta transition">
              <Settings size={20} />
            </button>
            <button onClick={logout} className="text-neon-magenta hover:text-neon-error transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="md:col-span-2 dystopian-card p-8">
            <h2 className="text-2xl font-bold text-neon-white mb-2">
              Welcome, <span className="text-neon-cyan">{user.name}</span>
            </h2>
            <p className="text-neon-cyan/70 font-mono text-sm mb-6">
              &gt; SYSTEM_STATUS: OPERATIONAL
            </p>
            <button onClick={() => navigate("/feed")} className="btn-neon">
              Enter the Network
            </button>
          </div>

          {/* Stats Card */}
          <div className="dystopian-card p-6">
            <h3 className="text-lg font-bold text-neon-magenta mb-4">
              <span className="bracket-left">STATS</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neon-cyan/70">Followers:</span>
                <span className="text-neon-white font-mono">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neon-cyan/70">Following:</span>
                <span className="text-neon-white font-mono">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neon-cyan/70">Posts:</span>
                <span className="text-neon-white font-mono">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="dystopian-card p-6">
            <h3 className="text-lg font-bold text-neon-cyan mb-4">
              <span className="bracket-left">MESSAGES</span>
            </h3>
            <p className="text-neon-cyan/60 text-sm mb-4">No active conversations</p>
            <button onClick={() => navigate("/messages")} className="btn-neon-magenta text-sm">
              Start Chatting
            </button>
          </div>

          <div className="dystopian-card p-6">
            <h3 className="text-lg font-bold text-neon-magenta mb-4">
              <span className="bracket-left">EXPLORE</span>
            </h3>
            <p className="text-neon-cyan/60 text-sm mb-4">Discover new users and content</p>
            <button onClick={() => navigate("/search")} className="btn-neon text-sm">
              Browse Network
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 dystopian-card p-6">
          <h3 className="text-sm font-mono text-neon-cyan/70 mb-4">
            &gt; SYSTEM_DIAGNOSTICS
          </h3>
          <div className="space-y-2 text-xs font-mono text-neon-cyan/50">
            <p>&gt; DATABASE_CONNECTION: OK</p>
            <p>&gt; API_GATEWAY: OPERATIONAL</p>
            <p>&gt; AUTHENTICATION: VERIFIED</p>
            <p>&gt; ENCRYPTION_STATUS: ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
