import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ 
        error: 'Email, password, and full name are required' 
      }, { status: 400 });
    }

    // Create user with admin role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        user_type: 'admin'
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return NextResponse.json({ 
        error: `Failed to create admin user: ${authError.message}` 
      }, { status: 500 });
    }

    // Update profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        role: 'admin',
        display_name: fullName
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json({ 
        error: `Failed to update profile: ${profileError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        role: 'admin'
      }
    });

  } catch (error: any) {
    console.error('Error in create admin API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
