import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        universe_domain: 'googleapis.com',
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID_IT_ASSETS;

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:I',
    });

    const rows = response.data.values || [];
    
    // Skip header row
    const requests = rows.slice(1).map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      department: row[3] || '',
      asset: row[4] || '',
      reason: row[5] || '',
      signature: row[6] || '',
      status: row[7] || 'Pending',
      timestamp: row[8] || '',
    }));

    return NextResponse.json(
      {
        success: true,
        requests: requests.filter(r => r.id), // Filter out empty rows
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch requests from Google Sheets' },
      { status: 500 }
    );
  }
}
