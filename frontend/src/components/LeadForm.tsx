import React, { useState, useEffect } from 'react';
import { Lead } from '../types';

interface LeadFormProps {
  lead?: Lead | null;
  onSubmit: (data: {
    name: string;
    email: string;
    status: string;
    source: string;
    company?: string;
    value?: number;
    phone?: string;
    title?: string;
    nextAction?: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  lead = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('new');
  const [source, setSource] = useState('website');
  
  // New Fields
  const [company, setCompany] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [nextAction, setNextAction] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setEmail(lead.email);
      setStatus(lead.status);
      setSource(lead.source);
      setCompany(lead.company || '');
      setValue(lead.value ?? '');
      setPhone(lead.phone || '');
      setTitle(lead.title || '');
      setNextAction(lead.nextAction || '');
    } else {
      setName('');
      setEmail('');
      setStatus('new');
      setSource('website');
      setCompany('');
      setValue('');
      setPhone('');
      setTitle('');
      setNextAction('');
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || name.length < 2 || name.length > 100) {
      setFormError('Name must be between 2 and 100 characters');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit({
        name,
        email,
        status,
        source,
        company: company.trim(),
        value: value === '' ? 0 : Number(value),
        phone: phone.trim(),
        title: title.trim(),
        nextAction: nextAction.trim(),
      });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 transition-colors">
      <div className="bg-slate-900 border border-white/5 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up text-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/20">
          <h2 className="text-lg font-bold text-white">
            {lead ? '✏️ Edit Deal Details' : '➕ Create New Opportunity'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
          {formError && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Section: Company & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Deal Value ($)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 45000"
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Primary Contact Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Contact Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CEO / Decision Maker"
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@acme.com"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (415) 555-0100"
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Pipeline Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white cursor-pointer focus:outline-none focus:border-brand-500"
              >
                <option value="new">📘 New</option>
                <option value="contacted">💬 Contacted</option>
                <option value="qualified">✅ Qualified</option>
                <option value="won">🎁 Won</option>
                <option value="lost">❌ Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Source Channel</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white cursor-pointer focus:outline-none focus:border-brand-500"
              >
                <option value="website">Website</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Referral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Target Next Action</label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g. Schedule Discovery Call"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-lg text-xs transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-650 hover:bg-brand-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-brand-500/10 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? 'Saving...' : lead ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LeadForm;
