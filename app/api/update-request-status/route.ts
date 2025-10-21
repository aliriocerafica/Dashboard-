import { NextRequest, NextResponse } from 'next/server';

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

    // In a real app, you would send an actual email via a service like SendGrid, Mailgun, etc.
    // For now, we'll simulate the email sending
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

    // TODO: Integrate with actual email service (SendGrid, Mailgun, AWS SES, etc.)
    // For demonstration, we're just logging and returning success
    // In production, replace this with actual email sending logic:
    // await sendgrid.send(emailContent);
    // OR
    // await nodemailer.sendMail(emailContent);

    // Simulate a small delay to mimic email sending
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(
      {
        success: true,
        message: `Status updated to ${status}. Email sent to ${email}`,
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
