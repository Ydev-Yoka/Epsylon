import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Lock, Eye, Trash2 } from "lucide-react";

export default function Settings() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("account");

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
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/dashboard")} className="text-neon-cyan hover:text-neon-magenta transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-neon-white">
            <span className="bracket-left">SETTINGS</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="dystopian-card p-4 space-y-2">
              <button
                onClick={() => setActiveTab("account")}
                className={`w-full text-left px-4 py-2 text-sm font-mono transition ${
                  activeTab === "account"
                    ? "bg-cyan-500/20 text-neon-cyan border-l-2 border-neon-cyan"
                    : "text-neon-cyan/70 hover:text-neon-cyan"
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`w-full text-left px-4 py-2 text-sm font-mono transition ${
                  activeTab === "privacy"
                    ? "bg-cyan-500/20 text-neon-cyan border-l-2 border-neon-cyan"
                    : "text-neon-cyan/70 hover:text-neon-cyan"
                }`}
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-4 py-2 text-sm font-mono transition ${
                  activeTab === "notifications"
                    ? "bg-cyan-500/20 text-neon-cyan border-l-2 border-neon-cyan"
                    : "text-neon-cyan/70 hover:text-neon-cyan"
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-2 text-sm font-mono transition ${
                  activeTab === "security"
                    ? "bg-cyan-500/20 text-neon-cyan border-l-2 border-neon-cyan"
                    : "text-neon-cyan/70 hover:text-neon-cyan"
                }`}
              >
                Security
              </button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="dystopian-card p-6">
                  <h2 className="text-lg font-bold text-neon-white mb-4">
                    Account Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neon-cyan/70 font-mono mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={user.username || user.name || ""}
                        disabled
                        className="input-dystopian w-full px-4 py-2 text-sm disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neon-cyan/70 font-mono mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="input-dystopian w-full px-4 py-2 text-sm disabled:opacity-50"
                      />
                    </div>
                    <button className="btn-neon text-sm">
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="dystopian-card p-6 border-destructive/50">
                  <h2 className="text-lg font-bold text-neon-error mb-4">
                    Danger Zone
                  </h2>
                  <button onClick={logout} className="btn-neon-magenta text-sm flex items-center gap-2">
                    <Trash2 size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="dystopian-card p-6">
                <h2 className="text-lg font-bold text-neon-white mb-4">
                  Privacy Controls
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-cyan-500/20 rounded">
                    <div className="flex items-center gap-3">
                      <Eye size={18} className="text-neon-cyan" />
                      <div>
                        <p className="text-sm font-mono text-neon-white">Private Account</p>
                        <p className="text-xs text-neon-cyan/50">Only approved followers can see your posts</p>
                      </div>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-cyan-500/20 rounded">
                    <div className="flex items-center gap-3">
                      <Eye size={18} className="text-neon-cyan" />
                      <div>
                        <p className="text-sm font-mono text-neon-white">Hide Online Status</p>
                        <p className="text-xs text-neon-cyan/50">Others won't see when you're active</p>
                      </div>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="dystopian-card p-6">
                <h2 className="text-lg font-bold text-neon-white mb-4">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Messages", desc: "Get notified when you receive a message" },
                    { label: "Likes", desc: "Get notified when someone likes your post" },
                    { label: "Comments", desc: "Get notified when someone comments on your post" },
                    { label: "Follows", desc: "Get notified when someone follows you" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 border border-cyan-500/20 rounded">
                      <div className="flex items-center gap-3">
                        <Bell size={18} className="text-neon-cyan" />
                        <div>
                          <p className="text-sm font-mono text-neon-white">{item.label}</p>
                          <p className="text-xs text-neon-cyan/50">{item.desc}</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="dystopian-card p-6">
                <h2 className="text-lg font-bold text-neon-white mb-4">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border border-cyan-500/20 rounded">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock size={18} className="text-neon-cyan" />
                      <div>
                        <p className="text-sm font-mono text-neon-white">Two-Factor Authentication</p>
                        <p className="text-xs text-neon-cyan/50">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button className="btn-neon text-sm">
                      Enable 2FA
                    </button>
                  </div>
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded">
                    <p className="text-xs text-neon-cyan/70 font-mono">
                      &gt; ENCRYPTION: AES-256_ACTIVE<br/>
                      &gt; SESSION_TIMEOUT: 30_MINUTES<br/>
                      &gt; LAST_LOGIN: CURRENT_SESSION
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
