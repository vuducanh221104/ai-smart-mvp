"use client";
import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';

interface hCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
}

export interface HCaptchaRef {
  resetCaptcha: () => void;
}

declare global {
  interface Window {
    hcaptcha: any;
  }
}

const HCaptchaComponent = forwardRef<HCaptchaRef, hCaptchaProps>(({ 
  onVerify, 
  onError, 
  onExpire
}, ref) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Load hCaptcha script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?onload=onHcaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;

    // Global callback for when hCaptcha loads
    (window as any).onHcaptchaLoad = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete (window as any).onHcaptchaLoad;
    };
  }, []);

  // Detect current theme from document
  useEffect(() => {
    const detectTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'dark' : 'light');
    };

    // Initial theme detection
    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          detectTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Render hCaptcha widget when loaded
  useEffect(() => {
    if (isLoaded && captchaRef.current && window.hcaptcha) {
      // Clear previous widget if exists
      if (widgetId.current) {
        window.hcaptcha.remove(widgetId.current);
      }

      // Create callback functions
      const handleVerify = (token: string) => {
        setIsVerified(true);
        setToken(token);
        onVerify(token);
      };

      const handleError = (error: any) => {
        setIsVerified(false);
        setToken(null);
        onError?.(error);
      };

      const handleExpire = () => {
        setIsVerified(false);
        setToken(null);
        onExpire?.();
      };

      // Render new widget
      widgetId.current = window.hcaptcha.render(captchaRef.current, {
        sitekey: '4b828452-6cde-4c44-b5f6-4e40df305a62',
        theme: theme,
        callback: handleVerify,
        'error-callback': handleError,
        'expired-callback': handleExpire,
        size: 'normal'
      });
    }

    return () => {
      if (widgetId.current && window.hcaptcha) {
        window.hcaptcha.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [isLoaded, theme, onVerify, onError, onExpire]);

  useImperativeHandle(ref, () => ({
    resetCaptcha: () => {
      if (widgetId.current && window.hcaptcha) {
        window.hcaptcha.reset(widgetId.current);
        setIsVerified(false);
        setToken(null);
      }
    }
  }));

  return (
    <div className="flex justify-center">
      <div 
        ref={captchaRef}
        className="hcaptcha-container"
        style={{
          minHeight: '78px', // Standard hCaptcha height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {!isLoaded && (
          <div className="p-4 border rounded-lg text-center" style={{
            background: 'var(--bg-glass-card)',
            borderColor: 'var(--border-glass)',
            color: 'var(--text-primary)'
          }}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto mb-2" style={{
              borderColor: 'var(--accent-primary)'
            }}></div>
            <p className="text-sm">Loading verification...</p>
          </div>
        )}
        
        {/* Verified indicator overlay */}
        {isVerified && isLoaded && (
          <div 
            className="absolute inset-0 flex items-center justify-center rounded-lg"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

HCaptchaComponent.displayName = 'HCaptchaComponent';

export default HCaptchaComponent;
