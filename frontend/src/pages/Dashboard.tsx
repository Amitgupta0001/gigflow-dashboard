import React, { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { Lead } from '../types';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import LeadList from '../components/LeadList';
import LeadForm from '../components/LeadForm';
import ErrorMessage from '../components/ErrorMessage';

export const Dashboard: React.FC = () => {
  const {
    leads,
    loading,
    error,
    stats,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    changePage,
    createLead,
    updateLead,
    deleteLead,
    exportCSV,
  } = useLeads();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: {
    name: string;
    email: string;
    status: string;
    source: string;
  }) => {
    setActionError(null);
    try {
      if (editingLead) {
        await updateLead(editingLead._id, formData);
      } else {
        await createLead(formData);
      }
      setIsModalOpen(false);
      setEditingLead(null);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to save lead information');
      throw err;
    }
  };

  // Get status counts helper
  const getStatusCount = (status: string) => {
    if (!stats || !stats.byStatus) return 0;
    const match = stats.byStatus.find((s) => s._id === status);
    return match ? match.count : 0;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Analyze leads performance, sort pipelines, and export sales insights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              disabled={leads.length === 0}
              className="btn-secondary py-2.5 px-4 flex items-center gap-2 text-sm tracking-wide disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={handleCreateClick}
              className="btn-primary py-2.5 px-4 flex items-center gap-2 text-sm tracking-wide shadow-lg shadow-brand-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add New Lead
            </button>
          </div>
        </div>

        {/* Dashboard Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total */}
          <div className="card py-4 px-5 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800">
            <span className="text-xs font-semibold text-gray-400">Total Leads</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1.5">{stats?.totalLeads || 0}</div>
          </div>
          {/* Card 2: New */}
          <div className="card py-4 px-5 border-blue-900/30 bg-blue-950/10">
            <span className="text-xs font-semibold text-blue-400">🆕 New Leads</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-300 mt-1.5">{getStatusCount('new')}</div>
          </div>
          {/* Card 3: Contacted */}
          <div className="card py-4 px-5 border-yellow-900/30 bg-yellow-950/10">
            <span className="text-xs font-semibold text-yellow-400">⚡ Contacted</span>
            <div className="text-2xl sm:text-3xl font-black text-yellow-300 mt-1.5">{getStatusCount('contacted')}</div>
          </div>
          {/* Card 4: Qualified */}
          <div className="card py-4 px-5 border-green-900/30 bg-green-950/10">
            <span className="text-xs font-semibold text-green-400">💎 Qualified</span>
            <div className="text-2xl sm:text-3xl font-black text-green-300 mt-1.5">{getStatusCount('qualified')}</div>
          </div>
          {/* Card 5: Lost */}
          <div className="card py-4 px-5 border-red-900/30 bg-red-950/10">
            <span className="text-xs font-semibold text-red-400">❌ Lost Leads</span>
            <div className="text-2xl sm:text-3xl font-black text-red-300 mt-1.5">{getStatusCount('lost')}</div>
          </div>
        </div>

        {/* Global Errors */}
        {error && <ErrorMessage message={error} />}
        {actionError && <ErrorMessage message={actionError} onDismiss={() => setActionError(null)} />}

        {/* Filters Panel */}
        <FilterBar
          filters={filters}
          onFilterChange={updateFilters}
          onClear={clearFilters}
        />

        {/* Lead List */}
        <LeadList
          leads={leads}
          loading={loading}
          pagination={pagination}
          onPageChange={changePage}
          onEdit={handleEditClick}
          onDelete={deleteLead}
        />
      </main>

      {/* Form Modal */}
      {isModalOpen && (
        <LeadForm
          lead={editingLead}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingLead(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
};
export default Dashboard;
