import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const tempDir = join(process.cwd(), 'temp');
    
    // Get all files in temp directory
    const files = await readdir(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = join(tempDir, file);
      const stats = await stat(filePath);
      
      // Delete files older than 24 hours
      if (now - stats.mtime.getTime() > maxAge) {
        await unlink(filePath);
        deletedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} expired files`
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup files' },
      { status: 500 }
    );
  }
}
