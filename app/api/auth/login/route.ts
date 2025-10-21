import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt received');
    console.log('Username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = validateCredentials(username, password);

    if (isValid) {
      console.log('Login successful');
      return NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );
    } else {
      console.log('Login failed - invalid credentials');
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}