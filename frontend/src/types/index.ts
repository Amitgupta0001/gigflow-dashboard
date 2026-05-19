export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales_user';
  phone?: string;
  title?: string;
  company?: string;
  avatar?: string;
}

export interface TimelineItem {
  type: 'creation' | 'call' | 'email' | 'note' | 'stage_change' | 'other';
  text: string;
  createdAt: string;
}

export interface AttachmentItem {
  name: string;
  size: number;
  url: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  company: string;
  value: number;
  phone: string;
  title: string;
  starred: boolean;
  pinned: boolean;
  nextAction: string;
  lastContactedAt: string;
  timeline: TimelineItem[];
  attachments: AttachmentItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    adminSecret?: string,
    phone?: string,
    title?: string,
    company?: string
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User & { password?: string }>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface Filters {
  status?: string;
  source?: string;
  search?: string;
  sortBy: 'latest' | 'oldest';
  minPrice?: string;
  maxPrice?: string;
  stuckDays?: string;
  starred?: boolean;
  pinned?: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardStats {
  totalLeads: number;
  byStatus: { _id: string; count: number }[];
  totalValue: number;
  activeCount: number;
  winRate: number;
  closingThisWeek: number;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type LeadSource = 'website' | 'instagram' | 'referral';
