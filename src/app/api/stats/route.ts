import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get all files from the storage bucket
    const { data: files, error } = await supabase.storage
      .from('temp') // Using temp bucket where files are stored
      .list('', {
        limit: 1000, // Adjust based on your needs
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error fetching files from storage:', error);
      return NextResponse.json(
        { error: 'Failed to fetch files from storage' },
        { status: 500 }
      );
    }

    // Calculate total files and size
    let totalFiles = 0;
    let totalSize = 0;

    // If we have files, calculate stats
    if (files && files.length > 0) {
      totalFiles = files.length;
      
      // Get file metadata to calculate total size
      for (const file of files) {
        try {
          const { data: fileData, error: fileError } = await supabase.storage
            .from('temp')
            .download(file.name);

          if (!fileError && fileData) {
            totalSize += fileData.size;
          }
        } catch (err) {
          console.error(`Error getting size for file ${file.name}:`, err);
        }
      }
    }

    // Get stats from database (preferred method)
    const { data: conversionStats, error: statsError } = await supabase
      .from('conversion_stats')
      .select('total_files, total_size')
      .single();

    // If we have database stats, use them (more accurate and efficient)
    if (!statsError && conversionStats) {
      return NextResponse.json({
        totalFiles: conversionStats.total_files || 0,
        totalSize: conversionStats.total_size || 0
      });
    }

    // If no database stats exist, initialize with default values
    if (statsError && statsError.code === 'PGRST116') {
      const defaultStats = {
        total_files: 0,
        total_size: 0
      };

      // Insert default stats
      const { error: insertError } = await supabase
        .from('conversion_stats')
        .insert(defaultStats);

      if (insertError) {
        console.error('Error inserting default stats:', insertError);
      }

      return NextResponse.json(defaultStats);
    }

    // Fallback to calculated stats from storage if database fails
    return NextResponse.json({
      totalFiles,
      totalSize
    });

  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to update stats when a file is converted
export async function POST(request: NextRequest) {
  try {
    const { fileSize } = await request.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use RPC function to atomically update stats
    const { data, error } = await supabase.rpc('increment_conversion_stats', {
      file_size_to_add: fileSize
    });

    if (error) {
      console.error('Error updating stats:', error);
      return NextResponse.json(
        { error: 'Failed to update stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      newStats: data 
    });
  } catch (error) {
    console.error('Error in stats update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
