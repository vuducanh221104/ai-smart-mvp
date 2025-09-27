"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Pause, Play, Shuffle, X, Plus, BookOpen, Calendar, Globe, Trash2, PlayCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase/client";

type SetSummary = {
  id: string;
  title: string;
  language: string;
  card_count: number;
  created_at: string;
};

type Flashcard = { question: string; answer: string };

function ListFlashCard() {
  const [sets, setSets] = useState<SetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = getSupabaseClient();
  const total = useMemo(() => sets.length, [sets]);
  
  // Study modal state
  const [studyModalOpen, setStudyModalOpen] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const playTimerRef = useRef<number | null>(null);

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const loadSets = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/flashcards/list?user_id=${user.id}`);
      const data = await res.json();
      if (res.ok) setSets(data.flashcardSets || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { 
    if (user) {
      loadSets(); 
    }
  }, [user, loadSets]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    const res = await fetch('/api/flashcards/delete', {
      method: 'DELETE', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ setId: id, userId: user.id })
    });
    if (res.ok) loadSets();
  };

  const timeAgo = (iso: string) => new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
    Math.round((new Date(iso).getTime() - Date.now()) / (1000*60*60)), 'hour'
  );

  // Study modal functions
  const openStudyModal = async (setId: string) => {
    if (!user) return;
    
    try {
      const res = await fetch(`/api/flashcards/get/${setId}?user_id=${user.id}`);
      const data = await res.json();
      if (res.ok && data.flashcardSet?.flashcards) {
        setStudyCards(data.flashcardSet.flashcards);
        const initialOrder = data.flashcardSet.flashcards.map((_: any, idx: number) => idx);
        setCardOrder(initialOrder);
        setCurrentCard(0);
        setIsShuffled(false);
        setIsPlaying(false);
        setIsFlipped(false);
        setStudyModalOpen(true);
      }
    } catch (e) {
      console.error('Error loading flashcards:', e);
    }
  };

  const displayedCard = studyCards.length && cardOrder.length ? studyCards[cardOrder[currentCard]] : undefined;

  const goNext = useCallback(() => {
    if (!cardOrder.length) return;
    setCurrentCard((c) => (c + 1) % cardOrder.length);
    setIsFlipped(false);
  }, [cardOrder.length]);

  const goPrev = () => {
    if (!cardOrder.length) return;
    setCurrentCard((c) => (c - 1 + cardOrder.length) % cardOrder.length);
    setIsFlipped(false);
  };

  const toggleShuffle = () => {
    if (!studyCards.length) return;
    if (isShuffled) {
      const reset = studyCards.map((_, i) => i);
      setCardOrder(reset);
      setCurrentCard(0);
      setIsShuffled(false);
    } else {
      const arr = studyCards.map((_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setCardOrder(arr);
      setCurrentCard(0);
      setIsShuffled(true);
    }
    setIsFlipped(false);
  };

  const togglePlay = () => {
    setIsPlaying((p) => !p);
  };

  const downloadSet = (set: SetSummary) => {
    const blob = new Blob([JSON.stringify({
      id: set.id,
      title: set.title,
      language: set.language,
      created_at: set.created_at,
      flashcards: studyCards
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${set.title.replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (studyModalOpen && isPlaying && cardOrder.length > 0) {
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
  }, [studyModalOpen, isPlaying, cardOrder.length, goNext]);

    return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{ background: 'var(--accent-primary)' }}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
        <div>
                <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  My Flashcards
                </h1>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Study and manage your flashcard sets
                </p>
              </div>
            </div>
            <Link href="/flashCard/create">
              <Button className="h-12 px-6" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                <Plus className="w-5 h-5 mr-2" />
                Create New Set
              </Button>
            </Link>
          </div>
          
          {/* Stats Card */}
          <Card className="mb-6" style={{ 
            background: 'var(--bg-glass)', 
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{total}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Sets</div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {sets.reduce((sum, set) => sum + set.card_count, 0)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Cards</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {sets.length > 0 ? 'Active' : 'Empty'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} style={{ 
                background: 'var(--bg-glass)', 
                border: '1px solid var(--border-glass)',
                backdropFilter: 'blur(20px)'
              }}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full rounded-lg" />
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : sets.length === 0 ? (
          <Card className="text-center py-16" style={{ 
            background: 'var(--bg-glass)', 
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent>
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--bg-glass-card)' }}>
                <BookOpen className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No flashcard sets yet
              </h3>
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                Create your first flashcard set to start learning
              </p>
              <Link href="/flashCard/create">
                <Button size="lg" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Set
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((s) => (
              <Card key={s.id} className="group hover:scale-[1.02] transition-all duration-300" style={{ 
                background: 'var(--bg-glass)', 
                border: '1px solid var(--border-glass)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px var(--shadow-glass)'
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {s.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Globe className="w-3 h-3" />
                        <span className="text-sm">{s.language}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {s.card_count} cards
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="relative rounded-xl h-32 flex items-center justify-center mb-4 overflow-hidden" style={{
                    background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-glass-card) 100%)',
                    border: '1px solid var(--border-glass)'
                  }}>
                    <div className="text-center p-4">
                      <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {s.card_count} flashcards
                      </p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs">
                        {s.card_count}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar className="w-3 h-3" />
                    <span>{timeAgo(s.created_at)}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <div className="flex gap-2 w-full">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openStudyModal(s.id)}
                      style={{ background: '#ef4444', color: 'white' }}
                    >
                      <PlayCircle className="w-4 h-4 mr-1" />
                      Study
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => downloadSet(s)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(s.id)}
                      className="px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Study Modal */}
    {studyModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <div className="relative w-[92%] max-w-5xl rounded-3xl" style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(24px)'
        }}>
          <button
            onClick={() => { setStudyModalOpen(false); setIsPlaying(false); }}
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
                  {cardOrder.length ? currentCard + 1 : 0} / {cardOrder.length}
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
                <button onClick={() => downloadSet(sets.find(s => studyCards.length > 0) || sets[0])} className="px-4 py-2 rounded-xl hover:opacity-80" style={{ background: 'var(--bg-glass-card)' }}>
                  <Download className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
        </div>
    );
}

export default ListFlashCard;