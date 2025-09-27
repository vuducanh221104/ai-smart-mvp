const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@fileconverter.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        user_type: 'admin',
        full_name: 'Admin User'
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: admin@fileconverter.com');
    console.log('Password: admin123456');
    console.log('User ID:', data.user.id);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();
