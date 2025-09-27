import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('is_admin') === 'true';
    const userId = searchParams.get('user_id');

    if (isAdmin) {
      // Admin can see all chat rooms (represented by unique user_ids in messages)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, created_at')
        .or(`sender_id.eq.${process.env.NEXT_PUBLIC_ADMIN_USER_ID},receiver_id.eq.${process.env.NEXT_PUBLIC_ADMIN_USER_ID}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages for admin rooms:', error);
        return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
      }

      const uniqueUserIds = new Set<string>();
      const rooms: { id: string; last_message_at: string; user_id: string }[] = [];

      messages.forEach(msg => {
        const otherUserId = msg.sender_id === process.env.NEXT_PUBLIC_ADMIN_USER_ID ? msg.receiver_id : msg.sender_id;
        if (otherUserId && !uniqueUserIds.has(otherUserId)) {
          uniqueUserIds.add(otherUserId);
          rooms.push({
            id: otherUserId,
            user_id: otherUserId,
            last_message_at: msg.created_at
          });
        }
      });

      // Fetch user_metadata for each user_id to get email/name
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', Array.from(uniqueUserIds));

      if (usersError) {
        console.error('Error fetching user profiles for admin rooms:', usersError);
      }

      const roomsWithUserDetails = rooms.map(room => {
        const userProfile = usersData?.find(u => u.id === room.user_id);
        return {
          ...room,
          user_email: userProfile?.email || `User ${room.user_id.substring(0, 8)}`,
          user_name: userProfile?.full_name || `User ${room.user_id.substring(0, 8)}`,
          status: 'open',
          messages: []
        };
      }).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

      return NextResponse.json({ rooms: roomsWithUserDetails });

    } else {
      // User can only see their own chat room (id = userId)
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      const room = {
        id: userId,
        user_id: userId,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: []
      };
      return NextResponse.json({ room });
    }
  } catch (error: any) {
    console.error('Error in chat rooms API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const room = {
      id: user_id,
      user_id: user_id,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
    };

    return NextResponse.json({ room });
  } catch (error: any) {
    console.error('Error in create chat room API:', error);
    return NextResponse.json(
      { error: `Failed to create chat room: ${error.message}` },
      { status: 500 }
    );
  }
}
