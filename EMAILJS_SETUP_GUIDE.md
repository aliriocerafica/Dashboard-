# EmailJS Setup Guide for IT Asset Request System

## Overview
This guide explains how to set up **EmailJS** to send real email notifications when IT asset request statuses change.

---

## What is EmailJS?

**EmailJS** is a free service that allows you to send emails directly from your application without needing a backend email server. It supports:
- ✅ Free tier with 200 emails/month
- ✅ Easy setup (5 minutes)
- ✅ Multiple email providers (Gmail, Outlook, Yahoo, etc.)
- ✅ No server-side email configuration needed
- ✅ Simple API integration

---

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Click **"Sign Up Free"**
3. Create an account (Email, Password, or use Google/GitHub login)
4. Verify your email address

---

## Step 2: Set Up an Email Service

### Option A: Gmail (Recommended)

1. In EmailJS dashboard, go to **"Email Services"** (left sidebar)
2. Click **"Add Service"**
3. Select **"Gmail"**
4. Name: `gmail_service` (or any name)
5. Click **"Connect Account"**
6. Sign in with your Gmail account
7. Grant permissions
8. Click **"Save"**
9. Copy your **Service ID**: `service_xxxxxxx`

### Option B: Other Email Providers

- **Outlook/Hotmail**: Select "Outlook 365"
- **Yahoo**: Select "Yahoo Mail"
- **Custom SMTP**: Select "SMTP2GO" or your provider

---

## Step 3: Create an Email Template

1. Go to **"Email Templates"** (left sidebar)
2. Click **"Create New Template"**
3. Fill in:
   - **Name**: `IT_Asset_Status_Update`
   - **Subject**: `IT Asset Request Update - {{subject}}`
   - **Template Body**:

```html
Dear {{to_name}},

{{message}}

Best regards,
IT Department

---
Request ID: {{request_id}}
```

4. Click **"Save"**
5. Copy your **Template ID**: `template_xxxxxxx`

---

## Step 4: Get Your API Credentials

1. Go to **"Account"** (top right → Account Settings)
2. Click **"API Keys"** tab
3. Copy your **Public Key**: This is your `EMAILJS_PUBLIC_KEY`

### Your credentials:
```
Service ID:    service_xxxxxxx        (from Email Services)
Template ID:   template_xxxxxxx       (from Email Templates)
Public Key:    your_public_key        (from Account → API Keys)
```

---

## Step 5: Add Credentials to Your Dashboard

1. Open `.env.local` in your project
2. Add these lines:

```env
# EmailJS Configuration
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key
```

3. Replace `xxxxxxx` with your actual values from Step 4
4. Save the file

---

## Step 6: Restart Your Dev Server

```bash
# In terminal/PowerShell
npm run dev
```

---

## Testing

### Test Email Sending

1. Go to your dashboard: `http://localhost:3002/admin/it-requests`
2. Login with your credentials
3. Submit an IT asset request at `/it-asset-request`
4. Go back to admin panel
5. Click **"Approved"**, **"Declined"**, or **"In Process"** button
6. Check the requester's email inbox for the notification

### What Happens:
- ✅ Status is saved to Google Sheets
- ✅ Email is sent via EmailJS
- ✅ Success message appears on admin panel

---

## Status Messages Sent

When you update the request status, the requester receives an email with:

### If **Approved**:
```
Your IT asset request has been APPROVED. Your item will be delivered soon!
```

### If **Declined**:
```
Your IT asset request has been DECLINED. Please contact IT for more information.
```

### If **In Process**:
```
Your IT asset request is IN PROCESS. We are working on your request.
```

### If **Pending** (or other):
```
Your IT asset request status has been updated to: [status]
```

---

## Current Implementation

### Without EmailJS (Demo Mode)
- ✅ Status updates save to Google Sheets
- ❌ Emails are NOT sent (only logged to console)
- Shows: "Email sent to..." (simulated)

### With EmailJS (Production Ready)
- ✅ Status updates save to Google Sheets
- ✅ Real emails sent via EmailJS
- ✅ Automatic status message based on status type
- ✅ Includes request details in email

---

## File Structure

```
app/
├── api/
│   ├── submit-it-asset-request/route.ts     (Save requests to Sheet)
│   ├── get-it-requests/route.ts             (Fetch all requests)
│   └── update-request-status/route.ts       (Update status + send email)
├── admin/
│   └── it-requests/page.tsx                 (Admin management panel)
└── components/
    └── ITAssetRequestForm.tsx               (Request submission form)

.env.local                                    (Your credentials)
```

---

## Flow Diagram

```
User submits request
        ↓
Saved to Google Sheets
        ↓
Admin views requests
        ↓
Admin clicks status button
        ↓
Status updated in Google Sheets ← EmailJS sends email to requester
        ↓
Admin sees success message
        ↓
Requester receives email
```

---

## Troubleshooting

### Email Not Sending?

1. **Check credentials**:
   - Verify `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` are correct
   - Restart dev server after adding to `.env.local`

2. **Check browser console**:
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check the Network tab for API calls

3. **Check server logs**:
   - Look at terminal where `npm run dev` runs
   - Should show "EmailJS response:" or "Email sent successfully via EmailJS"

4. **Check EmailJS dashboard**:
   - Go to [EmailJS Dashboard](https://dashboard.emailjs.com)
   - Check "Logs" tab to see if email was sent
   - Check if email service is connected properly

### Status Not Persisting?

1. Verify Google Sheets API credentials are correct
2. Check if Google Sheet is shared with service account email
3. Check terminal logs for Google Sheets errors

---

## Upgrade EmailJS (Optional)

### Free Plan:
- 200 emails/month
- Limited templates

### Paid Plans:
- Unlimited emails
- More templates
- Priority support
- Visit: https://www.emailjs.com/pricing

---

## Advanced: Customize Email Template

1. Go to EmailJS → **Email Templates**
2. Edit your `IT_Asset_Status_Update` template
3. Add HTML/CSS for better formatting
4. Use variables: `{{to_email}}`, `{{to_name}}`, `{{message}}`, etc.
5. Click **"Save"**

Example template:
```html
<h2>Request Status Update</h2>
<p>Dear {{to_name}},</p>
<p>{{message}}</p>
<div style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
  <p><strong>Request ID:</strong> {{request_id}}</p>
</div>
```

---

## Security Notes

- ✅ Your email credentials are stored in `.env.local`
- ✅ `.env.local` is in `.gitignore` (not pushed to GitHub)
- ✅ Server-side email sending (more secure than client-side)
- ⚠️ Never commit `.env.local` to git
- ⚠️ Add credentials to Vercel deployment settings too

---

## Next Steps

1. ✅ Create EmailJS account
2. ✅ Set up email service (Gmail/Outlook)
3. ✅ Create email template
4. ✅ Get API credentials
5. ✅ Add to `.env.local`
6. ✅ Restart dev server
7. ✅ Test by submitting a request and updating status
8. ✅ Check email inbox for notification

---

## Support

- **EmailJS Docs**: https://www.emailjs.com/docs/
- **API Reference**: https://www.emailjs.com/docs/rest-api/send/
- **Dashboard**: https://dashboard.emailjs.com

---

**Your IT Asset Request System is now ready for production with real email notifications!** 🚀
