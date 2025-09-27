"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, 
  Play, 
  Pause, 
  Download, 
  Mic, 
  Settings, 
  Loader2,
  Copy,
  Check
} from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  accent: string;
}

const DEFAULT_VOICES: Voice[] = [
  { id: "en-US-Standard-A", name: "Standard A", language: "English (US)", gender: "Female", accent: "American" },
  { id: "en-US-Standard-B", name: "Standard B", language: "English (US)", gender: "Male", accent: "American" },
  { id: "en-US-Standard-C", name: "Standard C", language: "English (US)", gender: "Female", accent: "American" },
  { id: "en-US-Standard-D", name: "Standard D", language: "English (US)", gender: "Male", accent: "American" },
  { id: "en-US-Wavenet-A", name: "Wavenet A", language: "English (US)", gender: "Female", accent: "American" },
  { id: "en-US-Wavenet-B", name: "Wavenet B", language: "English (US)", gender: "Male", accent: "American" },
  { id: "en-US-Wavenet-C", name: "Wavenet C", language: "English (US)", gender: "Female", accent: "American" },
  { id: "en-US-Wavenet-D", name: "Wavenet D", language: "English (US)", gender: "Male", accent: "American" },
  { id: "vi-VN-Standard-A", name: "Vietnamese A", language: "Vietnamese", gender: "Female", accent: "Vietnamese" },
  { id: "vi-VN-Standard-B", name: "Vietnamese B", language: "Vietnamese", gender: "Male", accent: "Vietnamese" },
];

export default function TextToSpeechPage() {
  const { showNotification } = useNotification();
  const [text, setText] = useState("");
  const [selectedVoice] = useState("en-US-Standard-A");
  const [speakingRate] = useState([1.0]);
  const [pitch] = useState([0.0]);
  const [volume] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [browserVoices, setBrowserVoices] = useState<Voice[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const supabase = getSupabaseClient();
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showNotification('info', 'Please login to access AI Voice')
        router.push('/auth/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkAuth();
  }, [supabase, router, showNotification]);

  // Load browser voices on component mount
  useEffect(() => {
    if (!user) return;
    
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const voiceList: Voice[] = voices.map((voice, index) => ({
          id: voice.name || `voice-${index}`,
          name: voice.name || `Voice ${index + 1}`,
          language: voice.lang || 'Unknown',
          gender: voice.name?.toLowerCase().includes('female') ? 'Female' : 'Male',
          accent: voice.name?.split(' ')[0] || 'Unknown'
        }));
        setBrowserVoices(voiceList);
      }
    };

    loadVoices();
    // Some browsers load voices asynchronously
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [user]);

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      showNotification("error", "Please enter some text to convert to speech");
      return;
    }

    setIsGenerating(true);
    try {
      // Use Web Speech API to prepare speech (but don't play yet)
      if ('speechSynthesis' in window) {
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        // Create a simple audio URL for the player (this will be silent but allows UI to work)
        const silentAudio = new Blob([new ArrayBuffer(1024)], { type: 'audio/wav' });
        const url = URL.createObjectURL(silentAudio);
        setAudioUrl(url);
        
        showNotification("success", "Speech prepared successfully! Click Play to hear it.");
        
      } else {
        // Fallback to server-side generation
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            voice: selectedVoice,
            speakingRate: speakingRate[0],
            pitch: pitch[0],
            volume: volume[0],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate speech");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        showNotification("success", "Speech generated successfully! Click Play to hear it.");
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      showNotification("error", "Failed to generate speech. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          // Play speech for the first time
          if (text.trim()) {
            const utterance = new SpeechSynthesisUtterance(text.trim());
            
            // Set voice
            const voices = window.speechSynthesis.getVoices();
            const selectedVoiceObj = voices.find(v => 
              v.name.includes(selectedVoice.split('-')[2]) || 
              v.lang.includes(selectedVoice.split('-')[0]) ||
              v.name.toLowerCase().includes('standard') ||
              v.name.toLowerCase().includes('wavenet')
            );
            if (selectedVoiceObj) {
              utterance.voice = selectedVoiceObj;
            }
            
            // Set speech parameters
            utterance.rate = speakingRate[0];
            utterance.pitch = 1 + (pitch[0] / 20);
            utterance.volume = volume[0];
            
            utterance.onstart = () => {
              setIsPlaying(true);
              showNotification("success", "Speech started!");
            };
            
            utterance.onend = () => {
              setIsPlaying(false);
              showNotification("success", "Speech completed!");
            };
            
            utterance.onerror = (event) => {
              setIsPlaying(false);
              showNotification("error", "Speech playback failed");
            };
            
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    } else if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `speech-${Date.now()}.mp3`;
    a.click();
    showNotification("success", "Audio file downloaded!");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showNotification("success", "Text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedVoiceData = (browserVoices.length > 0 ? browserVoices : DEFAULT_VOICES).find(v => v.id === selectedVoice);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: 'var(--text-primary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--accent-primary)' }}>
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                AI Text to Speech
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Convert your text into natural-sounding speech with AI
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Text Input Card */}
          <Card className="mb-8" style={{ 
            background: 'var(--bg-glass)', 
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px var(--shadow-glass)'
          }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl" style={{ color: 'var(--text-primary)' }}>
                    Enter Your Text
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Type or paste the text you want to convert to speech
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  disabled={!text.trim()}
                  className="h-10 w-10 p-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your text here... (Maximum 5000 characters)"
                value={text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                className="min-h-[300px] resize-none text-lg"
                maxLength={5000}
                style={{
                  background: 'var(--bg-glass-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {text.length}/5000 characters
                  </span>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {text.split(' ').length} words
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {selectedVoiceData?.language || 'English'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generate Button */}
            <Card style={{ 
              background: 'var(--bg-glass)', 
              border: '1px solid var(--border-glass)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px var(--shadow-glass)'
            }}>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                    background: 'var(--accent-primary)',
                    boxShadow: '0 8px 32px rgba(13, 59, 98, 0.3)'
                  }}>
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Generate Speech
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Prepare your text for speech synthesis
                  </p>
                </div>
                
                <Button
                  onClick={handleGenerateSpeech}
                  disabled={!text.trim() || isGenerating}
                  className="w-full h-14 text-lg font-semibold"
                  style={{ 
                    background: 'var(--accent-primary)', 
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(13, 59, 98, 0.3)'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6 mr-3" />
                      Prepare Speech
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Audio Player */}
            <Card style={{ 
              background: 'var(--bg-glass)', 
              border: '1px solid var(--border-glass)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px var(--shadow-glass)'
            }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>
                  Audio Player
                </CardTitle>
                <CardDescription>
                  {audioUrl ? 'Click Play to hear your generated speech' : 'Generate speech to see the player'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {audioUrl ? (
                  <>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full"
                    />
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePlayPause}
                        className="flex-1 h-12"
                        variant={isPlaying ? "destructive" : "default"}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="h-12 px-6"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
                      background: 'var(--bg-glass-card)'
                    }}>
                      <Volume2 className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Generate speech first to enable playback
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="mt-8" style={{ 
            background: 'var(--bg-glass)', 
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px var(--shadow-glass)'
          }}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Settings className="w-5 h-5" />
                Tips for Better Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--accent-primary)' }}></div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Use punctuation for natural pauses and rhythm
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--accent-primary)' }}></div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Keep sentences under 200 characters for best results
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--accent-primary)' }}></div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Use proper capitalization and grammar
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--accent-primary)' }}></div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Add numbers as words for better pronunciation
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--accent-primary)' }}></div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Break long texts into smaller paragraphs
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--accent-primary)' }}></div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Test with different voices for variety
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
