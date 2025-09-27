import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMP_BUCKET = 'temp';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // 1. Find file in storage
    const { data: files, error: listError } = await supabase
      .storage
      .from(TEMP_BUCKET)
      .list('', {
        limit: 1,
        search: id
      });

    if (listError || !files?.length) {
      console.error('Error finding file:', listError);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = files[0];

    // 2. Get file metadata from database if exists
    const { data: fileRecord, error: dbError } = await supabase
      .from('temp_files')
      .select('*')
      .eq('id', id)
      .single();

    // 3. Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(TEMP_BUCKET)
      .getPublicUrl(file.name);

    // 4. Return file info
    return NextResponse.json({
      fileId: id,
      fileName: fileRecord?.original_name || file.name,
      fileSize: file.metadata?.size || '0',
      fileType: file.metadata?.mimetype || 'application/octet-stream',
      downloadUrl: publicUrl,
      status: 'ready',
      createdAt: file.created_at,
      expiresAt: fileRecord?.expires_at || null
    });

  } catch (error) {
    console.error('Error getting file info:', error);
    return NextResponse.json(
      { error: 'Failed to get file info' },
      { status: 500 }
    );
  }
}
