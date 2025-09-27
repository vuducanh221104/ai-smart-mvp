"use client";
import { useState, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';
import { MessageCircle, Send, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  is_admin_message: boolean;
  created_at: string;
}

interface ChatRoom {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  messages: Message[];
}

interface UserChatProps {
  userId: string;
}

export default function UserChat({ userId }: UserChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();
  const { showNotification } = useNotification();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRoom = async () => {
    try {
      setLoading(true);
      
      // Get or create chat room (room ID is user ID)
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      
      if (data.room) {
        setRoomId(data.room.id);
        // Fetch messages for this user
        const messagesResponse = await fetch(`/api/chat/messages?user_id=${data.room.id}`);
        const messagesData = await messagesResponse.json();
        if (messagesData.messages) {
          setMessages(messagesData.messages);
        }
      }
    } catch (error) {
      console.error('Error loading chat room:', error);
      showNotification('error', 'Không thể tải phòng chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: userId,
          message: newMessage.trim(),
          is_admin: false
        }),
      });

      const data = await response.json();
      
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      } else if (data.error) {
        showNotification('error', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('error', 'Không thể gửi tin nhắn');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load chat room when chat is opened
  useEffect(() => {
    if (userId && isOpen) {
      loadChatRoom();
    }
  }, [userId, isOpen]);

  // Real-time subscription for messages with fallback polling (only when chat is open)
  useEffect(() => {
    if (!userId || !isOpen) return;

    let channel: any = null;
    let pollInterval: any = null;
    let isRealtimeWorking = false;

    // Try to set up realtime subscription
    try {
      channel = supabase
        .channel(`user_chat_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          (payload: { new: Message }) => {
            isRealtimeWorking = true;
            const newMsg = payload.new;
            setMessages(prev => {
              if (!prev.some(msg => msg.id === newMsg.id)) {
                return [...prev, newMsg];
              }
              return prev;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${userId}`
          },
          (payload: { new: Message }) => {
            isRealtimeWorking = true;
            const newMsg = payload.new;
            setMessages(prev => {
              if (!prev.some(msg => msg.id === newMsg.id)) {
                return [...prev, newMsg];
              }
              return prev;
            });
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            isRealtimeWorking = true;
            console.log('User realtime subscription active');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            isRealtimeWorking = false;
            console.log('User realtime failed, falling back to polling');
          }
        });
    } catch (error) {
      console.error('Realtime subscription error:', error);
      isRealtimeWorking = false;
    }

    // Fallback polling mechanism
    const startPolling = () => {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/chat/messages?user_id=${userId}`);
          const data = await response.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000); // Poll every 3 seconds
    };

    // Start polling if realtime is not working
    if (!isRealtimeWorking) {
      startPolling();
    }

    // Check if realtime is working after 5 seconds
    setTimeout(() => {
      if (!isRealtimeWorking) {
        startPolling();
      }
    }, 5000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [userId, isOpen, supabase]);

  if (!userId) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
        style={{
          background: 'var(--accent-primary)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
        aria-label="Open chat with admin"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 rounded-2xl shadow-2xl flex flex-col"
          style={{
            height: '500px',
            width: '440px',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 8px 32px var(--shadow-glass)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{
            borderColor: 'var(--border-glass)'
          }}>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Chat với Admin
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{
                  borderColor: 'var(--accent-primary)'
                }}></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      message.sender_id === userId
                        ? 'rounded-br-sm'
                        : 'rounded-bl-sm'
                    }`}
                    style={{
                      backgroundColor: message.sender_id === userId 
                        ? 'var(--accent-primary)' 
                        : 'var(--bg-glass-card)',
                      color: message.sender_id === userId 
                        ? 'white' 
                        : 'var(--text-primary)'
                    }}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{
            borderColor: 'var(--border-glass)'
          }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 rounded-lg text-sm border-0 outline-none"
                style={{
                  background: 'var(--bg-glass-card)',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
