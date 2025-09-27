import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMP_BUCKET = 'temp';

// Helper function to get content type from file extension
function getContentTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase();
  
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'bmp': return 'image/bmp';
    case 'tiff':
    case 'tif': return 'image/tiff';
    case 'ico': return 'image/x-icon';
    case 'heic': return 'image/heic';
    case 'avif': return 'image/avif';
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt': return 'text/plain';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'mp4': return 'video/mp4';
    case 'zip': return 'application/zip';
    default: return 'application/octet-stream';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('Download request for file ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // 1. Try to find file by exact name first (convertedFileId.extension)
    let file = null;
    let listError = null;
    
    // First try to find by exact filename
    const { data: files, error: searchError } = await supabase
      .storage
      .from(TEMP_BUCKET)
      .list('', {
        limit: 1000 // Get more files to search through
      });

    if (searchError) {
      console.error('Error listing files:', searchError);
      return NextResponse.json({ error: 'Failed to access storage' }, { status: 500 });
    }

    // Find file that starts with the ID
    file = files?.find(f => f.name.startsWith(id));
    
    console.log('Found files:', files?.map(f => f.name));
    console.log('Looking for file starting with:', id);
    console.log('Found file:', file?.name);
    
    // If not found by startsWith, try exact match
    if (!file) {
      file = files?.find(f => f.name === id);
      console.log('Trying exact match, found:', file?.name);
    }
    
    // If still not found, try to find by UUID pattern
    if (!file) {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      if (uuidPattern.test(id)) {
        file = files?.find(f => f.name.startsWith(id));
        console.log('Trying UUID pattern match, found:', file?.name);
      }
    }
    
    if (!file) {
      console.error('File not found with ID:', id);
      console.error('Available files:', files?.map(f => f.name));
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 2. Get file metadata from database if exists
    const { data: fileRecord, error: dbError } = await supabase
      .from('temp_files')
      .select('*')
      .eq('id', id)
      .single();

    // 3. Download the file data
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from(TEMP_BUCKET)
      .download(file.name);

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError);
      console.error('File name:', file.name);
      console.error('File size:', file.metadata?.size);
      
      // Try to get public URL as fallback
      const { data: { publicUrl } } = supabase
        .storage
        .from(TEMP_BUCKET)
        .getPublicUrl(file.name);
      
      console.log('Fallback public URL:', publicUrl);
      
      return NextResponse.json({ 
        error: 'Failed to download file',
        fallbackUrl: publicUrl,
        fileName: file.name
      }, { status: 500 });
    }

    // 4. Convert blob to buffer
    const buffer = await fileData.arrayBuffer();
    
    // Check if buffer is empty
    if (buffer.byteLength === 0) {
      console.error('File buffer is empty for file:', file.name);
      return NextResponse.json({ error: 'File is empty' }, { status: 500 });
    }
    
    console.log('File buffer size:', buffer.byteLength, 'bytes');
    
    // 5. Get file name for download
    // Extract original filename from the converted file name
    const fileExtension = file.name.split('.').pop() || '';
    const originalFileName = fileRecord?.original_name || `converted_file.${fileExtension}`;
    const fileName = originalFileName.includes('.') ? originalFileName : `${originalFileName}.${fileExtension}`;
    
    // 6. Get content type
    const contentType = file.metadata?.mimetype || getContentTypeFromExtension(fileExtension);
    
    console.log('Downloading file:', fileName, 'Content-Type:', contentType);

    // 7. Return file with proper headers for download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
