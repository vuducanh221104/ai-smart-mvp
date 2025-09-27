import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { flashcards, title, language, userId } = await request.json();

    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json(
        { error: 'Invalid flashcards data' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Create flashcard set with flashcards data in jsonb column
    const { data: flashcardSet, error: setError } = await supabase
      .from('flashcard_sets')
      .insert({
        user_id: userId,
        title: title,
        language: language || 'English',
        card_count: flashcards.length,
        data: flashcards, // Store flashcards as jsonb
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (setError) {
      console.error('Error creating flashcard set:', setError);
      return NextResponse.json(
        { error: 'Failed to create flashcard set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcardSet: {
        id: flashcardSet.id,
        title: flashcardSet.title,
        language: flashcardSet.language,
        card_count: flashcardSet.card_count,
        created_at: flashcardSet.created_at
      }
    });

  } catch (error) {
    console.error('Save flashcards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
