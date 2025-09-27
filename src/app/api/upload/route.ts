import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMP_BUCKET = 'temp';

async function ensureTempBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const tempBucket = buckets?.find(b => b.name === TEMP_BUCKET);

    if (!tempBucket) {
      const { error } = await supabase.storage.createBucket(TEMP_BUCKET, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['*/*']
      });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error ensuring temp bucket:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Ensure temp bucket exists
    await ensureTempBucket();

    // 2. Get file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Generate unique file ID and path with custom format
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileId = `z${timestamp}_${randomId}`;
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${fileId}.${fileExtension}`;

    console.log('Processing upload:', {
      originalName: file.name,
      size: file.size,
      type: file.type,
      targetPath: fileName
    });

    // 4. Upload file to Supabase Storage
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase
      .storage
      .from(TEMP_BUCKET)
      .upload(fileName, bytes, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // 5. Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(TEMP_BUCKET)
      .getPublicUrl(fileName);

    // 6. Save file info to database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const { error: dbError } = await supabase
      .from('temp_files')
      .insert({
        id: fileId,
        file_path: fileName,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        bucket_name: TEMP_BUCKET,
        expires_at: expiresAt.toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database insert fails
      // The file is still available in storage
    }

    // 7. Update conversion stats (count uploads as conversions)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileSize: file.size
        })
      });
    } catch (statsError) {
      console.error('Error updating stats:', statsError);
      // Don't fail the upload if stats update fails
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      downloadUrl: publicUrl,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}