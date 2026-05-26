'use client';

import { useState } from 'react';
import { Job } from '@/lib/types';
import {
  cn,
  timeAgo,
  jobTypeLabel,
  jobTypeBadgeColor,
  sourceBadgeColor,
  sourceLabel,
} from '@/lib/utils';
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Wifi,
  ExternalLink,
  Mail,
  Bookmark,
  Building2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Props {
  job: Job;
  onClose: () => void;
}

type EmailStatus = 'idle' | 'loading' | 'success' | 'error';

export default function JobDetailPane({ job, onClose }: Props) {
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [emailInput, setEmailInput] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSendEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setEmailStatus('loading');

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, recipientEmail: emailInput }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed');
      }

      setEmailStatus('success');
      setTimeout(() => {
        setEmailStatus('idle');
        setShowEmailForm(false);
        setEmailInput('');
      }, 3000);
    } catch (err: any) {
      setEmailStatus('error');
      setEmailError(err.message ?? 'Something went wrong');
      setTimeout(() => setEmailStatus('idle'), 4000);
    }
  };

  const descParagraphs = job.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col w-full md:w-[520px] lg:w-[600px] xl:w-[680px] bg-white border-l border-slate-200 animate-slide-in flex-none shadow-xl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 flex-none">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Building2 className="w-4 h-4" />
          <span className="truncate max-w-[200px]">{job.company}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium truncate max-w-[200px]">{job.title}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h1>
              <p className="text-slate-600 text-base mt-1 font-medium">{job.company}</p>
            </div>
            <span
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-semibold flex-none',
                sourceBadgeColor(job.source)
              )}
            >
              {sourceLabel(job.source)}
            </span>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium',
                jobTypeBadgeColor(job.type)
              )}
            >
              {jobTypeLabel(job.type)}
            </span>

            {job.isRemote && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-teal-50 text-teal-700">
                <Wifi className="w-3 h-3" />
                Remote
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>

            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-500 ml-auto">
              <Clock className="w-3 h-3" />
              {timeAgo(job.postedAt)}
            </span>
          </div>

          {/* Salary */}
          {job.salary && (
            <div className="mt-3 flex items-center gap-1.5 text-emerald-700 font-semibold text-sm bg-emerald-50 rounded-lg px-3 py-2 w-fit">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </div>
          )}

          {/* Experience */}
          {job.experienceLevel && (
            <div className="mt-2 text-xs text-slate-500">
              Level: <span className="font-medium text-slate-700">{job.experienceLevel}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills & Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Job Description</p>
          <div className="space-y-3">
            {descParagraphs.map((para, i) => {
              const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
              if (lines.length > 1) {
                return (
                  <ul key={i} className="space-y-1 list-none">
                    {lines.map((line, j) => (
                      <li key={j} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                        {line.startsWith('•') || line.startsWith('-') ? (
                          <>
                            <span className="text-indigo-400 flex-none mt-0.5">•</span>
                            <span>{line.replace(/^[•\-]\s*/, '')}</span>
                          </>
                        ) : (
                          <span>{line}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-sm text-slate-700 leading-relaxed">
                  {para}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      {/* Email form (expandable) */}
      {showEmailForm && (
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs font-semibold text-slate-600 mb-2">Send job details to your email</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
            />
            <button
              onClick={handleSendEmail}
              disabled={emailStatus === 'loading'}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {emailStatus === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {emailStatus === 'success' && <CheckCircle className="w-3.5 h-3.5" />}
              Send
            </button>
          </div>
          {emailError && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {emailError}
            </p>
          )}
          {emailStatus === 'success' && (
            <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Email sent successfully!
            </p>
          )}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex-none px-5 py-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowEmailForm(!showEmailForm);
              setEmailStatus('idle');
              setEmailError('');
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
              showEmailForm
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            )}
          >
            <Mail className="w-4 h-4" />
            Email Job
          </button>

          <button
            onClick={() => {
              if ('clipboard' in navigator) {
                navigator.clipboard.writeText(job.applyUrl);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <Bookmark className="w-4 h-4" />
            Copy Link
          </button>

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>

          {job.url !== job.applyUrl && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              View Post
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
