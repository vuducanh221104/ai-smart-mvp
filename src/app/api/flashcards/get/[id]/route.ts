import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!id) {
      return NextResponse.json(
        { error: 'Flashcard set ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServer();

    // Get flashcard set with flashcards data (only for the user)
    const { data: flashcardSet, error: setError } = await supabase
      .from('flashcard_sets')
      .select(`
        id,
        user_id,
        title,
        language,
        card_count,
        data,
        created_at
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (setError) {
      console.error('Error fetching flashcard set:', setError);
      return NextResponse.json(
        { error: 'Flashcard set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcardSet: {
        ...flashcardSet,
        flashcards: flashcardSet.data || []
      }
    });

  } catch (error) {
    console.error('Get flashcard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
