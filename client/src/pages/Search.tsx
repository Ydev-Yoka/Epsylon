import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Users, FileText, ArrowRight } from "lucide-react";

export default function Search() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"users" | "posts">("users");

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
        <div className="container h-16 flex items-center">
          <h1 className="text-xl font-bold text-neon-white">
            <span className="bracket-left">SEARCH</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="dystopian-card p-6 mb-8">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 text-neon-cyan/50" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, posts, hashtags..."
                  className="input-dystopian w-full pl-10 pr-4 py-2 text-sm"
                />
              </div>
            </div>

            {/* Search Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType("users")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-mono transition ${
                  searchType === "users"
                    ? "btn-neon"
                    : "border border-cyan-500/30 text-neon-cyan/70 hover:text-neon-cyan"
                }`}
              >
                <Users size={16} />
                Users
              </button>
              <button
                onClick={() => setSearchType("posts")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-mono transition ${
                  searchType === "posts"
                    ? "btn-neon"
                    : "border border-cyan-500/30 text-neon-cyan/70 hover:text-neon-cyan"
                }`}
              >
                <FileText size={16} />
                Posts
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {!query ? (
              <div className="dystopian-card p-12 text-center">
                <p className="text-neon-cyan/50 font-mono text-sm mb-2">
                  &gt; ENTER_SEARCH_QUERY
                </p>
                <p className="text-neon-cyan/30 text-xs">
                  Search for users or posts to explore the network
                </p>
              </div>
            ) : (
              <div className="dystopian-card p-12 text-center">
                <p className="text-neon-cyan/50 font-mono text-sm mb-2">
                  &gt; NO_RESULTS_FOUND
                </p>
                <p className="text-neon-cyan/30 text-xs">
                  Try a different search query
                </p>
              </div>
            )}
          </div>

          {/* Trending Section */}
          <div className="mt-12">
            <h2 className="text-lg font-bold text-neon-magenta mb-6">
              <span className="bracket-left">TRENDING_NOW</span>
            </h2>
            <div className="space-y-3">
              {["#SYSTEM_FAILURE", "#NEURAL_NETWORK", "#DYSTOPIA", "#DIGITAL_VOID"].map((tag) => (
                <div
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="dystopian-card p-4 cursor-pointer hover:bg-cyan-500/10 transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-neon-cyan font-mono font-bold">{tag}</p>
                    <p className="text-neon-cyan/50 text-xs">1.2K posts</p>
                  </div>
                  <ArrowRight size={16} className="text-neon-magenta" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
