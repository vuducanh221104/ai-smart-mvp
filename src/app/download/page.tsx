"use client";
import { useState, useEffect } from 'react';
import { Download, FileText, Trash2, Calendar, HardDrive } from 'lucide-react';
import Link from 'next/link';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  downloadUrl?: string;
}

export default function DownloadPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    try {
      const savedFiles = localStorage.getItem('convertedFiles');
      if (savedFiles) {
        const fileIds: string[] = JSON.parse(savedFiles);
        
        // Convert file IDs to file info objects
        const fileInfos: FileInfo[] = fileIds.map((fileId, index) => {
          const extension = fileId.split('.').pop() || '';
          const name = `converted_file_${index + 1}.${extension}`;
          
          // Extract timestamp from file ID for more accurate date
          const timestampMatch = fileId.match(/z(\d+)_/);
          const uploadDate = timestampMatch 
            ? new Date(parseInt(timestampMatch[1])).toISOString()
            : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
          
          return {
            id: fileId,
            name: name,
            size: Math.floor(Math.random() * 10000000) + 1000000, // Random size for demo
            uploadDate: uploadDate,
            downloadUrl: `/api/download/${fileId}`
          };
        });
        
        setFiles(fileInfos);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (fileId: string) => {
    try {
      const savedFiles = localStorage.getItem('convertedFiles');
      if (savedFiles) {
        const fileIds: string[] = JSON.parse(savedFiles);
        const updatedIds = fileIds.filter(id => id !== fileId);
        localStorage.setItem('convertedFiles', JSON.stringify(updatedIds));
        setFiles(prev => prev.filter(file => file.id !== fileId));
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);
    
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    } else {
      return `${mb.toFixed(1)} MB`;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--bg-primary)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{
            borderColor: 'var(--accent-primary)'
          }}></div>
          <p style={{ color: 'var(--text-primary)' }}>Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'var(--bg-primary)'
    }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            My Files
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Download and manage your converted files (output files only)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-lg p-6 shadow-lg" style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 8px 32px var(--shadow-glass)'
          }}>
            <div className="flex items-center">
              <FileText className="h-8 w-8 mr-3" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Files</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{files.length}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-6 shadow-lg" style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 8px 32px var(--shadow-glass)'
          }}>
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 mr-3" style={{ color: '#10b981' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Size</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-6 shadow-lg" style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 8px 32px var(--shadow-glass)'
          }}>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 mr-3" style={{ color: '#8b5cf6' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last Updated</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {files.length > 0 ? formatDate(files[0].uploadDate).split(',')[0] : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No files yet
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Convert some files to see them here
            </p>
            <Link 
              href="/convert"
              className="inline-flex items-center px-6 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              Go to Converter
            </Link>
          </div>
        ) : (
          <div className="rounded-lg shadow-lg overflow-hidden" style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 8px 32px var(--shadow-glass)'
          }}>
            <div className="px-6 py-4 border-b" style={{
              borderColor: 'var(--border-glass)'
            }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Your Converted Files (Output Files Only)
              </h2>
            </div>
            
            <div className="divide-y" style={{
              borderColor: 'var(--border-glass)'
            }}>
              {files.map((file) => (
                <div key={file.id} className="px-6 py-4 transition-colors hover:opacity-80" style={{
                  backgroundColor: 'var(--bg-glass-card)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {file.name}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                        </p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                          ID: {file.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(file.downloadUrl, '_blank')}
                        className="inline-flex items-center px-3 py-2 text-sm rounded-md transition-colors"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'white'
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="inline-flex items-center px-3 py-2 text-sm rounded-md transition-colors"
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white'
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
