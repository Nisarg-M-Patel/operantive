// src/app/api/submit-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Google Sheets configuration
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Send email notification
    await sendEmailNotification(formData);
    
    // Log to Google Sheets
    await logToGoogleSheets(formData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(formData: any) {
  const emailContent = formatEmailContent(formData);
  
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: 'hello@operantive.com',
    subject: `New Customer Discovery Response - ${formData.role === 'owner' ? 'Business Owner' : 'Employee'}`,
    html: emailContent,
  });
}

async function logToGoogleSheets(formData: any) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  
  // Prepare row data
  const rowData = [
    new Date().toISOString(),
    formData.name || '',
    formData.email || '',
    formData.phone || '',
    formData.role || '',
    formData.business || '',
    formData.employees || '',
    formData.timeWaster || '',
    formData.problems || '',
    formData.stressfulMoments || '',
    formData.lastWentWrong || '',
    formData.stepAway || '',
    formData.coordination || '',
  ];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Responses!A:M', // Adjust range as needed
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData],
    },
  });
}

function formatEmailContent(formData: any): string {
  const isOwner = formData.role === 'owner';
  
  return `
    <h2>New Customer Discovery Response</h2>
    
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${formData.name}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
    <p><strong>Role:</strong> ${formData.role === 'owner' ? 'Business Owner' : 'Employee'}</p>
    <p><strong>Business Type:</strong> ${formData.business}</p>
    ${isOwner ? `<p><strong>Employees:</strong> ${formData.employees}</p>` : ''}
    
    <h3>Responses</h3>
    
    ${isOwner ? `
      <h4>What takes up more time than it should?</h4>
      <p>${formData.timeWaster}</p>
      
      <h4>Last time something went wrong</h4>
      <p>${formData.lastWentWrong}</p>
      
      <h4>What falls through the cracks when you step away?</h4>
      <p>${formData.stepAway}</p>
      
      <h4>What gets in the way of smooth coordination?</h4>
      <p>${formData.coordination}</p>
    ` : `
      <h4>When do you feel most stressed/confused at work?</h4>
      <p>${formData.stressfulMoments}</p>
      
      <h4>How would a new person know what to do?</h4>
      <p>${formData.coordination}</p>
      
      <h4>Time your workday changed last minute</h4>
      <p>${formData.lastWentWrong}</p>
      
      <h4>What's hardest to keep track of?</h4>
      <p>${formData.problems}</p>
    `}
    
    <hr>
    <p><em>Submitted on ${new Date().toLocaleString()}</em></p>
  `;
}