"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { ChevronLeft, ChevronRight, Download, Pause, Play, Shuffle, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

type Flashcard = { question: string; answer: string };
type FlashcardSet = {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  flashcards: Flashcard[];
};

const MAX_COUNT = 40;

function FlashCardPage() {
  const { showNotification } = useNotification();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [savedSets, setSavedSets] = useState<FlashcardSet[]>([]);
  const [user, setUser] = useState<any>(null);
  const supabase = getSupabaseClient();
  // Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const playTimerRef = useRef<number | null>(null);

  const canGenerate = useMemo(
    () => input.trim().length > 0 && count > 0 && count <= MAX_COUNT,
    [input, count]
  );

  useEffect(() => {
    const raw = localStorage.getItem("flashcard_sets");
    if (raw) {
      try {
        setSavedSets(JSON.parse(raw));
      } catch {}
    }
  }, []);

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const persistSets = (sets: FlashcardSet[]) => {
    setSavedSets(sets);
    localStorage.setItem("flashcard_sets", JSON.stringify(sets));
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setCards([]);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim(), language, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate");
      const list: Flashcard[] = Array.isArray(data.flashcards)
        ? data.flashcards
        : [];
      const finalList = list.slice(0, MAX_COUNT);
      setCards(finalList);
      showNotification("success", "Generated flashcards successfully!");
      // Prepare viewer
      const initialOrder = list.map((_, idx) => idx).slice(0, MAX_COUNT);
      setOrder(initialOrder);
      setCurrent(0);
      setIsShuffled(false);
      setIsPlaying(false);
      setIsFlipped(false);
      setShowPreview(false); // Hide preview initially
      setViewerOpen(true);
      // Auto save to account with custom title format
      const userInput = input.trim().slice(0, 40) || "Untitled";
      const title = `Create flashcard: ${userInput} (${finalList.length} cards)`;
      await saveToSupabase(finalList, title);
    } catch (e: any) {
      showNotification("error", e?.message || "Generate failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSet = () => {
    if (cards.length === 0) return;
    const id = `fc_${Date.now()}`;
    const userInput = input.trim().slice(0, 40) || "Untitled";
    const title = `Create flashcard: ${userInput} (${cards.length} cards)`;
    const newSet: FlashcardSet = {
      id,
      title,
      language,
      createdAt: new Date().toISOString(),
      flashcards: cards,
    };
    const next = [newSet, ...savedSets];
    persistSets(next);
    showNotification("success", "Saved flashcard set");
  };

  const saveToSupabase = async (overrideCards?: Flashcard[], overrideTitle?: string) => {
    if (!user) {
      showNotification('error', 'Please login to save flashcards');
      return;
    }
    
    try {
      const title = (overrideTitle ?? input.trim().slice(0, 60)) || "Untitled";
      const res = await fetch('/api/flashcards/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          language, 
          flashcards: overrideCards ?? cards,
          userId: user.id 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      showNotification('success', 'Saved to your account');
    } catch (e: any) {
      showNotification('error', e?.message || 'Save failed');
    }
  };

  // Viewer helpers
  const displayedCard = cards.length && order.length ? cards[order[current]] : undefined;

  const goNext = useCallback(() => {
    if (!order.length) return;
    setCurrent((c) => (c + 1) % order.length);
    setIsFlipped(false); // Reset flip when changing cards
  }, [order.length]);
  const goPrev = () => {
    if (!order.length) return;
    setCurrent((c) => (c - 1 + order.length) % order.length);
    setIsFlipped(false); // Reset flip when changing cards
  };

  const toggleShuffle = () => {
    if (!cards.length) return;
    if (isShuffled) {
      const reset = cards.map((_, i) => i);
      setOrder(reset);
      setCurrent(0);
      setIsShuffled(false);
    } else {
      const arr = cards.map((_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setOrder(arr);
      setCurrent(0);
      setIsShuffled(true);
    }
    setIsFlipped(false); // Reset flip when shuffling
  };

  const togglePlay = () => {
    setIsPlaying((p) => !p);
  };

  useEffect(() => {
    // Auto-advance when playing
    if (viewerOpen && isPlaying && order.length > 0) {
      if (playTimerRef.current) window.clearInterval(playTimerRef.current);
      playTimerRef.current = window.setInterval(() => {
        goNext();
      }, 3000);
      return () => {
        if (playTimerRef.current) window.clearInterval(playTimerRef.current);
      };
    } else {
      if (playTimerRef.current) window.clearInterval(playTimerRef.current);
    }
  }, [viewerOpen, isPlaying, order.length, goNext]);

  const downloadCurrentGenerated = () => {
    if (!cards.length) return;
    const set: FlashcardSet = {
      id: `fc_${Date.now()}`,
      title: input.trim().slice(0, 60) || "Untitled",
      language,
      createdAt: new Date().toISOString(),
      flashcards: cards,
    };
    const blob = new Blob([JSON.stringify(set, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${set.title.replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSet = (id: string) => {
    const next = savedSets.filter((s) => s.id !== id);
    persistSets(next);
    showNotification("success", "Deleted set");
  };

  const handleDownloadSet = (set: FlashcardSet) => {
    const blob = new Blob([JSON.stringify(set, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${set.title.replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          {/* Back Button */}
          <div className="mb-4">
            <Link href="/flashCard">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80" style={{
                background: 'var(--bg-glass-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-glass)'
              }}>
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </button>
            </Link>
          </div>
          
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
              AI Flashcards
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Generate up to 40 flashcards from text, or save and download your sets.
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div className="rounded-2xl p-6 mb-8" style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 8px 32px var(--shadow-glass)'
        }}>
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 rounded-md"
              style={{ background: 'var(--bg-glass-card)', color: 'var(--text-primary)' }}
            >
              <option>English</option>
              <option>Vietnamese</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
              <option>Korean</option>
            </select>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="px-3 py-2 rounded-md"
              style={{ background: 'var(--bg-glass-card)', color: 'var(--text-primary)' }}
            >
              {Array.from({ length: MAX_COUNT }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter topic or paste text to generate flashcards"
            className="w-full h-40 rounded-lg p-3 resize-y"
            style={{
              background: 'var(--bg-glass-card)',
              color: 'var(--text-primary)'
            }}
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="px-5 py-2 rounded-lg disabled:opacity-50"
              style={{ background: 'var(--accent-primary)', color: 'white' }}
            >
              {loading ? 'Generating...' : 'Generate Flashcards'}
            </button>
            <button
              onClick={handleSaveSet}
              disabled={cards.length === 0}
              className="px-5 py-2 rounded-lg disabled:opacity-50"
              style={{ background: '#0d3b62', color: 'white' }}
            >
              Save Set
            </button>
        
          </div>
        </div>

        {/* Results */}
        {cards.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Generated Flashcards ({cards.length})
              </h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ 
                  background: showPreview ? 'var(--bg-glass-card)' : 'var(--accent-primary)', 
                  color: showPreview ? 'var(--text-primary)' : 'white' 
                }}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            
            {showPreview && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {cards.map((c, idx) => (
                  <div key={idx} className="rounded-xl p-4" style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)'
                  }}>
                    <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{c.question}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{c.answer}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setViewerOpen(true)}
                className="px-5 py-2 rounded-lg"
                style={{ background: '#ef4444', color: 'white' }}
              >
                Study Mode
              </button>
              <button
                onClick={downloadCurrentGenerated}
                className="px-5 py-2 rounded-lg"
                style={{ background: '#22c55e', color: 'white' }}
              >
                Download
              </button>
            </div>
          </div>
        )}

        {/* Saved Sets */}
        <div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Your Flashcard Sets
          </h2>
          {savedSets.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No saved sets yet.</p>
          ) : (
            <div className="space-y-3">
              {savedSets.map((s) => (
                <div key={s.id} className="rounded-xl p-4 flex items-center justify-between" style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.flashcards.length} cards • {s.language}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadSet(s)}
                      className="px-3 py-2 rounded-md"
                      style={{ background: 'var(--accent-primary)', color: 'white' }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteSet(s.id)}
                      className="px-3 py-2 rounded-md"
                      style={{ background: '#ef4444', color: 'white' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    {/* Viewer Modal */}
    {viewerOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <div className="relative w-[92%] max-w-5xl rounded-3xl" style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(24px)'
        }}>
          <button
            onClick={() => { setViewerOpen(false); setIsPlaying(false); }}
            className="absolute top-4 right-4 p-2 rounded-full hover:opacity-80"
            aria-label="Close"
            style={{ background: 'var(--bg-glass-card)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>

          <div className="p-6 sm:p-8" style={{padding:"70px"}}>
            <div 
              className="rounded-2xl min-h-[320px] sm:min-h-[380px] flex items-center justify-center p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02]" 
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-glass)'
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <p className="text-2xl sm:text-3xl font-semibold text-center" style={{ 
                color: isFlipped ? '#ef4444' : 'var(--text-primary)' 
              }}>
                {isFlipped ? (displayedCard?.answer || '—') : (displayedCard?.question || '—')}
              </p>
            </div>
            <div className="mt-2 text-center">
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Click card to {isFlipped ? 'show question' : 'show answer'}
              </p>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={goPrev} className="px-4 py-2 rounded-xl hover:opacity-80" style={{ background: 'var(--bg-glass-card)' }}>
                  <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>
                <div className="px-3 py-2 text-sm rounded-xl" style={{ background: 'var(--bg-glass-card)', color: 'var(--text-primary)' }}>
                  {order.length ? current + 1 : 0} / {order.length}
                </div>
                <button onClick={goNext} className="px-4 py-2 rounded-xl hover:opacity-80" style={{ background: 'var(--bg-glass-card)' }}>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={togglePlay} className="px-4 py-2 rounded-xl hover:opacity-80" style={{ background: 'var(--bg-glass-card)' }}>
                  {isPlaying ? (
                    <Pause className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  ) : (
                    <Play className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  )}
                </button>
                <button onClick={toggleShuffle} className="px-4 py-2 rounded-xl hover:opacity-80" style={{ background: isShuffled ? 'var(--accent-primary)' : 'var(--bg-glass-card)', color: isShuffled ? 'white' : 'var(--text-primary)' }}>
                  <Shuffle className="w-5 h-5" />
                </button>
                <button onClick={downloadCurrentGenerated} className="px-4 py-2 rounded-xl hover:opacity-80" style={{ background: 'var(--bg-glass-card)' }}>
                  <Download className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default FlashCardPage;