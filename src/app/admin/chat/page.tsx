"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, MessageCircle, User, Clock, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  admin_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  messages: Message[];
}

export default function AdminChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { showNotification } = useNotification();

  const loadChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/rooms?is_admin=true');
      const data = await response.json();
      
      if (data.rooms) {
        setRooms(data.rooms);
        // Only auto-select first room if no room is currently selected
        setSelectedRoom(prev => {
          if (!prev && data.rooms.length > 0) {
            return data.rooms[0];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      showNotification('error', 'Không thể tải danh sách chat');
    } finally {
      setLoading(false);
    }
  }, [showNotification]); // Removed selectedRoom dependency to avoid loop

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      // Check if user is admin
      const userRole = user.role;
      const userType = user.user_metadata?.user_type;
      const isAdmin = userRole === 'admin' || userType === 'admin';
      
      if (!isAdmin) {
        showNotification('error', 'Bạn không có quyền truy cập trang này');
        router.push('/convert');
        return;
      }

      setUser(user);
      loadChatRooms();
    };

    checkAdmin();
  }, [loadChatRooms, router, showNotification, supabase.auth]); // Include all dependencies

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: selectedRoom.id,
          message: newMessage.trim(),
          is_admin: true
        }),
      });

      const data = await response.json();
      
      if (data.message) {
        setSelectedRoom(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), data.message]
        } : null);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Đang mở';
      case 'closed':
        return 'Đã đóng';
      case 'resolved':
        return 'Đã giải quyết';
      default:
        return 'Không xác định';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'closed':
        return 'destructive';
      case 'resolved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Load history and subscribe to both directions for selected user with fallback
  useEffect(() => {
    if (!selectedRoom?.id) return;
    
    let channels: any[] = [];
    let pollInterval: any = null;
    let isRealtimeWorking = false;

    const load = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/messages?user_id=${selectedRoom.id}`);
        const data = await res.json();
        setSelectedRoom(prev => prev ? { ...prev, messages: data.messages || [] } : null);
      } catch (e) {
        console.error('Error loading messages:', e);
      } finally {
        setLoadingMessages(false);
      }

      // Try to set up realtime subscriptions
      try {
        const chIn = supabase
          .channel(`admin_in_${selectedRoom.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${selectedRoom.id}` }, (payload: { new: Message }) => {
            isRealtimeWorking = true;
            const msg = payload.new as Message;
            setSelectedRoom(prev => prev ? ({ ...prev, messages: (prev.messages || []).some(m => m.id === msg.id) ? prev.messages : [...prev.messages, msg] }) : null);
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              isRealtimeWorking = true;
              console.log('Admin realtime subscription active');
            }
          });
        channels.push(chIn);

        const chOut = supabase
          .channel(`admin_out_${selectedRoom.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${selectedRoom.id}` }, (payload: { new: Message }) => {
            isRealtimeWorking = true;
            const msg = payload.new as Message;
            setSelectedRoom(prev => prev ? ({ ...prev, messages: (prev.messages || []).some(m => m.id === msg.id) ? prev.messages : [...prev.messages, msg] }) : null);
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              isRealtimeWorking = true;
              console.log('Admin realtime subscription active');
            }
          });
        channels.push(chOut);
      } catch (error) {
        console.error('Realtime subscription error:', error);
        isRealtimeWorking = false;
      }

      // Fallback polling mechanism
      const startPolling = () => {
        pollInterval = setInterval(async () => {
          try {
            const res = await fetch(`/api/chat/messages?user_id=${selectedRoom.id}`);
            const data = await res.json();
            if (data.messages) {
              setSelectedRoom(prev => prev ? { ...prev, messages: data.messages || [] } : null);
            }
          } catch (error) {
            console.error('Admin polling error:', error);
          }
        }, 2000); // Poll every 2 seconds for admin
      };

      // Start polling if realtime is not working
      if (!isRealtimeWorking) {
        startPolling();
      }

      // Check if realtime is working after 3 seconds
      setTimeout(() => {
        if (!isRealtimeWorking) {
          startPolling();
        }
      }, 3000);
    };
    
    load();
    return () => { 
      channels.forEach(ch => supabase.removeChannel(ch));
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [selectedRoom?.id, supabase]); // Only depend on selectedRoom.id, not the whole object


  useEffect(() => {
    if (selectedRoom?.messages) {
      scrollToBottom();
    }
  }, [selectedRoom?.messages]); // Only depend on messages, not the whole selectedRoom object

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const refreshRooms = useCallback(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  const filteredRooms = rooms.filter(room => 
    room.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--bg-primary)'
      }}>
        <Card className="w-96" style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 8px 32px var(--shadow-glass)'
        }}>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{
              borderColor: 'var(--accent-primary)'
            }}></div>
            <p style={{ color: 'var(--text-primary)' }}>Đang tải...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'var(--bg-primary)',
      marginTop: '150px'
    }}>
      <div className="container mx-auto p-4 h-screen">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Sidebar */}
          <div className="col-span-4">
            <Card className="h-full" style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-glass)',
              boxShadow: '0 8px 32px var(--shadow-glass)'
            }}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      Admin Chat
                    </h1>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshRooms}
                    disabled={loading}
                    className="h-8 w-8 p-0"
                    style={{
                      borderColor: 'var(--border-glass)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Quản lý tin nhắn từ người dùng
                </p>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    style={{
                      backgroundColor: 'var(--bg-glass-card)',
                      borderColor: 'var(--border-glass)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {filteredRooms.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredRooms.map((room) => (
                        <Card
                          key={room.id}
                          className="cursor-pointer transition-all duration-200 hover:shadow-md"
                          style={{
                            background: selectedRoom?.id === room.id 
                              ? 'var(--accent-glass)' 
                              : 'var(--bg-glass-card)',
                            border: '1px solid var(--border-glass)',
                            boxShadow: selectedRoom?.id === room.id 
                              ? '0 0 0 2px var(--accent-primary)' 
                              : '0 2px 8px var(--shadow-secondary)'
                          }}
                          onClick={() => {
                            // Only set selected room, messages will be loaded by useEffect
                            setSelectedRoom(room);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                                  background: 'var(--accent-glass)'
                                }}>
                                  <User className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div>
                                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {room.user_email || 'Người dùng'}
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {room.user_name || 'Không có tên'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={getStatusVariant(room.status)} className="text-xs">
                                {getStatusText(room.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <span>{formatDate(room.created_at)}</span>
                              {room.messages && room.messages.length > 0 && (
                                <span className="px-2 py-1 rounded-full" style={{
                                  background: 'var(--accent-glass)',
                                  color: 'var(--accent-primary)'
                                }}>
                                  {room.messages.length}
                                </span>
                              )}
                            </div>
                            {room.messages && room.messages.length > 0 && (
                              <p className="text-xs mt-2 truncate" style={{ color: 'var(--text-secondary)' }}>
                                {room.messages[room.messages.length - 1]?.content}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="col-span-8">
            <Card className="h-full flex flex-col" style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-glass)',
              boxShadow: '0 8px 32px var(--shadow-glass)'
            }}>
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b" style={{
                    borderColor: 'var(--border-glass)'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                          background: 'var(--accent-glass)'
                        }}>
                          <User className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div>
                          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {selectedRoom.user_email || 'Người dùng'}
                          </h2>
                          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <Badge variant={getStatusVariant(selectedRoom.status)} className="text-xs">
                              {getStatusText(selectedRoom.status)}
                            </Badge>
                            <span>•</span>
                            <span>Tạo lúc: {formatDate(selectedRoom.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="p-4">
                        {loadingMessages ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{
                                borderColor: 'var(--accent-primary)'
                              }}></div>
                              <p style={{ color: 'var(--text-secondary)' }}>Đang tải tin nhắn...</p>
                            </div>
                          </div>
                        ) : selectedRoom.messages && selectedRoom.messages.length > 0 ? (
                          <div className="space-y-4">
                            {selectedRoom.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.is_admin_message ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className="max-w-xs px-4 py-3 rounded-2xl shadow-sm"
                                  style={{
                                    background: message.is_admin_message 
                                      ? 'var(--accent-primary)' 
                                      : 'var(--bg-glass-card)',
                                    color: message.is_admin_message 
                                      ? 'white' 
                                      : 'var(--text-primary)',
                                    border: '1px solid var(--border-glass)'
                                  }}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p className="text-xs mt-1" style={{
                                    color: message.is_admin_message 
                                      ? 'rgba(255, 255, 255, 0.7)' 
                                      : 'var(--text-secondary)'
                                  }}>
                                    {formatTime(message.created_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Chưa có tin nhắn nào
                              </h3>
                              <p style={{ color: 'var(--text-secondary)' }}>
                                Bắt đầu cuộc trò chuyện với người dùng này
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Input */}
                  <div className="p-4 border-t" style={{
                    borderColor: 'var(--border-glass)'
                  }}>
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1"
                        style={{
                          backgroundColor: 'var(--bg-glass-card)',
                          borderColor: 'var(--border-glass)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'white'
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Gửi
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Chọn một cuộc trò chuyện
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}