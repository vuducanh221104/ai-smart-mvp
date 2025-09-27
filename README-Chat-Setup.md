# Chat System Setup Instructions

## 1. Database Setup

The chat system requires the following database tables. Run these SQL commands in your Supabase SQL Editor:

### Create chat_messages table:
```sql
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chat rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Users can send messages to their chat rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can send messages to any chat room" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
    )
  );
```

## 2. Create Admin User

### Method 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Fill in the details:
   - Email: `admin@fileconverter.com`
   - Password: `admin123456`
   - Auto Confirm User: ✅ (checked)
5. In the **Raw User Meta Data** field, add:
   ```json
   {
     "user_type": "admin",
     "full_name": "Admin User"
   }
   ```
6. Click **Create User**

### Method 2: Using the Script
Run the admin creation script:
```bash
cd /Users/vuducanh/PJ-MVP/pj-mvp-web
node scripts/create-admin.js
```

## 3. Features Implemented

### ✅ User Chat Component
- **Floating chat button** in bottom-right corner
- **Real-time messaging** with Supabase subscriptions
- **Glassmorphism design** with theme support
- **Minimize/maximize** functionality
- **Auto-scroll** to latest messages

### ✅ Admin Chat Page
- **Admin-only access** with role checking
- **List of all chat rooms** from users
- **Real-time message updates**
- **Status indicators** (open/closed/resolved)
- **User information display**
- **Responsive design** with theme support

### ✅ API Routes
- **GET /api/chat/rooms** - Get chat rooms (user or admin)
- **POST /api/chat/rooms** - Create new chat room
- **GET /api/chat/messages** - Get messages for a room
- **POST /api/chat/messages** - Send new message

### ✅ Security Features
- **Row Level Security (RLS)** policies
- **User role checking** (admin vs regular user)
- **Authentication required** for all operations
- **Proper data isolation** between users

## 4. Usage

### For Regular Users:
1. **Login** to your account
2. **Click the chat button** (blue circle with message icon) in bottom-right
3. **Start typing** your message
4. **Send messages** to admin
5. **Receive real-time responses** from admin

### For Admin Users:
1. **Login** with admin account (`admin@fileconverter.com`)
2. **Click User dropdown** in header
3. **Select "Admin Chat"** from dropdown
4. **View all user conversations** in sidebar
5. **Click on any conversation** to respond
6. **Send real-time responses** to users

## 5. Admin Account Details
- **Email**: `admin@fileconverter.com`
- **Password**: `admin123456`
- **Role**: `admin` (in user metadata)

## 6. Real-time Features
- **Instant message delivery** using Supabase subscriptions
- **Live updates** without page refresh
- **Typing indicators** (can be added later)
- **Message status** tracking

## 7. Theme Support
- **Light/Dark mode** compatibility
- **Consistent styling** with existing design
- **Glassmorphism effects** throughout
- **Responsive design** for all screen sizes

The chat system is now ready to use! 🎉
