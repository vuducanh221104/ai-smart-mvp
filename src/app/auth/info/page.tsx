"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Save, ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useNotification } from "@/contexts/NotificationContext";
import Link from "next/link";

export default function UserInfoPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { showNotification } = useNotification();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        router.push('/auth/login');
        return;
      }
      
      if (user) {
        setUser(user);
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "");
      }
    };

    getUser();
  }, [supabase.auth, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName
        }
      });

      if (error) {
        setError(error.message);
        showNotification('error', `Lỗi cập nhật: ${error.message}`);
      } else {
        setSuccess("Profile updated successfully!");
        showNotification('success', 'Cập nhật thông tin thành công!');
      }
    } catch (err) {
      setError("An unexpected error occurred");
      showNotification('error', 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--bg-primary)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[var(--text-primary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'var(--bg-primary)'
    }}>
      <div className="relative w-[100%] max-w-2xl rounded-[28px] p-8 sm:p-12" style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 8px 32px var(--shadow-glass)'
      }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-2">
            User Information
          </h1>
          <p className="text-[var(--text-primary)]/70">
            Update your profile information
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/convert"
            className="inline-flex items-center text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Converter
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[var(--text-primary)] font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-primary)]/50" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 border-white/20 focus:border-blue-500/50"
                style={{ 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-glass-card)'
                }}
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--text-primary)] font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-primary)]/50" />
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="pl-10 border-white/20 cursor-not-allowed"
                style={{ 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-glass-card)',
                  opacity: 0.7
                }}
              />
            </div>
            <p className="text-xs text-[var(--text-primary)]/50">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg border" style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.2)'
            }}>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 rounded-lg border" style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 0.2)'
            }}>
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#0d3b62] hover:bg-[#0b3152] text-white text-lg font-semibold shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Profile
              </>
            )}
          </Button>
        </form>

        {/* User Info Display */}
        <div className="mt-8 p-4 rounded-lg border" style={{
          backgroundColor: 'var(--bg-glass-card)',
          borderColor: 'var(--border-glass)'
        }}>
          <h3 className="text-[var(--text-primary)] font-medium mb-3">Current Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">User ID:</span>
              <span className="text-[var(--text-primary)] font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Email:</span>
              <span className="text-[var(--text-primary)]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Created:</span>
              <span className="text-[var(--text-primary)]">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Last Sign In:</span>
              <span className="text-[var(--text-primary)]">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
