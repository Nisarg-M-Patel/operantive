/* eslint-disable @typescript-eslint/no-explicit-any */
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
    subject: `New Customer Discovery Response - ${formData.role === 'owner' ? 'Business Owner' : 'Employee'}${formData.interestedInCall === 'yes' ? ' (WANTS CALL)' : ''}`,
    html: emailContent,
  });
}

async function logToGoogleSheets(formData: any) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  
  // Prepare row data with new survey structure
  const rowData = [
    new Date().toISOString(),
    formData.name || '',
    formData.email || '',
    formData.phone || '',
    formData.role || '',
    formData.business || '',
    formData.employees || '',
    // CD Questions
    formData.timeWasterExists || '',
    formData.problemsHappen || '',
    formData.thingsFallThrough || '',
    formData.coordinationHard || '',
    formData.stressfulMoments || '',
    formData.lastMinuteChanges || '',
    formData.hardToTrack || '',
    // Legal questions
    formData.worriedAboutLegal || '',
    formData.hadLegalIssue || '',
    formData.hadLaborComplaint || '',
    // General questions
    formData.usesWhatsApp || '',
    formData.hasLanguageBarriers || '',
    formData.wantsDocumentation || '',
    // Multi-select problems (join with semicolons)
    Array.isArray(formData.biggestProblems) ? formData.biggestProblems.join(';') : '',
    formData.interestedInCall || '',
  ];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Responses!A:V', // Updated range for new columns (22 total)
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData],
    },
  });
}

function formatEmailContent(formData: any): string {
  const isOwner = formData.role === 'owner';
  
  // Create priority flags for follow-up
  const priorityFlags = [];
  if (formData.interestedInCall === 'yes') priorityFlags.push('🔥 WANTS CALL');
  if (formData.worriedAboutLegal === 'yes') priorityFlags.push('⚖️ Legal concerns');
  if (formData.hadLegalIssue === 'yes') priorityFlags.push('🚨 Had legal issue');
  if (formData.hadLaborComplaint === 'yes') priorityFlags.push('📋 Labor complaint');
  
  // Helper function to format answers with emojis
  const formatAnswer = (value: string) => {
    if (value === 'yes') return '✅ Yes';
    if (value === 'no') return '❌ No';
    return value;
  };

  // Helper function to format multiple choice answers
  const formatChoice = (value: string) => {
    const choiceMap: { [key: string]: string } = {
      // Business types
      'gas-station': '⛽ Gas Station / Convenience Store',
      'restaurant': '🍕 Restaurant / Food Service',
      'retail': '🛍️ Retail Store / Shopping',
      'auto-service': '🔧 Auto Repair / Service Business',
      'grocery': '🛒 Grocery / Market',
      'other': '🏢 Other Small Business',
      // Owner problems
      'staff-scheduling': '📅 Staff scheduling and attendance',
      'communication': '💬 Communication between people',
      'task-management': '📋 Making sure tasks get completed',
      'vendor-coordination': '🚛 Vendor and supplier coordination',
      'customer-complaints': '🚨 Customer complaints and problems',
      'paperwork': '📄 Paperwork and record keeping',
      'training': '🎓 Training new employees',
      'quality-control': '✅ Quality control and standards',
      'inventory': '📦 Inventory management',
      'cash-flow': '💰 Cash flow and payments',
      'regulations': '⚖️ Regulations and compliance',
      'technology': '💻 Technology and systems',
      'other-owner': '🔧 Other',
      // Employee problems
      'unclear-instructions': '❓ Unclear instructions or expectations',
      'schedule-changes': '📅 Last-minute schedule changes',
      'poor-communication': '💬 Poor communication from management',
      'insufficient-training': '🎓 Not enough training for my role',
      'too-many-tasks': '📋 Too many tasks to keep track of',
      'language-barriers': '🌐 Language or communication barriers',
      'inconsistent-policies': '📋 Inconsistent rules or policies',
      'no-feedback': '🔄 Not getting feedback on my work',
      'workplace-stress': '😰 High stress or pressure at work',
      'equipment-issues': '🔧 Equipment or technology problems',
      'unfair-treatment': '⚖️ Feeling treated unfairly',
      'work-life-balance': '⚖️ Work-life balance issues',
      'other-employee': '🔧 Other'
    };
    return choiceMap[value] || value;
  };

  // Format multi-select problems
  const formatProblems = (problems: string[] | string) => {
    if (Array.isArray(problems)) {
      return problems.map(p => formatChoice(p)).join('<br>• ');
    }
    return problems || 'None selected';
  };
  
  return `
    <h2>New Customer Discovery Response</h2>
    
    ${priorityFlags.length > 0 ? `
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin-bottom: 20px;">
        <strong>Priority Flags:</strong> ${priorityFlags.join(' • ')}
      </div>
    ` : ''}
    
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${formData.name}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
    <p><strong>Role:</strong> ${formData.role === 'owner' ? '👔 Business Owner' : '👷 Employee'}</p>
    <p><strong>Business Type:</strong> ${formatChoice(formData.business)}</p>
    ${isOwner ? `<p><strong>Employees:</strong> ${formData.employees}</p>` : ''}
    
    <h3>Survey Responses</h3>
    
    <h4>Business Operations</h4>
    ${isOwner ? `
      <p><strong>Time wasters exist:</strong> ${formatAnswer(formData.timeWasterExists)}</p>
      <p><strong>Recent problems happened:</strong> ${formatAnswer(formData.problemsHappen)}</p>
      <p><strong>Things fall through when away:</strong> ${formatAnswer(formData.thingsFallThrough)}</p>
      <p><strong>Coordination is hard:</strong> ${formatAnswer(formData.coordinationHard)}</p>
      
      <h4>Legal & Compliance</h4>
      <p><strong>Worried about legal trouble:</strong> ${formatAnswer(formData.worriedAboutLegal)}</p>
      <p><strong>Had legal issue/close call:</strong> ${formatAnswer(formData.hadLegalIssue)}</p>
      <p><strong>Had labor complaint:</strong> ${formatAnswer(formData.hadLaborComplaint)}</p>
    ` : `
      <p><strong>Has stressful/confusing moments:</strong> ${formatAnswer(formData.stressfulMoments)}</p>
      <p><strong>Experiences last-minute changes:</strong> ${formatAnswer(formData.lastMinuteChanges)}</p>
      <p><strong>Hard to track job aspects:</strong> ${formatAnswer(formData.hardToTrack)}</p>
    `}
    
    <h4>Communication</h4>
    <p><strong>Uses WhatsApp/SMS for work:</strong> ${formatAnswer(formData.usesWhatsApp)}</p>
    <p><strong>Has language barriers:</strong> ${formatAnswer(formData.hasLanguageBarriers)}</p>
    <p><strong>Wants better documentation:</strong> ${formatAnswer(formData.wantsDocumentation)}</p>
    
    <h4>Biggest Challenges</h4>
    <p><strong>Selected problems:</strong><br>• ${formatProblems(formData.biggestProblems)}</p>
    
    <h4>Follow-up Interest</h4>
    <p><strong>Interested in call:</strong> ${formatAnswer(formData.interestedInCall)}</p>
    
    ${formData.interestedInCall === 'yes' ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px; margin-top: 20px;">
        <strong>🎯 ACTION NEEDED:</strong> This person wants to talk! Reach out within 24 hours.
      </div>
    ` : ''}
    
    <hr>
    <p><em>Submitted on ${new Date().toLocaleString()}</em></p>
  `;
}