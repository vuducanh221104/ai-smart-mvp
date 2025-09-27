"use client";
import { useState, useEffect } from "react";
import { Download, RotateCcw, FileText, Copy, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import "./download.scss";

interface FileInfo {
  fileId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
  status: string;
}

export default function DownloadPage({ params }: { params: { id: string } }) {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await fetch(`/api/file-info/${params.id}`);
        
        if (!response.ok) {
          throw new Error('File not found');
        }
        
        const data = await response.json();
        
        const fileInfo: FileInfo = {
          fileId: data.fileId,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          downloadUrl: data.downloadUrl,
          status: data.status
        };
        
        setFileInfo(fileInfo);
      } catch (err) {
        setError("File not found or expired");
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [params.id]);

  const handleDownload = async () => {
    if (fileInfo) {
      try {
        // Try API download first
        const response = await fetch(`/api/download/${fileInfo.fileId}`);
        
        if (response.ok) {
          // If API works, use it
          const link = document.createElement('a');
          link.href = `/api/download/${fileInfo.fileId}`;
          link.download = fileInfo.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // If API fails, download from Supabase URL using fetch
          try {
            const fileResponse = await fetch(fileInfo.downloadUrl);
            if (fileResponse.ok) {
              const blob = await fileResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = fileInfo.fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } else {
              // Final fallback - open in new tab
              window.open(fileInfo.downloadUrl, '_blank');
            }
          } catch (fetchError) {
            console.error('Fetch download error:', fetchError);
            // Final fallback - open in new tab
            window.open(fileInfo.downloadUrl, '_blank');
          }
        }
      } catch (error) {
        console.error('Download error:', error);
        // Fallback to direct download from Supabase URL using fetch
        try {
          const fileResponse = await fetch(fileInfo.downloadUrl);
          if (fileResponse.ok) {
            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileInfo.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } else {
            // Final fallback - open in new tab
            window.open(fileInfo.downloadUrl, '_blank');
          }
        } catch (fetchError) {
          console.error('Fetch download error:', fetchError);
          // Final fallback - open in new tab
          window.open(fileInfo.downloadUrl, '_blank');
        }
      }
    }
  };

  const handleConvertMore = () => {
    window.location.href = '/convert';
  };

  const humanSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"]; 
    let i = 0; 
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) { 
      n /= 1024; 
      i++; 
    }
    return `${n.toFixed(2)} ${units[i]}`;
  };

  if (loading) {
    return (
      <div className="download-container" style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card className="glass-card" style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <CardContent>
            <div className="loading-spinner" style={{
              width: '50px',
              height: '50px',
              border: '3px solid var(--border-glass)',
              borderTop: '3px solid var(--text-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <h2 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '24px', 
              fontWeight: '600',
              margin: '0'
            }}>
              Loading...
            </h2>
          </CardContent>
        </Card>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !fileInfo) {
    return (
      <div className="download-container" style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card className="glass-card" style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <CardContent>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--error-color, #ff3b30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px',
              color: 'white'
            }}>
              ✕
            </div>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '24px', 
              fontWeight: '600',
              margin: '0 0 10px 0'
            }}>
              File Not Found
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '16px',
              margin: '0 0 30px 0'
            }}>
              The file you&apos;re looking for doesn&apos;t exist or has expired.
            </p>
            <Link href="/convert">
              <Button 
                className="flex items-center gap-2"
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <RotateCcw size={20} />
                Convert Another File
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="download-container" style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div className="download-content" style={{
        maxWidth: '600px',
        margin: '0 auto',
        paddingTop: '40px'
      }}>
        {/* Back Button */}
        <div style={{ marginBottom: '20px' }}>
          <Link href="/convert">
            <Button 
              variant="ghost"
              className="flex items-center gap-2"
              style={{
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                padding: '8px 16px'
              }}
            >
              <ArrowLeft size={16} />
              Back to Converter
            </Button>
          </Link>
        </div>

        <Card className="glass-card" style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <CardContent>
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--success-color, #34C759)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px',
              color: 'white'
            }}>
              ✓
            </div>
            
            <h1 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '28px', 
              fontWeight: '700',
              margin: '0 0 10px 0'
            }}>
              Conversion Successful
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '16px',
              margin: '0 0 30px 0'
            }}>
              Choose the options below to download or share your converted file
            </p>

            {/* File Info Card */}
            <Card style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <div className="flex items-center gap-3">
                <FileText size={24} style={{ color: 'var(--text-primary)' }} />
                <div>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    margin: '0 0 4px 0'
                  }}>
                    {fileInfo.fileName}
                  </h3>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    {fileInfo.fileType} • {fileInfo.fileSize}
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
              <Button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2"
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <Download size={20} />
                Download Now
              </Button>

              <Button 
                onClick={handleCopyLink}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <Copy size={20} />
                {copied ? 'Copied!' : 'Copy Download Link'}
              </Button>
            </div>

            {/* QR Code Section */}
            <div style={{
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '30px',
              marginBottom: '30px'
            }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '18px', 
                fontWeight: '600',
                margin: '0 0 20px 0'
              }}>
                Or scan QR code
              </h3>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                margin: '0 auto',
                width: 'fit-content'
              }}>
                <QRCodeSVG value={window.location.href} size={200} />
              </div>
            </div>

            {/* Info Text */}
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '14px',
              margin: '0 0 30px 0'
            }}>
              Files will be stored for 24 hours. Visit{" "}
              <Link href="/my-files" style={{ color: 'var(--primary-color)' }}>
                My Files
              </Link>{" "}
              to manage them.
            </p>

            {/* Convert Another Button */}
            <Link href="/convert">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <RotateCcw size={20} />
                Convert Another File
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
