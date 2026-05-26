import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Job } from '@/lib/types';
import { jobTypeLabel, sourceLabel } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { job, recipientEmail }: { job: Job; recipientEmail: string } = body;

    if (!job || !recipientEmail) {
      return NextResponse.json({ error: 'Missing job or email' }, { status: 400 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

    const descriptionPreview = job.description.slice(0, 800).trim() + (job.description.length > 800 ? '…' : '');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 32px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px; }
    .header h1 { color: white; margin: 0 0 4px; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 0; font-size: 15px; }
    .body { padding: 28px 32px; }
    .meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-type { background: #ecfdf5; color: #065f46; }
    .badge-source { background: #eef2ff; color: #3730a3; }
    .badge-remote { background: #f0fdf4; color: #166534; }
    .info-grid { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #1e293b; font-weight: 600; }
    .description { font-size: 14px; color: #475569; line-height: 1.7; white-space: pre-line; }
    .cta { text-align: center; margin: 28px 0 0; }
    .btn { display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 16px; }
    .tag { background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${job.title}</h1>
      <p>${job.company} &bull; ${job.location}</p>
    </div>
    <div class="body">
      <div class="meta-row">
        <span class="badge badge-type">${jobTypeLabel(job.type)}</span>
        <span class="badge badge-source">${sourceLabel(job.source)}</span>
        ${job.isRemote ? '<span class="badge badge-remote">Remote</span>' : ''}
      </div>

      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Company</span>
          <span class="info-value">${job.company}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Location</span>
          <span class="info-value">${job.location}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Job Type</span>
          <span class="info-value">${jobTypeLabel(job.type)}</span>
        </div>
        ${job.salary ? `
        <div class="info-row">
          <span class="info-label">Salary</span>
          <span class="info-value">${job.salary}</span>
        </div>` : ''}
        ${job.experienceLevel ? `
        <div class="info-row">
          <span class="info-label">Experience</span>
          <span class="info-value">${job.experienceLevel}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="info-label">Source</span>
          <span class="info-value">${sourceLabel(job.source)}</span>
        </div>
      </div>

      <p style="font-weight:600; color:#1e293b; margin-bottom:8px;">About this role</p>
      <p class="description">${descriptionPreview}</p>

      ${job.tags && job.tags.length > 0 ? `
      <div class="tags">
        ${job.tags.slice(0, 8).map((t) => `<span class="tag">${t}</span>`).join('')}
      </div>` : ''}

      <div class="cta">
        <a href="${job.applyUrl}" class="btn">Apply Now &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Sent from HireWire &bull; <a href="${job.applyUrl}" style="color:#6366f1;">View original posting</a>
    </div>
  </div>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: `Job Alert: ${job.title} at ${job.company}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Send email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
