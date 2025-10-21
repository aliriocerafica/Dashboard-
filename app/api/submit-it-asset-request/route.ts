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
    const { name, department, asset, reason, signature } = body;

    console.log('IT Asset Request received:', { name, department, asset, reason });

    // Validation
    if (!name || !department || !asset || !reason || !signature) {
      return NextResponse.json(
        { success: false, message: 'All fields including signature are required' },
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

    // Prepare data for Google Sheets
    const values = [[requestId, name, department, asset, reason, signature, 'Pending', timestamp]];

    const sheetId = process.env.GOOGLE_SHEET_ID_IT_ASSETS;
    
    console.log('Appending to sheet:', sheetId);

    // Append data to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:H',
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
