"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { showNotification } = useNotification();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          showNotification('error', 'Lỗi xác thực: ' + error.message);
          router.push('/auth/login');
          return;
        }
 
        if (data.session) {
          showNotification('success', 'Đăng nhập thành công!');
          router.push('/convert');
        } else {
          showNotification('error', 'Không thể xác thực tài khoản');
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Unexpected error during callback:', err);
        showNotification('error', 'Có lỗi xảy ra trong quá trình xác thực.');
        router.push('/auth/login');
      }
    };
 
    handleAuthCallback();
  }, [supabase.auth, router, showNotification]);
 
  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'var(--bg-primary)'
    }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{
          borderColor: 'var(--accent-primary)'
        }}></div>
        <p style={{ color: 'var(--text-primary)' }}>Đang xác thực...</p>
      </div>
    </div>
  );
}
