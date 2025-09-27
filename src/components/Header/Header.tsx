'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { MenuProps } from 'antd';
import {
  AudioOutlined,
  VideoCameraOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileZipOutlined,
  BarChartOutlined,
  FontSizeOutlined,
  BookOutlined,
  DownOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { Button } from "@/components/ui/button"
import { Download, CheckCircle, Menu, X, Info, Sun, Moon, ChevronDown, Music, Video, Image, FileText, Archive, BarChart3, Type, BookOpen, File, User, LogOut, MessageCircle, Volume2, Brain, Shapes } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";

import './Header.scss';


export default function Header() {
    const observerRef = useRef<IntersectionObserver | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [selectedSocial, setSelectedSocial] = useState<string>("facebook")
    const [activeImage, setActiveImage] = useState<string>("/facebook-social-media-background.png")
    const [isLanguageOpen, setIsLanguageOpen] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState<"vi" | "en">("vi")
    const [isConvertOpen, setIsConvertOpen] = useState(false)
    const [isAiToolsOpen, setIsAiToolsOpen] = useState(false)
    const [isUserOpen, setIsUserOpen] = useState(false)
    const [isUserClicked, setIsUserClicked] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = getSupabaseClient()
    const { showNotification } = useNotification()

    // Check user session on mount
    useEffect(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
      }
      getUser()

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }, [supabase.auth])

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (!target.closest('.convert-dropdown') && !target.closest('.ai-tools-dropdown') && !target.closest('.language-dropdown') && !target.closest('.user-dropdown')) {
          setIsConvertOpen(false)
          setIsAiToolsOpen(false)
          setIsLanguageOpen(false)
          setIsUserOpen(false)
          setIsUserClicked(false)
        }
      }

      // Use click event instead of mousedown to avoid conflicts
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }, [])

    const handleLogout = async () => {
      await supabase.auth.signOut()
      showNotification('success', 'Đăng xuất thành công!')
      router.push('/')
    }
  
    const socialMediaData = [
      {
        id: "facebook",
        name: "Facebook",
        icon: "f",
        color: "#1877F2",
        image: "/facebook-social-media-background.png",
      },
      {
        id: "messenger",
        name: "Messenger",
        icon: "M",
        color: "linear-gradient(135deg, #FF006E, #8A2BE2)",
        image: "/messenger-background-new.jpeg",
      },
      {
        id: "telegram",
        name: "Telegram",
        icon: "T",
        color: "#0088CC",
        image: "/telegram-background-new.png",
      },
      {
        id: "zalo",
        name: "Zalo",
        icon: "Z",
        color: "#0068FF",
        image: "/zalo-background-new.webp",
      },
    ]
  
    const handleSocialClick = (social: (typeof socialMediaData)[0]) => {
      setSelectedSocial(social.id)
      setActiveImage(social.image)
    }
  
    const games = [
      {
        id: 1,
        title: "Liên Quân Mobile",
        subtitle: "Hack Map",
        description: "",
        image: "/generic-mobile-game-icon.png",
        verified: true,
        date: "16/8/2025",
        downloadUrl: "#",
      },
      {
        id: 2,
        title: "Liên Quân Mobile",
        subtitle: "Mod Skin",
        description: "",
        image: "/generic-mobile-game-icon.png",
        verified: true,
        date: "16/8/2025",
        downloadUrl: "#",
      },
      {
        id: 3,
        title: "Free Fire",
        subtitle: "Hack Menu",
        description: "Menu hack mới nhất với nhiều tính năng hỗ trợ game thủ",
        image: "/images/free-fire-icon.png",
        verified: true,
        date: "15/8/2025",
        downloadUrl: "#",
      },
      {
        id: 4,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 5,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 6,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 7,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 8,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 9,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 10,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 11,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
      {
        id: 12,
        title: "PUBG Mobile",
        subtitle: "ESP Hack",
        description: "ESP hack an toàn với chế độ ẩn danh và chống phát hiện",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
    ]
  
    const premiumApps = [
      {
        id: 1,
        title: "Liên Quân Mobile",
        subtitle: "Premium Hack",
        description: "Phiên bản premium với tính năng cao cấp và hỗ trợ 24/7",
        image: "/generic-mobile-game-icon.png",
        verified: true,
        date: "16/8/2025",
        downloadUrl: "#",
      },
      {
        id: 2,
        title: "Free Fire",
        subtitle: "VIP Menu",
        description: "Menu VIP với tính năng độc quyền và cập nhật liên tục",
        image: "/images/free-fire-icon.png",
        verified: true,
        date: "15/8/2025",
        downloadUrl: "#",
      },
      {
        id: 3,
        title: "PUBG Mobile",
        subtitle: "Pro ESP",
        description: "ESP chuyên nghiệp với độ chính xác cao và an toàn tuyệt đối",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
    ]
  
    const esignFreeApps = [
      {
        id: 1,
        title: "Liên Quân Mobile",
        subtitle: "Free Hack",
        description: "Phiên bản miễn phí với tính năng cơ bản và cập nhật thường xuyên",
        image: "/generic-mobile-game-icon.png",
        verified: true,
        date: "16/8/2025",
        downloadUrl: "#",
      },
      {
        id: 2,
        title: "Free Fire",
        subtitle: "Basic Menu",
        description: "Menu cơ bản với các tính năng thiết yếu cho game thủ",
        image: "/images/free-fire-icon.png",
        verified: true,
        date: "15/8/2025",
        downloadUrl: "#",
      },
      {
        id: 3,
        title: "PUBG Mobile",
        subtitle: "Standard ESP",
        description: "ESP chuẩn với độ chính xác tốt và hoàn toàn miễn phí",
        image: "/generic-battle-royale-icon.png",
        verified: true,
        date: "14/8/2025",
        downloadUrl: "#",
      },
    ]
  
    useEffect(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("slide-in-visible")
            } else {
              entry.target.classList.remove("slide-in-visible")
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        },
      )
  
      const cards = document.querySelectorAll(".game-card")
      const downloadsSection = document.querySelector(".important-downloads")
      const downloadItems = document.querySelectorAll(".important-downloads .fade-slide-up")
      const socialSection = document.querySelector(".social-media-section")
      const premiumSection = document.querySelector(".premium-apps-section")
      const esignFreeSection = document.querySelector(".esign-free-section")
  
      cards.forEach((card) => {
        if (observerRef.current) {
          observerRef.current.observe(card)
        }
      })
  
      if (downloadsSection && observerRef.current) {
        observerRef.current.observe(downloadsSection)
      }
  
      downloadItems.forEach((item) => {
        if (observerRef.current) {
          observerRef.current.observe(item)
        }
      })
  
      if (socialSection && observerRef.current) {
        observerRef.current.observe(socialSection)
      }
  
      if (premiumSection && observerRef.current) {
        observerRef.current.observe(premiumSection)
      }
  
      if (esignFreeSection && observerRef.current) {
        observerRef.current.observe(esignFreeSection)
      }
  
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }, [])
  
    const languages = [
      { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
      { code: "en", name: "English", flag: "🇺🇸" },
    ]
  
    const handleLanguageSelect = (langCode: "vi" | "en") => {
      setSelectedLanguage(langCode)
      setIsLanguageOpen(false)
    }
  
    const menuItems = [
      { id: 5, name: "Pricing", href: "/pricing" },
    ]

    const convertOptions = [
      {
        id: 1,
        name: "Image Converter",
        icon: Image,
        href: "/convert?type=image-converter", 
        description: "60+ image formats"
      },
      {
        id: 2,
        name: "Document Converter",
        icon: FileText,
        href: "/convert?type=document-converter",
        description: "18+ document formats"
      },
      {
        id: 3,
        name: "Vector Converter",
        icon: Shapes,
        href: "/convert?type=vector-converter",
        description: "11+ vector formats"
      },
      {
        id: 4,
        name: "Audio Converter",
        icon: Music,
        href: "/convert?type=audio-converter",
        description: "Convert audio files"
      },
      {
        id: 5,
        name: "Video Converter", 
        icon: Video,
        href: "/convert?type=video-converter",
        description: "Convert video files"
      },
      {
        id: 6,
        name: "Archive Converter",
        icon: Archive,
        href: "/convert?type=archive-converter",
        description: "Convert archive files"
      },
      {
        id: 7,
        name: "Presentation Converter",
        icon: BarChart3,
        href: "/convert?type=presentation-converter",
        description: "Convert presentation files"
      },
      {
        id: 8,
        name: "Font Converter",
        icon: Type,
        href: "/convert?type=font-converter",
        description: "Convert font files"
      },
      {
        id: 9,
        name: "Ebook Converter",
        icon: BookOpen,
        href: "/convert?type=ebook-converter",
        description: "Convert ebook files"
      }
    ]

    const aiToolsOptions = [
      {
        id: 1,
        name: "AI Voice",
        icon: Volume2,
        href: "/textToSpeech",
        description: "Text to Speech AI"
      },
      {
        id: 2,
        name: "AI Flashcard",
        icon: Brain,
        href: "/flashCard/create",
        description: "Generate flashcards with AI"
      }
    ]

  return (
    <header
    style={{ borderRadius: "50px" ,marginTop:"30px"}}
    className="fixed glass-header top-4 left-5 right-5 py-5 md:top-2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-[1000px] z-50 border border-border/20"
  >
    <div className="flex items-center justify-between h-12 sm:px-6 sm:h-16 border-0 px-4">
      {/* Navigation Menu - Left side */}
      <nav className="hidden md:flex items-center gap-8">
        {/* Convert Dropdown */}
        <div className="relative convert-dropdown">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsConvertOpen(!isConvertOpen)
            }}
            className="flex items-center gap-2 hover:text-[var(--text-secondary)] transition-colors group text-[var(--text-primary)]"
            style={{fontSize: "20px", fontWeight: "600"}}
          >
            Convert
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 text-[var(--text-primary)] ${isConvertOpen ? 'rotate-180' : ''}`} />
          </button>

          {isConvertOpen && (
            <div className="absolute top-full left-0 mt-4  glass-card-language border border-border/20 rounded-2xl p-4 shadow-xl z-50" style={{width: "600px"}}>
              <div className="grid grid-cols-2 gap-3">
                {convertOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <Link
                      key={option.id}
                      href={option.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                      onClick={() => setIsConvertOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-white group-hover:text-white/90 transition-colors">
                          {option.name}
                        </div>
                        <div className="text-sm text-white/70 group-hover:text-white/80 transition-colors">
                          {option.description}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Tools Dropdown */}
        <div className="relative ai-tools-dropdown">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsAiToolsOpen(!isAiToolsOpen)
            }}
            className="flex items-center gap-2 hover:text-[var(--text-secondary)] transition-colors group text-[var(--text-primary)]"
            style={{fontSize: "20px", fontWeight: "600"}}
          >
            AI Tools
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 text-[var(--text-primary)] ${isAiToolsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAiToolsOpen && (
            <div className="absolute top-full left-0 mt-4 w-80 glass-card-language border border-border/20 rounded-2xl p-4 shadow-xl z-50">
              <div className="space-y-3">
                {aiToolsOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <div
                      key={option.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group cursor-pointer"
                      onClick={() => {
                        setIsAiToolsOpen(false)
                        if (!user) {
                          showNotification('info', 'Please login to access AI Tools')
                          router.push('/auth/login')
                        } else {
                          router.push(option.href)
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-white group-hover:text-white/90 transition-colors">
                          {option.name}
                        </div>
                        <div className="text-sm text-white/70 group-hover:text-white/80 transition-colors">
                          {option.description}
                        </div>
                      </div>
                    
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Other Menu Items */}
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            style={{fontSize: "20px", fontWeight: "600"}}
            className="text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button - Left side for mobile */}
      <div className="relative md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 sm:w-10 sm:h-10 rounded-full hover:bg-muted/50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-4 h-4 sm:w-6 sm:h-6" /> : <Menu className="w-4 h-4 sm:w-6 sm:h-6" />}
        </Button>

        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 glass-card-language border border-border/20 rounded-2xl p-4 shadow-lg">
            <nav className="space-y-3">
              {/* Convert Section */}
              <div>
                <div className="text-sm font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">Convert</div>
                <div className="grid grid-cols-2 gap-2">
                  {convertOptions.slice(0, 6).map((option) => {
                    const IconComponent = option.icon
                    return (
                      <a
                        key={option.id}
                        href={option.href}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{option.name}</span>
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* AI Tools Section */}
              <div>
                <div className="text-sm font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">AI Tools</div>
                <div className="grid grid-cols-2 gap-2">
                  {aiToolsOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <div
                        key={option.id}
                        onClick={() => {
                          setIsMenuOpen(false)
                          if (!user) {
                            showNotification('info', 'Please login to access AI Tools')
                            router.push('/auth/login')
                          } else {
                            router.push(option.href)
                          }
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{option.name}</span>
                        {!user && (
                          <span className="text-xs text-yellow-400 ml-auto">Login</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Other Menu Items */}
              <div className="border-t border-white/10 pt-3">
                {menuItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="block text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors text-base font-bold px-3 py-2 rounded-xl hover:bg-white/10"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Logo - Center */}
      <div className="flex items-center gap-3" style={{    marginRight: "68px"}}>
        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center">
          <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-white"></div>
        </div>
        <span className="font-serif font-bold text-lg sm:text-2xl text-[var(--text-primary)]">iAI Smart</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/download"
          className="w-7 h-7 sm:w-10 sm:h-10 rounded-full hover:bg-muted/50 transition-all duration-300 flex items-center justify-center"
          aria-label="Files"
        >
          <File className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
        </Link>
        
        <div 
          className="relative user-dropdown"
          onMouseEnter={() => {
            if (!isUserClicked) {
              setIsUserOpen(true)
            }
          }}
          onMouseLeave={() => {
            if (!isUserClicked) {
              setIsUserOpen(false)
            }
          }}
        >
          <button
            className="w-7 h-7 sm:w-10 sm:h-10 rounded-full hover:bg-muted/50 transition-all duration-300 flex items-center justify-center"
            aria-label="User"
            onClick={() => {
              if (isUserClicked) {
                // Nếu đã click rồi, đóng dropdown và reset state
                setIsUserOpen(false)
                setIsUserClicked(false)
              } else {
                // Nếu chưa click, mở dropdown và set click state
                setIsUserOpen(true)
                setIsUserClicked(true)
              }
            }}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
          </button>
          
          {isUserOpen && (
            <div 
              className="user-dropdown-content w-52 rounded-lg shadow-lg py-3"
              style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 8px 32px var(--shadow-glass)'
              }}
            >
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.email}
                    </p>
                  </div>
                  <button
                    className="w-full px-4 py-3 text-left text-base font-medium transition-colors hover:bg-muted/50 flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => {
                      setIsUserOpen(false);
                      router.push('/auth/info');
                    }}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  {(user?.role === 'admin' || user?.user_metadata?.user_type === 'admin') && (
                    <button
                      className="w-full px-4 py-3 text-left text-base font-medium transition-colors hover:bg-muted/50 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={() => {
                        setIsUserOpen(false);
                        router.push('/admin/chat');
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Admin Chat
                    </button>
                  )}
                  <button
                    className="w-full px-4 py-3 text-left text-base font-medium transition-colors hover:bg-muted/50 flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => {
                      setIsUserOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full px-4 py-3 text-left text-base font-medium transition-colors hover:bg-muted/50"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => {
                      setIsUserOpen(false);
                      router.push('/auth/login');
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-base font-medium transition-colors hover:bg-muted/50"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => {
                      setIsUserOpen(false);
                      router.push('/auth/register');
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <ThemeToggle />

        <div className="relative language-dropdown">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 sm:w-10 sm:h-10 rounded-full hover:bg-muted/50 transition-all duration-300"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
          >
            <span className="text-lg sm:text-2xl">
              {languages.find((lang) => lang.code === selectedLanguage)?.flag}
            </span>
          </Button>

          {isLanguageOpen && (
            <div
              style={{ width: "180px" }}
              className="absolute top-full right-0 mt-2 glass-card-language border border-border/20 rounded-2xl p-2 shadow-lg"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code as "vi" | "en")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-white/10 ${
                    selectedLanguage === language.code ? "text-white" : "text-white hover:text-white"
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span style={{ fontWeight: 900 }}>{language.name}</span>
                  {selectedLanguage === language.code && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  );
}
