"use client";
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Sparkles, Zap, Brain, Volume2, FileText, Image, Music, Video, Archive, BarChart3, Type, BookOpen, Shapes, Download, Share2, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import "./home.scss";

const aiFeatures = [
  {
    id: 1,
    title: "AI Voice Generator",
    subtitle: "Text to Speech",
    description: "Convert your text into natural-sounding speech with our advanced AI voice technology. Choose from multiple voices and languages.",
    icon: Volume2,
    color: "from-purple-500 to-purple-600",
    features: ["Natural voice synthesis", "Multiple languages", "Custom voice settings", "High-quality audio output"],
    href: "/textToSpeech"
  },
  {
    id: 2,
    title: "AI Flashcard Generator",
    subtitle: "Smart Learning",
    description: "Generate intelligent flashcards from any text using AI. Perfect for students, professionals, and lifelong learners.",
    icon: Brain,
    color: "from-blue-500 to-blue-600",
    features: ["AI-powered generation", "Multiple input sources", "Customizable cards", "Study mode included"],
    href: "/flashCard"
  }
];

const converterFeatures = [
  {
    id: 1,
    title: "Image Converter",
    subtitle: "60+ Formats",
    description: "Convert between 60+ image formats including JPG, PNG, SVG, WEBP, and more. High-quality conversion with batch processing.",
    icon: Image,
    color: "from-green-500 to-green-600",
    features: ["60+ image formats", "Batch processing", "High quality", "Fast conversion"],
    href: "/convert?type=image-converter"
  },
  {
    id: 2,
    title: "Document Converter",
    subtitle: "18+ Formats",
    description: "Convert documents between PDF, DOC, DOCX, RTF, and other popular formats. Preserve formatting and quality.",
    icon: FileText,
    color: "from-orange-500 to-orange-600",
    features: ["18+ document formats", "Format preservation", "OCR support", "Secure processing"],
    href: "/convert?type=document-converter"
  },
  {
    id: 3,
    title: "Vector Converter",
    subtitle: "11+ Formats",
    description: "Convert vector graphics between SVG, AI, EPS, and other professional formats. Perfect for designers.",
    icon: Shapes,
    color: "from-pink-500 to-pink-600",
    features: ["11+ vector formats", "Designer-friendly", "Scalable output", "Professional quality"],
    href: "/convert?type=vector-converter"
  },
  {
    id: 4,
    title: "Audio Converter",
    subtitle: "All Formats",
    description: "Convert audio files between MP3, WAV, FLAC, AAC, and other formats. Maintain audio quality.",
    icon: Music,
    color: "from-indigo-500 to-indigo-600",
    features: ["All audio formats", "Quality preservation", "Batch conversion", "Metadata support"],
    href: "/convert?type=audio-converter"
  },
  {
    id: 5,
    title: "Video Converter",
    subtitle: "All Formats",
    description: "Convert videos between MP4, AVI, MOV, MKV, and other formats. Optimize for different devices.",
    icon: Video,
    color: "from-red-500 to-red-600",
    features: ["All video formats", "Device optimization", "Quality control", "Fast processing"],
    href: "/convert?type=video-converter"
  },
  {
    id: 6,
    title: "Archive Converter",
    subtitle: "All Formats",
    description: "Convert between ZIP, RAR, 7Z, TAR, and other archive formats. Extract and compress files easily.",
    icon: Archive,
    color: "from-yellow-500 to-yellow-600",
    features: ["All archive formats", "Extract & compress", "Password protection", "Batch operations"],
    href: "/convert?type=archive-converter"
  }
];

const stats = [
  { number: "1M+", label: "Files Converted" },
  { number: "50K+", label: "Happy Users" },
  { number: "200+", label: "Supported Formats" },
  { number: "99.9%", label: "Uptime" }
];

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState<'ai' | 'converter'>('ai');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentFeatures = currentSection === 'ai' ? aiFeatures : converterFeatures;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentFeatures.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentFeatures.length]);

  const handleSectionChange = (section: 'ai' | 'converter') => {
    if (section !== currentSection && !isAnimating) {
      setIsAnimating(true);
      setCurrentSection(section);
      setCurrentIndex(0);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const handlePrevious = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + currentFeatures.length) % currentFeatures.length);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % currentFeatures.length);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <div className="home-container">
      {/* Background decorations */}
      <div className="bg-decoration bg-decoration-1" />
      <div className="bg-decoration bg-decoration-2" />
      <div className="bg-decoration bg-decoration-3" />
      
      <div className="home-content">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Powered by iAI Smart</span>
            </div>
            <h1 className="hero-title">
              Transform Your Files with
              <span className="gradient-text"> AI-Powered Tools</span>
            </h1>
            <p className="hero-description">
              Convert files in 200+ formats or generate AI content with our advanced platform. 
              Fast, secure, and designed for professionals.
            </p>
            <div className="hero-buttons">
              <Link href="/convert">
                <Button className="hero-button primary">
                  <Zap size={20} />
                  Start Converting
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="hero-button secondary">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="section-header">
            <h2>Choose Your Tool</h2>
            <p>Discover our powerful AI tools and file conversion capabilities</p>
          </div>

          {/* Section Toggle */}
          <div className="section-toggle">
            <button
              className={`toggle-button ${currentSection === 'ai' ? 'active' : ''}`}
              onClick={() => handleSectionChange('ai')}
            >
              <Brain size={20} />
              AI Tools
            </button>
            <button
              className={`toggle-button ${currentSection === 'converter' ? 'active' : ''}`}
              onClick={() => handleSectionChange('converter')}
            >
              <FileText size={20} />
              File Converter
            </button>
          </div>

          {/* Feature Carousel */}
          <div className="feature-carousel">
            <div className="carousel-container">
              <div 
                className={`carousel-track ${isAnimating ? 'animating' : ''}`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {currentFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={feature.id} className="carousel-slide">
                      <Card className="feature-card">
                        <CardHeader className="feature-header">
                          <div className={`feature-icon ${feature.color}`}>
                            <IconComponent size={32} />
                          </div>
                          <CardTitle className="feature-title">{feature.title}</CardTitle>
                          <div className="feature-subtitle">{feature.subtitle}</div>
                          <p className="feature-description">{feature.description}</p>
                        </CardHeader>
                        <CardContent className="feature-content">
                          <div className="feature-list">
                            {feature.features.map((item, idx) => (
                              <div key={idx} className="feature-item">
                                <CheckCircle size={16} />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                          <Link href={feature.href}>
                            <Button className="feature-button">
                              Try Now
                              <ArrowRight size={16} />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="carousel-controls">
              <button 
                className="control-button prev"
                onClick={handlePrevious}
                disabled={isAnimating}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="carousel-dots">
                {currentFeatures.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true);
                        setCurrentIndex(index);
                        setTimeout(() => setIsAnimating(false), 600);
                      }
                    }}
                  />
                ))}
              </div>
              <button 
                className="control-button next"
                onClick={handleNext}
                disabled={isAnimating}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of users who trust our platform for their file conversion and AI needs.</p>
            <div className="cta-buttons">
              <Link href="/convert">
                <Button className="cta-button primary">
                  <Download size={20} />
                  Start Converting
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="cta-button secondary">
                  <Star size={20} />
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}