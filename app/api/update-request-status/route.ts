import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const getStatusMessage = (status: string): string => {
  switch (status) {
    case 'Approved':
      return 'Your IT asset request has been APPROVED. Your item will be delivered soon!';
    case 'Declined':
      return 'Your IT asset request has been DECLINED. Please contact IT for more information.';
    case 'In Process':
      return 'Your IT asset request is IN PROCESS. We are working on your request.';
    default:
      return `Your IT asset request status has been updated to: ${status}`;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { requestId, name, email, asset, status } = await request.json();

    console.log('Status update request:', { requestId, name, email, status });

    // Validation
    if (!requestId || !name || !email || !asset || !status) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Update status in Google Sheets
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

    // Get all rows to find the matching request ID
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:I',
    });

    const rows = getResponse.data.values || [];
    let rowIndex = -1;

    // Find the row with matching request ID (skip header row)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === requestId) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Request not found in database' },
        { status: 404 }
      );
    }

    // Update the status column (column H, which is index 7)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!H${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]],
      },
    });

    console.log(`Status updated in Google Sheets for ${requestId}`);

    // Send email notification via EmailJS
    const emailContent = {
      to: email,
      subject: `IT Asset Request Update - ${asset} - Status: ${status}`,
      body: `
Dear ${name},

${getStatusMessage(status)}

Request Details:
- Request ID: ${requestId}
- Asset: ${asset}
- Status: ${status}

If you have any questions, please contact the IT Department.

Best regards,
IT Department
      `.trim(),
    };

    console.log('Email to be sent:', emailContent);

    // Send email using EmailJS API
    if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
      try {
        const emailJsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: {
              to_email: email,
              to_name: name,
              subject: emailContent.subject,
              message: emailContent.body,
            },
          }),
        });

        const emailJsData = await emailJsResponse.json();
        console.log('EmailJS response:', emailJsData);

        if (emailJsResponse.ok) {
          console.log('Email sent successfully via EmailJS');
        } else {
          console.error('EmailJS error:', emailJsData);
        }
      } catch (emailError) {
        console.error('Error sending email via EmailJS:', emailError);
        // Continue anyway - status was still updated in sheet
      }
    } else {
      console.log('EmailJS credentials not configured. Email not sent (demo mode)');
    }

    return NextResponse.json(
      {
        success: true,
        message: `Status updated to ${status} and saved to database. Email sent to ${email}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update status and send email' },
      { status: 500 }
    );
  }
}
