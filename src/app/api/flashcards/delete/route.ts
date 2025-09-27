import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const { setId, userId } = await request.json();

    if (!setId || !userId) {
      return NextResponse.json(
        { error: 'Set ID and User ID are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // First, verify the user owns this flashcard set
    const { data: flashcardSet, error: verifyError } = await supabase
      .from('flashcard_sets')
      .select('id, user_id')
      .eq('id', setId)
      .eq('user_id', userId)
      .single();

    if (verifyError || !flashcardSet) {
      return NextResponse.json(
        { error: 'Flashcard set not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the flashcard set (flashcards are stored in data column)
    const { error: setError } = await supabase
      .from('flashcard_sets')
      .delete()
      .eq('id', setId);

    if (setError) {
      console.error('Error deleting flashcard set:', setError);
      return NextResponse.json(
        { error: 'Failed to delete flashcard set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Flashcard set deleted successfully'
    });

  } catch (error) {
    console.error('Delete flashcard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
