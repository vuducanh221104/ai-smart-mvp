"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, X, XCircle } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
  duration?: number; // in ms, default 4000
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  onClose,
  duration = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(34, 197, 94, 0.1)';
      case 'error':
        return 'rgba(239, 68, 68, 0.1)';
      case 'info':
        return 'rgba(59, 130, 246, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(34, 197, 94, 0.2)';
      case 'error':
        return 'rgba(239, 68, 68, 0.2)';
      case 'info':
        return 'rgba(59, 130, 246, 0.2)';
      default:
        return 'rgba(107, 114, 128, 0.2)';
    }
  };

  return (
    <div
      className={`notification-item ${type} ${isExiting ? 'slide-out' : 'slide-in'}`}
      style={{
        background: getBgColor(),
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: `1px solid ${getBorderColor()}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        color: 'var(--text-primary)',
        padding: '12px 16px',
        borderRadius: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
        opacity: isExiting ? 0 : 1,
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <span className="font-medium text-sm">{message}</span>
      </div>
      <button 
        onClick={handleClose} 
        className="close-button flex-shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
      </button>
    </div>
  );
};

export default Notification;
