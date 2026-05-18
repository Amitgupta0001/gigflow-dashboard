import api from './api';
import { Lead, PaginatedResponse, ApiResponse, DashboardStats, Filters } from '../types';

interface LeadFormData {
  name: string;
  email: string;
  status: string;
  source: string;
}

export const leadService = {
  async getLeads(filters: Partial<Filters> & { page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const res = await api.get<PaginatedResponse<Lead>>(`/api/leads?${params.toString()}`);
    return res.data;
  },

  async getLead(id: string) {
    const res = await api.get<ApiResponse<Lead>>(`/api/leads/${id}`);
    return res.data.data;
  },

  async createLead(data: LeadFormData) {
    const res = await api.post<ApiResponse<Lead>>('/api/leads', data);
    return res.data.data;
  },

  async updateLead(id: string, data: Partial<LeadFormData>) {
    const res = await api.put<ApiResponse<Lead>>(`/api/leads/${id}`, data);
    return res.data.data;
  },

  async deleteLead(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/api/leads/${id}`);
    return res.data;
  },

  async exportCSV(filters: Partial<Filters>) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);

    const res = await api.get(`/api/leads/export/csv?${params.toString()}`, {
      responseType: 'blob',
    });

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `leads-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getDashboardStats() {
    const res = await api.get<ApiResponse<DashboardStats>>('/api/leads/stats/dashboard');
    return res.data.data;
  },
};
