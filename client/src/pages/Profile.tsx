import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Share2, MoreVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/profile/:username");
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (currentUser && params?.username) {
      setIsOwnProfile(currentUser.username === params.username || currentUser.name === params.username);
    }
  }, [currentUser, params?.username]);

  if (!match) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <nav className="border-b border-cyan-500/20 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/feed")} className="text-neon-cyan hover:text-neon-magenta transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-neon-white">
            {params?.username}
          </h1>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="container py-8">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-b from-cyan-500/20 to-magenta-500/20 rounded-lg mb-8 border border-cyan-500/20 flex items-center justify-center">
          <span className="text-neon-cyan/50 font-mono text-sm">[ COVER_IMAGE ]</span>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="flex gap-6 items-end">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-cyan-500/30 to-magenta-500/30 border border-cyan-500/30 flex items-center justify-center -mt-16">
              <span className="text-neon-cyan/50 font-mono text-xs">[ AVATAR ]</span>
            </div>

            {/* Profile Info */}
            <div className="pb-2">
              <h2 className="text-3xl font-black text-neon-white mb-2">
                {params?.username}
              </h2>
              <p className="text-neon-cyan/70 font-mono text-sm">
                @{params?.username?.toLowerCase()}
              </p>
              <p className="text-neon-cyan/50 text-sm mt-2">Bio goes here</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOwnProfile ? (
              <>
                <button className="btn-neon text-sm flex items-center gap-2">
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <button className="btn-neon text-sm">Follow</button>
                <button className="btn-neon-magenta text-sm flex items-center gap-2">
                  <Share2 size={16} />
                </button>
              </>
            )}
            <button className="border border-cyan-500/30 text-neon-cyan p-2 hover:bg-cyan-500/10 transition">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="dystopian-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-cyan">0</div>
            <div className="text-xs text-neon-cyan/70 font-mono mt-1">FOLLOWERS</div>
          </div>
          <div className="dystopian-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-magenta">0</div>
            <div className="text-xs text-neon-magenta/70 font-mono mt-1">FOLLOWING</div>
          </div>
          <div className="dystopian-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-white">0</div>
            <div className="text-xs text-neon-cyan/70 font-mono mt-1">POSTS</div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="dystopian-card p-8">
          <h3 className="text-lg font-bold text-neon-white mb-6">
            <span className="bracket-left">POSTS</span>
          </h3>
          <div className="text-center py-12">
            <p className="text-neon-cyan/50 font-mono text-sm">
              &gt; NO_POSTS_FOUND
            </p>
            {isOwnProfile && (
              <button className="btn-neon mt-6 text-sm">
                Create First Post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
