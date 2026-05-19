import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { Lead } from '../types';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('new');
  const [source, setSource] = useState('website');

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const data = await leadService.getLead(id);
        setLead(data);
        setName(data.name);
        setEmail(data.email);
        setStatus(data.status);
        setSource(data.source);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lead not found or unauthorized');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setUpdating(true);

    try {
      const updated = await leadService.updateLead(id, { name, email, status, source });
      setLead(updated);
      alert('Lead successfully updated!');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update lead information');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !lead) return;
    if (window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
      setUpdating(true);
      try {
        await leadService.deleteLead(id);
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete lead');
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Retrieving lead detail information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary py-2 px-3 text-xs tracking-wider flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {lead && (
          <div className="card space-y-6 animate-fade-in shadow-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{lead.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lead.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={updating}
                  className="btn-danger py-2 px-4 text-xs font-semibold"
                >
                  Delete Lead
                </button>
              </div>
            </div>

            {/* Editable Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="label">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="input cursor-pointer"
                  >
                    <option value="website">Website</option>
                    <option value="instagram">Instagram</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary py-2.5 px-6 shadow-md shadow-brand-500/10"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
export default LeadDetail;
