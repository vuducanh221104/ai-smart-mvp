import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServer();

    // Get flashcard sets for the user
    const { data: flashcardSets, error } = await supabase
      .from('flashcard_sets')
      .select(`
        id,
        title,
        language,
        card_count,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flashcard sets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch flashcard sets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcardSets: flashcardSets || []
    });

  } catch (error) {
    console.error('List flashcards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
