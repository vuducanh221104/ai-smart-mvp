"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function CreateAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { showNotification } = useNotification();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Admin user created successfully!');
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        setError(data.error || 'Failed to create admin user');
        showNotification('error', data.error || 'Failed to create admin user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
            Create Admin User
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Create a new admin user account
          </p>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[var(--text-primary)] font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 border-white/20 focus:border-blue-500/50"
                style={{ 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-glass-card)'
                }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--text-primary)] font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-white/20 focus:border-blue-500/50"
                style={{ 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-glass-card)'
                }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[var(--text-primary)] font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-white/20 focus:border-blue-500/50"
                style={{ 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-glass-card)'
                }}
                required
                minLength={6}
              />
            </div>
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

          {/* Submit Button */}
          <Button 
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl text-lg font-semibold shadow disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Admin...
              </>
            ) : (
              "Create Admin User"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
