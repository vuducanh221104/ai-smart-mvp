"use client";
import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  X,
  ChevronDown,
  Plus,
  ArrowRight,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeaturesSection from "@/components/FeaturesSection/FeaturesSection";
import RatingSection from "@/components/RatingSection/RatingSection";
import StatsBanner from "@/components/StatsBanner/StatsBanner";
import "./converter.scss";

type Item = {
  id: string;
  file: File;
  targetFormat: string;
  status: "ready" | "converting" | "done" | "error";
  fileId?: string;
  downloadUrl?: string;
  convertedFileId?: string;
  convertedDownloadUrl?: string;
};

const TARGET_FORMATS = [
  // Image formats
  "svg", "ico", "jpg", "webp", "jpeg", "dds", "gif", "cur", "bmp", "hdr", "psd", "tiff", "tga", "avif", "rgb", "heic", "xpm", "jfif", "exr", "heif", "xbm", "pgm", "rgba", "ppm", "pcx", "wbmp", "jbg", "picon", "g3", "map", "pnm", "jpe", "jp2", "pbm", "pdb", "jif", "pal", "yuv", "ras", "sixel", "pict", "jbig", "pcd", "jps", "pgx", "pfm", "fts", "pct", "uyvy", "xwd", "jfi", "fax", "otb", "rgbo", "g4", "six", "ipl", "sun", "pam", "sgi", "rgf", "mng", "vips", "hrz", "palm", "xv", "mtv", "viff",
  // Document formats
  "doc", "pdf", "docx", "docm", "odt", "xps", "dot", "rtf", "dotx", "djvu", "aw", "kwd", "dotm", "sxw", "dbk", "abw", "oxps",
  // Vector & Graphics formats
  "ai", "eps", "plt", "emf", "wmf", "sk", "fig", "cgm", "sk1", "ps"
];

const CONVERTER_TYPES = {
  "image-converter": {
    title: "Online Image Converter", 
    description: "Convert between 60+ image formats including SVG, ICO, JPG, WEBP, JPEG, DDS, GIF, CUR, BMP, HDR, PSD, TIFF, TGA, AVIF, RGB, HEIC, XPM, JFIF, EXR, HEIF, XBM, PGM, RGBA, PPM, PCX, WBMP, JBG, PICON, G3, MAP, PNM, JPE, JP2, PBM, PDB, JIF, PAL, YUV, RAS, SIXEL, PICT, JBIG, PCD, JPS, PGX, PFM, FTS, PCT, UYVY, XWD, JFI, FAX, OTB, RGBO, G4, SIX, IPL, SUN, PAM, SGI, RGF, MNG, VIPS, HRZ, PALM, XV, MTV, VIFF",
    formats: ["SVG", "ICO", "JPG", "WEBP", "JPEG", "DDS", "GIF", "CUR", "BMP", "HDR", "PSD", "TIFF", "TGA", "AVIF", "RGB", "HEIC", "XPM", "JFIF", "EXR", "HEIF", "XBM", "PGM", "RGBA", "PPM", "PCX", "WBMP", "JBG", "PICON", "G3", "MAP", "PNM", "JPE", "JP2", "PBM", "PDB", "JIF", "PAL", "YUV", "RAS", "SIXEL", "PICT", "JBIG", "PCD", "JPS", "PGX", "PFM", "FTS", "PCT", "UYVY", "XWD", "JFI", "FAX", "OTB", "RGBO", "G4", "SIX", "IPL", "SUN", "PAM", "SGI", "RGF", "MNG", "VIPS", "HRZ", "PALM", "XV", "MTV", "VIFF"],
    category: "Image"
  },
  "document-converter": {
    title: "Online Document Converter",
    description: "Convert between 18+ document formats including DOC, PDF, DOCX, DOCM, ODT, XPS, DOT, RTF, DOTX, DJVU, AW, KWD, DOTM, SXW, DBK, ABW, OXPS",
    formats: ["DOC", "PDF", "DOCX", "DOCM", "ODT", "XPS", "DOT", "RTF", "DOTX", "DJVU", "AW", "KWD", "DOTM", "SXW", "DBK", "ABW", "OXPS"],
    category: "Document"
  },
  "vector-converter": {
    title: "Online Vector & Graphics Converter",
    description: "Convert between 11+ vector and graphics formats including SVG, AI, EPS, PLT, EMF, WMF, SK, FIG, CGM, SK1, PS",
    formats: ["SVG", "AI", "EPS", "PLT", "EMF", "WMF", "SK", "FIG", "CGM", "SK1", "PS"],
    category: "Vector"
  },
  "audio-converter": {
    title: "Online Audio Converter",
    description: "Convert audio files of any formats online",
    formats: ["MP3", "WAV", "AAC", "FLAC"],
    category: "Audio"
  },
  "video-converter": {
    title: "Online Video Converter",
    description: "Convert video files of any formats online", 
    formats: ["MP4", "AVI", "MOV", "MKV"],
    category: "Video"
  },
  "archive-converter": {
    title: "Online Archive Converter",
    description: "Convert archive files of any formats online",
    formats: ["ZIP", "RAR", "7Z", "TAR"],
    category: "Archive"
  },
  "presentation-converter": {
    title: "Online Presentation Converter", 
    description: "Convert presentation files of any formats online",
    formats: ["PPT", "PPTX", "ODP", "PDF"],
    category: "Presentation"
  },
  "font-converter": {
    title: "Online Font Converter",
    description: "Convert font files of any formats online",
    formats: ["TTF", "OTF", "WOFF", "WOFF2"],
    category: "Font"
  },
  "ebook-converter": {
    title: "Online Ebook Converter",
    description: "Convert ebook files of any formats online", 
    formats: ["EPUB", "MOBI", "PDF", "AZW"],
    category: "Ebook"
  },
};

// Component that uses useSearchParams
function ConverterContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Image");
  const [search, setSearch] = useState("");

  // Get converter type from URL params
  const converterType = searchParams.get('type') as keyof typeof CONVERTER_TYPES;
  const converterInfo = converterType && CONVERTER_TYPES[converterType] 
    ? CONVERTER_TYPES[converterType] 
    : {
        title: "File Converter",
        description: "Convert your files to any format",
        formats: ["PDF", "JPG", "PNG"],
        category: "Image"
      };

  // Set active category based on converter type
  useEffect(() => {
    if (converterInfo.category) {
      setActiveCategory(converterInfo.category);
    }
  }, [converterInfo.category]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openMenuId && !target.closest('.format-select')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const totalSize = useMemo(
    () =>
      items.reduce((sum, it) => sum + (Number.isFinite(it.file.size) ? it.file.size : 0), 0),
    [items]
  );

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    // reset input to allow re-picking same file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFiles = async (files: File[]) => {
    const newItems = await Promise.all(
      files.map(async (f) => {
        // Upload file to backend
        const formData = new FormData();
        formData.append('file', f);
        
        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }
          
          const uploadData = await uploadResponse.json();
          
          // Auto-detect file format and set appropriate target format
          const fileExtension = f.name.split('.').pop()?.toLowerCase() || '';
          let targetFormat = "pdf"; // default
          
          // Set target format based on file type
          if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff", "ico", "heic", "avif"].includes(fileExtension)) {
            targetFormat = "png";
          } else if (["doc", "docx", "docm", "odt", "rtf", "txt"].includes(fileExtension)) {
            targetFormat = "pdf";
          } else if (["ai", "eps", "emf", "wmf", "sk", "fig", "cgm", "sk1", "ps"].includes(fileExtension)) {
            targetFormat = "svg";
          } else if (["mp3", "wav", "aac", "flac", "ogg", "m4a", "wma"].includes(fileExtension)) {
            targetFormat = "mp3";
          } else if (["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv"].includes(fileExtension)) {
            targetFormat = "mp4";
          } else if (["zip", "rar", "7z", "tar", "gz"].includes(fileExtension)) {
            targetFormat = "zip";
          } else if (["ppt", "pptx", "odp"].includes(fileExtension)) {
            targetFormat = "pdf";
          } else if (["ttf", "otf", "woff", "woff2"].includes(fileExtension)) {
            targetFormat = "ttf";
          } else if (["epub", "mobi", "azw3", "fb2"].includes(fileExtension)) {
            targetFormat = "pdf";
          }

          return {
            id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2)}`,
            file: f,
            targetFormat: targetFormat,
            status: "ready" as const,
            fileId: uploadData.fileId,
            downloadUrl: uploadData.downloadUrl,
          };
        } catch (error) {
          console.error('Upload error:', error);
          return {
            id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2)}`,
            file: f,
            targetFormat: "pdf",
            status: "error" as const,
          };
        }
      })
    );
    
    setItems((prev) => [...prev, ...newItems]);
    
    // Note: Don't save uploaded files to localStorage, only save converted files
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const changeFormat = (id: string, fmt: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, targetFormat: fmt } : i)));

  const convertAll = async () => {
    if (items.length === 0) return;
    setIsConverting(true);
    
    // Update all items to converting status
    setItems(prev => prev.map(item => ({ ...item, status: "converting" as const })));
    
    try {
      // Convert each file
      const convertedItems = await Promise.all(
        items.map(async (item) => {
          if (!item.fileId) {
            return { ...item, status: "error" as const };
          }
          
          try {
            const convertResponse = await fetch('/api/convert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileId: item.fileId,
                targetFormat: item.targetFormat,
                originalFileName: item.file.name,
              }),
            });
            
            if (!convertResponse.ok) {
              throw new Error('Conversion failed');
            }
            
            const convertData = await convertResponse.json();
            
            return {
              ...item,
              status: "done" as const,
              convertedFileId: convertData.convertedFileId,
              convertedDownloadUrl: convertData.downloadUrl,
            };
          } catch (error) {
            console.error('Conversion error:', error);
            return { ...item, status: "error" as const };
          }
        })
      );
      
      setItems(convertedItems);
      
      // Save only converted file IDs to localStorage (not original files)
      const convertedFileIds = convertedItems
        .filter(item => item.status === "done" && item.convertedFileId)
        .map(item => item.convertedFileId);
      
      if (convertedFileIds.length > 0) {
        const existingFiles = JSON.parse(localStorage.getItem('convertedFiles') || '[]');
        const updatedFiles = [...existingFiles, ...convertedFileIds];
        localStorage.setItem('convertedFiles', JSON.stringify(updatedFiles));
        
        console.log('Saved converted files to localStorage:', convertedFileIds);
      }
      
      // Keep user on convert page - no redirect
      console.log('Conversion completed successfully. User stays on convert page.');
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const humanSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"]; let i = 0; let n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(2)} ${units[i]}`;
  };

  const FORMAT_GROUPS = useMemo(() => ({
    Image: [
      "SVG", "ICO", "JPG", "WEBP", "JPEG", "DDS", "GIF", "CUR", "BMP", "HDR", "PSD", "TIFF", "TGA", "AVIF", "RGB", "HEIC", "XPM", "JFIF", "EXR", "HEIF", "XBM", "PGM", "RGBA", "PPM", "PCX", "WBMP", "JBG", "PICON", "G3", "MAP", "PNM", "JPE", "JP2", "PBM", "PDB", "JIF", "PAL", "YUV", "RAS", "SIXEL", "PICT", "JBIG", "PCD", "JPS", "PGX", "PFM", "FTS", "PCT", "UYVY", "XWD", "JFI", "FAX", "OTB", "RGBO", "G4", "SIX", "IPL", "SUN", "PAM", "SGI", "RGF", "MNG", "VIPS", "HRZ", "PALM", "XV", "MTV", "VIFF"
    ],
    Document: [
      "DOC", "PDF", "DOCX", "DOCM", "ODT", "XPS", "DOT", "RTF", "DOTX", "DJVU", "AW", "KWD", "DOTM", "SXW", "DBK", "ABW", "OXPS"
    ],
    Vector: [
      "SVG", "AI", "EPS", "PLT", "EMF", "WMF", "SK", "FIG", "CGM", "SK1", "PS"
    ],
    Audio: [
      "MP3", "WAV", "AAC", "FLAC", "OGG", "M4A", "AIFF", "AMR", "WMA", "OPUS", "3GA", "AAC", "AC3", "ADTS", "AU", "CAF", "EC3", "FLAC", "M4A", "M4B", "M4P", "M4R", "M4V", "MP2", "MP3", "MP4", "MPA", "MPC", "OGA", "OGG", "OPUS", "RA", "RAM", "SPX", "TTA", "WAV", "WMA", "WV"
    ],
    Video: [
      "MP4", "MOV", "MKV", "WEBM", "MPEG", "AVI", "WMV", "FLV", "3GP", "M4V", "ASF", "RM", "RMVB", "VOB", "OGV", "MTS", "M2TS", "TS", "DIVX", "XVID", "H264", "H265", "VP8", "VP9", "AV1"
    ],
    Archive: [
      "ZIP", "TAR", "7Z", "RAR", "GZ", "BZ2", "XZ", "LZ", "LZMA", "CAB", "ISO", "DMG", "PKG", "DEB", "RPM", "MSI", "APK", "IPA"
    ],
    Presentation: [
      "PPTX", "PPT", "ODP", "PDF", "KEY", "PPS", "PPSX", "POT", "POTX", "POTM", "PPSM", "PPTM"
    ],
    Font: [
      "TTF", "OTF", "WOFF", "WOFF2", "EOT", "SVG", "CFF", "AFM", "PFM", "PFB", "PFA", "BDF", "PCF", "SNF", "FNT", "FON"
    ],
    EBook: [
      "EPUB", "MOBI", "AZW3", "FB2", "PDF", "LIT", "LRF", "PDB", "TCR", "TXT", "RTF", "HTML", "CHM", "DJVU", "CBR", "CBZ"
    ],
    CAD: [
      "DXF", "DWG", "STEP", "STP", "IGES", "IGS", "SAT", "X_T", "X_B", "3DM", "3DS", "OBJ", "STL", "PLY", "FBX", "DAE", "BLEND", "MA", "MB", "MAX", "C4D", "SKP", "3DMF", "AC", "ACIS", "ANNOTATION", "AR", "ASM", "BIN", "BREP", "BRL", "BSP", "C", "C3D"
    ]
  }), []);

  const categories = useMemo(() => Object.keys(FORMAT_GROUPS), [FORMAT_GROUPS]);
  const visibleFormats = useMemo(() => {
    const list = search
      ? categories.flatMap((c) => FORMAT_GROUPS[c as keyof typeof FORMAT_GROUPS])
      : FORMAT_GROUPS[activeCategory as keyof typeof FORMAT_GROUPS] || [];
    const q = search.trim().toLowerCase();
    return q ? list.filter((x: string) => x.toLowerCase().includes(q)) : list;
  }, [activeCategory, search, FORMAT_GROUPS, categories]);

  return (
    <div className="converter-container">

      
      <div className="bg-decoration bg-decoration-1" />
      <div className="bg-decoration bg-decoration-2" />
      <div className="bg-decoration bg-decoration-3" />

      <div className="converter-content">
      <StatsBanner />
        <div className="title-section" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="main-title" style={{ 
            color: "#ff3b30", 
            fontSize: "3.5rem", 
            fontWeight: "800", 
            margin: "0 0 0.5rem 0",
            lineHeight: "1.1"
          }}>
            {converterInfo.title}
          </h1>
          <p className="subtitle" style={{ 
            fontSize: "1.2rem", 
            color: "#666", 
            margin: "0",
            fontWeight: "400"
          }}>
            {converterInfo.description}
          </p>
        </div>

        <div className="converter-card">
          {/* File list */}
          <div className="file-list">
            {items.length > 0 ? (
              <table className="file-table">
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="file-row">
                      <td className="file-meta">
                      <div style={{display: "flex"}}>
                        <span className="file-icon" style={{marginRight: "10px"}}><FileText /></span>
                        <span 
                          className="file-name" 
                          style={{marginRight: "10px"}}
                          title={it.file.name}
                        >
                          {it.file.name}
                        </span>
                        <span className="file-size">{humanSize(it.file.size)}</span>
                      </div>
                      </td>

                      <td className="file-actions">
                        <span style={{ color: "white", opacity: 0.85, marginRight: 6 }}>to</span>
                        <div className="format-select">
                          <button
                            className="format-button"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) => (prev === it.id ? null : it.id));
                            }}
                          >
                            {it.targetFormat}
                            <ChevronDown size={16} />
                          </button>
                          <div className={`format-menu${openMenuId === it.id ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
                            <div className="format-search">
                              <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search"
                              />
                            </div>
                            <div className="format-body">
                              <div className="format-categories">
                                {categories.map((cat) => (
                                  <button
                                    key={cat}
                                    className={`category${cat === activeCategory ? " active" : ""}`}
                                    onClick={() => {
                                      setActiveCategory(cat);
                                      setSearch("");
                                    }}
                                    type="button"
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                              <div className="format-grid">
                                {visibleFormats.map((fmt: string) => (
                                  <button
                                    key={fmt}
                                    className={`format-option${fmt.toLowerCase() === it.targetFormat.toLowerCase() ? " active" : ""}`}
                                    onClick={() => {
                                      changeFormat(it.id, fmt.toLowerCase());
                                      setOpenMenuId(null);
                                    }}
                                    type="button"
                                  >
                                    {fmt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className={`status-pill ${it.status}`}>
                          {it.status === "ready" && "READY"}
                          {it.status === "converting" && "CONVERTING"}
                          {it.status === "done" && "FINISHED"}
                          {it.status === "error" && "ERROR"}
                        </span>
                      </td>
                      <td className="file-remove">
                        {it.status === "done" && it.convertedDownloadUrl && (
                          <>
                            <button 
                              className="download-button" 
                              onClick={async () => {
                                try {
                                  // Try API download first
                                  const response = await fetch(`/api/download/${it.convertedFileId}`);
                                  
                                  if (response.ok) {
                                    // If API works, use it
                                    const link = document.createElement('a');
                                    link.href = `/api/download/${it.convertedFileId}`;
                                    link.download = `${it.file.name.split('.')[0]}.${it.targetFormat}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  } else {
                                    // If API fails, download from Supabase URL using fetch
                                    try {
                                      const fileResponse = await fetch(it.convertedDownloadUrl!);
                                      if (fileResponse.ok) {
                                        const blob = await fileResponse.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = `${it.file.name.split('.')[0]}.${it.targetFormat}`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                      } else {
                                        // Final fallback - open in new tab
                                        window.open(it.convertedDownloadUrl!, '_blank');
                                      }
                                    } catch (fetchError) {
                                      console.error('Fetch download error:', fetchError);
                                      // Final fallback - open in new tab
                                      window.open(it.convertedDownloadUrl!, '_blank');
                                    }
                                  }
                                } catch (error) {
                                  console.error('Download error:', error);
                                  // Fallback to direct download from Supabase URL using fetch
                                  try {
                                    const fileResponse = await fetch(it.convertedDownloadUrl!);
                                    if (fileResponse.ok) {
                                      const blob = await fileResponse.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `${it.file.name.split('.')[0]}.${it.targetFormat}`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                    } else {
                                      // Final fallback - open in new tab
                                      window.open(it.convertedDownloadUrl!, '_blank');
                                    }
                                  } catch (fetchError) {
                                    console.error('Fetch download error:', fetchError);
                                    // Final fallback - open in new tab
                                    window.open(it.convertedDownloadUrl!, '_blank');
                                  }
                                }
                              }}
                              style={{
                                background: '#007AFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginRight: '8px',
                                cursor: 'pointer'
                              }}
                            >
                              Download
                            </button>
                            <button 
                              className="share-button" 
                              onClick={() => window.location.href = `/download/${it.convertedFileId}`}
                              style={{
                                background: '#34C759',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginRight: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Share2 size={12} />
                              Share
                            </button>
                          </>
                        )}
                        <button className="remove-button" onClick={() => removeItem(it.id)} type="button">
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="upload-area" onClick={() => fileInputRef.current?.click()} onDrop={onDrop} onDragOver={onDragOver}>
                <div className="upload-icon">
                  <Plus size={32} />
                </div>
                <div className="upload-text">
                  <span className="drag-text">Drag and drop your files here</span>
                  <span className="or-text">or click to browse</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={onPick}
                />
              </div>
            )}
          </div>

          {/* Only show bulk actions when files are uploaded */}
          {items.length > 0 && (
            <>
              <div className="bulk-bar">
                <Button variant="ghost" className="format-button ghost" onClick={() => fileInputRef.current?.click()}>
                  <Plus /> Add more files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={onPick}
                />
                <div className="spacer" />
                <div className="totals">{items.length} file(s) • {humanSize(totalSize)}</div>
              </div>

              <div className="footer-bar dark-grid" onDrop={onDrop} onDragOver={onDragOver}>
                <div className="footer-inner">
                  <Button variant="ghost" className="footer-add" onClick={() => fileInputRef.current?.click()}>
                    <Plus /> Add more files
                  </Button>
                  <div className="footer-hint">Use Ctrl or Shift to add several files at once</div>
                  <Button className="footer-convert" onClick={convertAll} disabled={items.length === 0 || isConverting}>
                    Convert <ArrowRight />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <FeaturesSection />
        <RatingSection />
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ConverterLoading() {
  return (
    <div className="converter-container">
      <div className="converter-content">
        <div className="converter-header">
          <h1>Loading...</h1>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function ConverterPage() {
  return (
    <Suspense fallback={<ConverterLoading />}>
      <ConverterContent />
    </Suspense>
  );
}