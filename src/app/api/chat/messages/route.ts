import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const roomId = searchParams.get('room_id');

    if (!userId && !roomId) {
      return NextResponse.json({ error: 'User ID or Room ID is required' }, { status: 400 });
    }

    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (userId) {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    } else if (roomId) {
      query = query.or(`sender_id.eq.${roomId},receiver_id.eq.${roomId}`);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error in messages API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sender_id, message, receiver_id, is_admin = false } = await request.json();

    if (!sender_id || !message) {
      return NextResponse.json({ 
        error: 'Sender ID and message are required' 
      }, { status: 400 });
    }

    let finalReceiverId = receiver_id;

    // If it's a user sending a message and no receiver_id is specified, find an admin
    if (!is_admin && !finalReceiverId) {
      const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
      if (adminUserId) {
        finalReceiverId = adminUserId;
      } else {
        const { data: adminUsers, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .or('role.eq.admin,user_metadata->>user_type.eq.admin')
          .limit(1);

        if (adminError || !adminUsers || adminUsers.length === 0) {
          console.error('No admin user found:', adminError);
          return NextResponse.json({ error: 'No admin available to receive messages' }, { status: 500 });
        }
        finalReceiverId = adminUsers[0].id;
      }
    } else if (is_admin && !finalReceiverId) {
      return NextResponse.json({ error: 'receiver_id is required for admin messages' }, { status: 400 });
    }

    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
        sender_id,
        receiver_id: finalReceiverId,
        content: message,
        is_admin_message: is_admin
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message: newMessage });
  } catch (error: any) {
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
