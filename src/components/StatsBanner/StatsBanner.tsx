"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./StatsBanner.scss";

interface StatsData {
  totalFiles: number;
  totalSize: number; // in bytes
}

export default function StatsBanner() {
  const [stats, setStats] = useState<StatsData>({ totalFiles: 0, totalSize: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        console.log('Stats data:', data); // Debug log
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);
    
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    } else {
      return `${mb.toFixed(1)} MB`;
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative overflow-hidden liquid-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 liquid-animation"></div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-4 liquid-animation" style={{color: "rgb(28, 149, 240)"}}>
            We&apos;ve converted
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
            <span className="font-serif italic font-medium tracking-wide text-shadow-lg">
              {loading ? (
                <>Loading... files with a total size of Loading...</>
              ) : (
                <><strong className="font-black text-primary">{formatNumber(stats.totalFiles)}</strong> files with a total size of <strong className="font-black text-primary">{formatSize(stats.totalSize)}</strong></>
              )}
            </span>
          </p>
        </div>
      </div>
      <button 
        className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-white/10 transition-colors"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
      >
        <X size={40} />
      </button>
    </div>
  );
}
