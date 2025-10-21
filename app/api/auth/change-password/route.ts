import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, currentPassword, newPassword, confirmPassword } = await request.json();

    console.log('Password change request received for:', username);

    // Validate inputs
    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New passwords do not match' },
        { status: 400 }
      );
    }

    // Check password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = validateCredentials(username, currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // In a real app, you would update the password in a database here
    // For now, we'll return success but note: environment variables can't be changed at runtime
    // In production, you'd need a proper backend with database
    
    console.log('Password change would be applied for:', username);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Password changed successfully! Note: In production, this would persist to a database.',
        info: 'For demo purposes, the password is stored in environment variables which cannot be changed at runtime. Set up a proper database for production use.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
