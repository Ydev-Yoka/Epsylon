import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-neon-cyan mb-4 glitch" data-text="INITIALIZING...">
            INITIALIZING...
          </div>
          <div className="text-sm text-neon-cyan/70 error-code">
            &gt; SYSTEM_BOOT_SEQUENCE_IN_PROGRESS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-neon-white mb-2 chromatic">
            epsYlon
          </h1>
          <p className="text-sm text-neon-cyan/70 font-mono tracking-widest">
            [ SYSTEM FAILURE IMMINENT ]
          </p>
          <p className="text-xs text-neon-magenta/50 font-mono mt-2">
            &gt; NEURAL_NETWORK_INTERFACE_v7.2
          </p>
        </div>

        {/* Login Card */}
        <div className="dystopian-card p-8 mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neon-white mb-2">
                <span className="bracket-left">ACCESS</span>
                <span className="bracket-right">GRANTED</span>
              </h2>
              <p className="text-sm text-neon-cyan/60 font-mono">
                Enter the system to connect with others in the digital void
              </p>
            </div>

            {/* Login Button */}
            <a href={getLoginUrl()} className="block">
              <button className="btn-neon w-full">
                Authenticate via Manus
              </button>
            </a>

            {/* Error Codes */}
            <div className="border-t border-cyan-500/20 pt-6 space-y-2">
              <p className="text-xs text-neon-cyan/50 font-mono">
                &gt; STATUS: AWAITING_CREDENTIALS
              </p>
              <p className="text-xs text-neon-cyan/50 font-mono">
                &gt; ENCRYPTION: AES-256_ACTIVE
              </p>
              <p className="text-xs text-neon-cyan/50 font-mono">
                &gt; THREAT_LEVEL: MINIMAL
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-neon-magenta/40 font-mono">
            [ SECURE_CONNECTION_ESTABLISHED ]
          </p>
          <p className="text-xs text-neon-cyan/30 font-mono">
            © 2026 epsYlon Network | All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
