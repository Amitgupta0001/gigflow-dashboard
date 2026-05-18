import { useState, useEffect, useCallback } from 'react';
import { Lead, Filters, Pagination, DashboardStats } from '../types';
import { leadService } from '../services/leadService';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    source: '',
    search: '',
    sortBy: 'latest',
  });

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      if (response.success) {
        setLeads(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch leads');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await leadService.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  const createLead = async (data: { name: string; email: string; status: string; source: string }) => {
    setLoading(true);
    setError(null);
    try {
      await leadService.createLead(data);
      await fetchLeads();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating lead');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (id: string, data: Partial<{ name: string; email: string; status: string; source: string }>) => {
    setLoading(true);
    setError(null);
    try {
      await leadService.updateLead(id, data);
      await fetchLeads();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating lead');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await leadService.deleteLead(id);
      await fetchLeads();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting lead');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      await leadService.exportCSV(filters);
    } catch (err: any) {
      setError('Error exporting CSV');
    }
  };

  const changePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      source: '',
      search: '',
      sortBy: 'latest',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return {
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
    refreshLeads: fetchLeads,
  };
};
