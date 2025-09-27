"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Github } from "lucide-react";
import { useState, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";
import HCaptchaComponent, { HCaptchaRef } from "@/components/hCaptcha/hCaptcha";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef<HCaptchaRef>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { showNotification } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCaptchaError("");

    if (!captchaToken) {
      setCaptchaError("Vui lòng xác thực captcha");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: captchaToken
        }
      });

      if (error) {
        setError(error.message);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      } else {
        showNotification('success', 'Đăng nhập thành công!');
        router.push("/convert");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        setError(`Lỗi đăng nhập ${provider}: ${error.message}`);
        setLoading(false);
      } else {
        // OAuth redirect will happen automatically
        showNotification('info', `Đang chuyển hướng đến ${provider}...`);
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setError("Có lỗi xảy ra khi đăng nhập");
      setLoading(false);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setCaptchaError("");
  };

  const handleCaptchaError = (error: any) => {
    setCaptchaError("Lỗi xác thực captcha");
    setCaptchaToken(null);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
    setCaptchaError("Captcha đã hết hạn, vui lòng thử lại");
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12  s5.373-12,12-12c3.059,0,5.842,1.156,7.957,3.043l5.657-5.657C33.64,6.053,29.084,4,24,4C12.955,4,4,12.955,4,24  s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.156,7.957,3.043l5.657-5.657  C33.64,6.053,29.084,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.191-5.238C29.122,35.091,26.689,36,24,36  c-5.202,0-9.62-3.314-11.282-7.946l-6.522,5.024C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.236-2.231,4.166-3.894,5.565  c0.001-0.001,0.002-0.001,0.003-0.002l6.191,5.238C36.94,39.281,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#1877F2"/>
      <path d="M13.5 8.5h2V6h-2c-1.657 0-3 1.343-3 3v2.25H8.5V13H10.5V18h2.25v-5h2l.25-1.75h-2.25V9c0-.276.224-.5.5-.5z" fill="#fff"/>
    </svg>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-16 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-[94%] max-w-2xl rounded-[28px] border border-white/30 bg-white/10 backdrop-blur-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-8 sm:p-12" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}>
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white"></div>
            </div>
            <div className="text-3xl sm:text-[34px] leading-tight font-extrabold text-[var(--text-primary)]">
              iAI Smart
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-6">Login</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="username@gmail.com" 
              className="bg-white/90" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="bg-white/90 pr-12" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="#" className="text-[var(--text-primary)]/90 hover:text-[var(--text-primary)] font-medium">
              Forgot Password?
            </Link>
          </div>

          <div className="space-y-3">
            <HCaptchaComponent
              ref={captchaRef}
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              onExpire={handleCaptchaExpire}
            />
            {captchaError && (
              <p className="text-red-500 text-sm text-center">{captchaError}</p>
            )}
          </div>

          <Button 
            type="submit"
            disabled={loading || !captchaToken}
            className="mt-2 h-12 w-full rounded-xl bg-[#0d3b62] hover:bg-[#0b3152] text-white text-lg font-semibold shadow disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8">
          <div className="text-center text-[var(--text-primary)]/90 mb-4">or continue with</div>
          <div className="flex justify-center gap-3">
            <button 
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="h-16 w-16 rounded-xl bg-white hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-50"
            >
              <GoogleIcon />
              <span className="sr-only">Sign in with Google</span>
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="h-16 w-16 rounded-xl bg-white hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-50"
            >
              <Github className="h-6 w-6 text-black dark:text-black" />
              <span className="sr-only">Sign in with GitHub</span>
            </button>
            <button 
              type="button"
              disabled={loading}
              className="h-16 w-16 rounded-xl bg-white hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-50"
            >
              <FacebookIcon />
              <span className="sr-only">Sign in with Facebook</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-[var(--text-primary)]/90">
          Don’t have an account yet? {" "}
          <Link href="/auth/register" className="font-semibold underline underline-offset-4">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  );
}

