# Security & Authentication Setup

## Changing Username and Password

The dashboard is protected with authentication. Only you can change the credentials by following these steps:

### Step 1: Locate the `.env.local` file
This file is in the root directory of your project. If it doesn't exist, copy from `.env.local.example`:
```bash
cp .env.local.example .env.local
```

### Step 2: Edit the credentials
Open `.env.local` in any text editor and update these lines:

```env
DASHBOARD_USERNAME=your_new_username
DASHBOARD_PASSWORD=your_new_secure_password
```

**Example:**
```env
DASHBOARD_USERNAME=john_admin
DASHBOARD_PASSWORD=MySecureP@ssw0rd123!
```

### Step 3: Restart the development server
After changing credentials, restart the Next.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

## Security Best Practices

1. **Use a strong password**: Include uppercase, lowercase, numbers, and special characters
2. **Keep `.env.local` private**: Never commit this file to Git (it's already in `.gitignore`)
3. **Change default credentials**: The default username is `admin` - change it immediately
4. **Don't share credentials**: Keep your login details confidential

## How Authentication Works

- **Login Page**: Users must enter username and password to access the dashboard
- **Session-based**: Authentication persists in the browser session
- **Logout**: Click the logout button in the top navigation to sign out
- **Protected Routes**: All dashboard pages require authentication

## Default Credentials (CHANGE THESE!)

```
Username: admin
Password: your_secure_password_here
```

⚠️ **IMPORTANT**: Change these default credentials in your `.env.local` file before deploying to production!

## Troubleshooting

**Can't login?**
1. Check that `.env.local` exists in your project root
2. Verify the username and password match what's in `.env.local`
3. Restart your development server after changing credentials
4. Clear your browser cache and try again

**Forgot password?**
Since you control the `.env.local` file, you can always reset it by editing the file directly.

