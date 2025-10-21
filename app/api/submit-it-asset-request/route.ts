import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const generateRequestId = (): string => {
  const timestamp = Date.now();
  return `REQ-${timestamp}`;
};

const getManillaTime = (): string => {
  const now = new Date();
  const manilaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  return manilaTime.toLocaleString('en-PH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, department, asset, reason, signature } = body;

    console.log('IT Asset Request received:', { name, email, department, asset, reason });

    // Validation
    if (!name || !email || !department || !asset || !reason || !signature) {
      return NextResponse.json(
        { success: false, message: 'All fields including email and signature are required' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const requestId = generateRequestId();
    const timestamp = getManillaTime();

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        universe_domain: 'googleapis.com',
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Create signature reference - store only a hash to avoid exceeding Google Sheets cell limit (50k chars)
    // Full base64 can be hundreds of KB
    let signatureRef = 'Signed';
    if (signature && signature.startsWith('data:')) {
      // It's a base64 image, just store a reference
      signatureRef = `Signed-${new Date().getTime()}`;
      console.log('Signature data received (base64 format, size:', Math.round(signature.length / 1024), 'KB)');
    } else if (signature) {
      // It's typed or uploaded, store as-is
      signatureRef = signature.substring(0, 100); // Limit length
    }

    // Prepare data for Google Sheets
    const values = [[requestId, name, email, department, asset, reason, signatureRef, 'Pending', timestamp]];

    const sheetId = process.env.GOOGLE_SHEET_ID_IT_ASSETS;
    
    console.log('Appending to sheet:', sheetId);

    // Append data to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('Successfully appended to Google Sheet:', response.data);

    return NextResponse.json(
      {
        success: true,
        message: 'IT Asset Request submitted successfully',
        requestId,
        timestamp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting IT Asset Request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit IT Asset Request' },
      { status: 500 }
    );
  }
}
