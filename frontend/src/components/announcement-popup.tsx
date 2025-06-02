"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Show popup after 3 seconds, but only if user is not logged in
    if (!user) {
      const timer = setTimeout(() => {
        const hasSeenPopup = localStorage.getItem("luciq-announcement-seen");
        if (!hasSeenPopup) {
          setIsOpen(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("luciq-announcement-seen", "true");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate email submission (replace with actual API call)
    try {
      // await fetch('/api/newsletter', { ... })
      console.log("Email submitted:", email);
      
      // Mark as seen and close
      handleClose();
      
      // Show success message (could be a toast)
      alert("Thanks for subscribing! We'll keep you updated on Luciq AI's latest features.");
    } catch (error) {
      console.error("Email submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignup = () => {
    handleClose();
    router.push("/auth");
  };

  if (!isOpen || user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-[#0a0a1f] border border-teal-400/30 rounded-xl p-6 shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              🚀 Luciq AI is Here!
            </h3>
            <p className="text-white/70 text-sm">
              Be the first to know about new features, updates, and exclusive early access opportunities.
            </p>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="mb-4">
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-teal-400/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-400 to-purple-500 hover:opacity-90 text-white font-medium rounded-lg"
            >
              {isSubmitting ? "Subscribing..." : "Get Updates"}
            </Button>
          </form>

          {/* OR divider */}
          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-3 text-white/50 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* OAuth signup */}
          <Button
            onClick={handleOAuthSignup}
            variant="outline"
            className="w-full border-teal-400/30 text-white hover:bg-teal-400/10 rounded-lg"
          >
            Sign Up with OAuth
          </Button>

          {/* Footer text */}
          <p className="text-xs text-white/40 text-center mt-4">
            No spam, unsubscribe at any time. Privacy policy applies.
          </p>
        </div>
      </div>
    </div>
  );
} 