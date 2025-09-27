# hCaptcha Setup Instructions

## 1. Configure hCaptcha in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings** → **Bot and Abuse Protection**
3. Enable **CAPTCHA protection**
4. Select **hCaptcha** as the provider
5. Enter your hCaptcha **Secret Key** (you'll need to get this from hCaptcha dashboard)
6. Click **Save**

## 2. Get hCaptcha Secret Key

1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
2. Sign in to your account
3. Go to **Settings** → **General**
4. Copy the **Secret Key** (not the Site Key)
5. Paste this secret key in the Supabase dashboard

## 3. Site Key Already Configured

The site key `4b828452-6cde-4c44-b5f6-4e40df305a62` is already configured in the frontend components.

## 4. Testing

- The hCaptcha widget will appear on both login and register pages
- Users must complete the captcha before they can submit the form
- The captcha token is automatically included in the authentication request
- If captcha fails, users will see an error message

## 5. Local Development

For local development, you may need to:
1. Add `localhost` to your hCaptcha site's domain list
2. Or use a tool like ngrok to expose your local server

## 6. Features Implemented

✅ hCaptcha component with proper error handling
✅ Integration with login page
✅ Integration with register page  
✅ Form validation (captcha required before submission)
✅ Error messages for captcha failures
✅ Automatic captcha reset after form submission
✅ Theme support (light/dark mode)

## 7. Security Benefits

- Prevents automated bot attacks
- Protects against brute force login attempts
- Reduces spam registrations
- Complies with Supabase security best practices
