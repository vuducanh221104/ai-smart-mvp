import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMP_BUCKET = 'temp';

// Helper function to get content type based on file format
function getContentType(format: string): string {
  const formatLower = format.toLowerCase();
  
  // Image formats
  if (['jpg', 'jpeg'].includes(formatLower)) return 'image/jpeg';
  if (['png'].includes(formatLower)) return 'image/png';
  if (['gif'].includes(formatLower)) return 'image/gif';
  if (['webp'].includes(formatLower)) return 'image/webp';
  if (['svg'].includes(formatLower)) return 'image/svg+xml';
  if (['bmp'].includes(formatLower)) return 'image/bmp';
  if (['tiff', 'tif'].includes(formatLower)) return 'image/tiff';
  if (['ico'].includes(formatLower)) return 'image/x-icon';
  if (['heic'].includes(formatLower)) return 'image/heic';
  if (['avif'].includes(formatLower)) return 'image/avif';
  
  // Document formats
  if (['pdf'].includes(formatLower)) return 'application/pdf';
  if (['doc'].includes(formatLower)) return 'application/msword';
  if (['docx'].includes(formatLower)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (['docm'].includes(formatLower)) return 'application/vnd.ms-word.document.macroEnabled.12';
  if (['odt'].includes(formatLower)) return 'application/vnd.oasis.opendocument.text';
  if (['rtf'].includes(formatLower)) return 'application/rtf';
  if (['txt'].includes(formatLower)) return 'text/plain';
  
  // Vector formats
  if (['ai'].includes(formatLower)) return 'application/postscript';
  if (['eps'].includes(formatLower)) return 'application/postscript';
  if (['ps'].includes(formatLower)) return 'application/postscript';
  if (['emf'].includes(formatLower)) return 'application/x-msmetafile';
  if (['wmf'].includes(formatLower)) return 'application/x-msmetafile';
  
  // Audio formats
  if (['mp3'].includes(formatLower)) return 'audio/mpeg';
  if (['wav'].includes(formatLower)) return 'audio/wav';
  if (['aac'].includes(formatLower)) return 'audio/aac';
  if (['flac'].includes(formatLower)) return 'audio/flac';
  if (['ogg'].includes(formatLower)) return 'audio/ogg';
  if (['m4a'].includes(formatLower)) return 'audio/mp4';
  if (['wma'].includes(formatLower)) return 'audio/x-ms-wma';
  
  // Video formats
  if (['mp4'].includes(formatLower)) return 'video/mp4';
  if (['avi'].includes(formatLower)) return 'video/x-msvideo';
  if (['mov'].includes(formatLower)) return 'video/quicktime';
  if (['mkv'].includes(formatLower)) return 'video/x-matroska';
  if (['webm'].includes(formatLower)) return 'video/webm';
  if (['flv'].includes(formatLower)) return 'video/x-flv';
  if (['wmv'].includes(formatLower)) return 'video/x-ms-wmv';
  
  // Archive formats
  if (['zip'].includes(formatLower)) return 'application/zip';
  if (['rar'].includes(formatLower)) return 'application/x-rar-compressed';
  if (['7z'].includes(formatLower)) return 'application/x-7z-compressed';
  if (['tar'].includes(formatLower)) return 'application/x-tar';
  if (['gz'].includes(formatLower)) return 'application/gzip';
  
  // Font formats
  if (['ttf'].includes(formatLower)) return 'font/ttf';
  if (['otf'].includes(formatLower)) return 'font/otf';
  if (['woff'].includes(formatLower)) return 'font/woff';
  if (['woff2'].includes(formatLower)) return 'font/woff2';
  
  // Ebook formats
  if (['epub'].includes(formatLower)) return 'application/epub+zip';
  if (['mobi'].includes(formatLower)) return 'application/x-mobipocket-ebook';
  if (['azw3'].includes(formatLower)) return 'application/vnd.amazon.ebook';
  
  // Default fallback
  return `application/${formatLower}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, targetFormat, originalFileName } = body;

    if (!fileId || !targetFormat) {
      return NextResponse.json({ 
        error: 'Missing required fields: fileId and targetFormat' 
      }, { status: 400 });
    }

    console.log('Converting file:', { fileId, targetFormat, originalFileName });

    // 1. Get file info from storage
    const { data: files, error: listError } = await supabase
      .storage
      .from(TEMP_BUCKET)
      .list('', {
        limit: 1,
        search: fileId
      });

    if (listError || !files?.length) {
      console.error('Error finding source file:', listError);
      return NextResponse.json({ error: 'Source file not found' }, { status: 404 });
    }

    const sourceFile = files[0];

    // 2. Download the source file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from(TEMP_BUCKET)
      .download(sourceFile.name);

    if (downloadError || !fileData) {
      console.error('Error downloading source file:', downloadError);
      return NextResponse.json({ error: 'Failed to download source file' }, { status: 500 });
    }

    // 3. Generate converted file name
    const convertedFileId = randomUUID();
    const convertedFileName = `${convertedFileId}.${targetFormat.toLowerCase()}`;
    
    console.log('Generated converted file name:', convertedFileName);
    
    // 4. Convert file using appropriate method
    let convertedFileData = fileData;
    
    // Get source file extension
    const sourceExtension = sourceFile.name.split('.').pop()?.toLowerCase() || '';
    
    // For now, we'll implement basic conversion logic
    // In a real implementation, you would use libraries like:
    // - Sharp for image conversion
    // - LibreOffice for document conversion
    // - FFmpeg for audio/video conversion
    // - etc.
    
    try {
      // Basic conversion logic based on file types
      if (sourceExtension !== targetFormat.toLowerCase()) {
        // TODO: Implement actual conversion using appropriate libraries
        // For now, we'll just copy the file but with the new extension
        console.log(`Converting ${sourceExtension} to ${targetFormat}`);
        
        // In a real implementation, you would:
        // 1. Detect the source format
        // 2. Use appropriate conversion library
        // 3. Convert to target format
        // 4. Return converted file data
        
        // For demo purposes, we'll just copy the file
        convertedFileData = fileData;
      }
    } catch (conversionError) {
      console.error('Conversion error:', conversionError);
      return NextResponse.json({ 
        error: 'Failed to convert file format' 
      }, { status: 500 });
    }

    // 5. Upload converted file
    const { error: uploadError } = await supabase
      .storage
      .from(TEMP_BUCKET)
      .upload(convertedFileName, convertedFileData, {
        contentType: getContentType(targetFormat),
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Error uploading converted file:', uploadError);
      return NextResponse.json({ error: 'Failed to save converted file' }, { status: 500 });
    }
    
    console.log('Successfully uploaded converted file:', convertedFileName);

    // 6. Get public URL for the converted file
    const { data: { publicUrl } } = supabase
      .storage
      .from(TEMP_BUCKET)
      .getPublicUrl(convertedFileName);

    // 7. Update conversion stats
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileSize: fileData.size
        })
      });
    } catch (statsError) {
      console.error('Error updating stats:', statsError);
      // Don't fail the conversion if stats update fails
    }

    // 8. Return the result
    return NextResponse.json({
      success: true,
      convertedFileId,
      downloadUrl: publicUrl,
      originalFile: {
        id: fileId,
        name: originalFileName
      }
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to convert file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}