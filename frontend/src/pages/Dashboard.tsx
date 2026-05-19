import React, { useState, useEffect } from 'react';
import { useLeads } from '../hooks/useLeads';
import { Lead, LeadStatus } from '../types';
import FilterBar from '../components/FilterBar';
import LeadList from '../components/LeadList';
import LeadForm from '../components/LeadForm';
import KanbanBoard from '../components/KanbanBoard';
import DealDetailsSidebar from '../components/DealDetailsSidebar';
import CardContextMenu from '../components/CardContextMenu';
import ErrorMessage from '../components/ErrorMessage';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import ReportsView from './ReportsView';
import SourcesView from './SourcesView';
import TasksView from './TasksView';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'leads', label: 'Leads', icon: '👥' },
  { id: 'pipelines', label: 'Pipelines', icon: '📊' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'sources', label: 'Sources', icon: '🔗' },
  { id: 'tasks', label: 'Tasks', icon: '✔️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

// ── ViewMode type + type-guard (module scope) ──────────────────────────────
type ViewMode = 'kanban' | 'list' | 'reports' | 'sources' | 'tasks';

const isViewMode = (v: string | null): v is ViewMode =>
  ['kanban', 'list', 'reports', 'sources', 'tasks'].includes(v ?? '');

// ─────────────────────────────────────────────────────────────────────────────
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
    changeLimit,
    createLead,
    updateLead,
    deleteLead,
    exportCSV,
  } = useLeads();

  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('gf_dashboard_view');
    return isViewMode(saved) ? saved : 'kanban';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarId, setActiveSidebarId] = useState('pipelines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lead: Lead;
  } | null>(null);

  // Keyboard navigation states
  const [activeColIndex, setActiveColIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(-1);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Profile modal settings state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileTitle, setProfileTitle] = useState(user?.title || '');
  const [profileCompany, setProfileCompany] = useState(user?.company || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Custom views states
  const customSources = ['website', 'instagram', 'referral'];
  const [customTasks, setCustomTasks] = useState<{ id: string; text: string; completed: boolean; date?: string }[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');


  // Sync state when user object loads/changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileTitle(user.title || '');
      setProfileCompany(user.company || '');
    }
  }, [user]);

  // Sync limit with view mode
  useEffect(() => {
    if (viewMode === 'kanban') {
      changeLimit(1000);
    } else {
      changeLimit(10);
    }
    localStorage.setItem('gf_dashboard_view', viewMode);
    setActiveColIndex(0);
    setActiveCardIndex(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const columns = ['new', 'contacted', 'qualified', 'won', 'lost'];

      switch (e.key.toLowerCase()) {
        case 'h':
        case 'arrowleft':
          e.preventDefault();
          setActiveColIndex((prev) => Math.max(prev - 1, 0));
          setActiveCardIndex(-1);
          break;
        case 'l':
        case 'arrowright':
          e.preventDefault();
          setActiveColIndex((prev) => Math.min(prev + 1, columns.length - 1));
          setActiveCardIndex(-1);
          break;
        case 'j':
        case 'arrowdown':
          e.preventDefault();
          {
            const colId = columns[activeColIndex];
            const colLeads = leads.filter((l) => l.status === colId);
            if (colLeads.length > 0) {
              setActiveCardIndex((prev) => Math.min(prev + 1, colLeads.length - 1));
            }
          }
          break;
        case 'k':
        case 'arrowup':
          e.preventDefault();
          {
            const colId = columns[activeColIndex];
            const colLeads = leads.filter((l) => l.status === colId);
            if (colLeads.length > 0) {
              setActiveCardIndex((prev) => Math.max(prev - 1, 0));
            }
          }
          break;
        case 'd':
          e.preventDefault();
          {
            const colId = columns[activeColIndex];
            const colLeads = leads.filter((l) => l.status === colId);
            if (activeCardIndex >= 0 && activeCardIndex < colLeads.length) {
              setSelectedLead(colLeads[activeCardIndex]);
            }
          }
          break;
        case 'escape':
          e.preventDefault();
          setSelectedLead(null);
          setShowShortcutsHelp(false);
          setProfileModalOpen(false);
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeColIndex, activeCardIndex, leads, viewMode]);

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleCreateInStageClick = (status: LeadStatus) => {
    setEditingLead({
      status,
      name: '',
      email: '',
      source: 'website',
      company: '',
      value: 0,
      phone: '',
      title: '',
      starred: false,
      pinned: false,
      nextAction: '',
      lastContactedAt: '',
      timeline: [],
      attachments: [],
      _id: '',
      userId: '',
      createdAt: '',
      updatedAt: '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    setActionError(null);
    try {
      if (editingLead && editingLead._id) {
        const updated = await updateLead(editingLead._id, formData);
        showToast(`Updated deal details for ${formData.company || formData.name}`, 'success');
        if (selectedLead && selectedLead._id === editingLead._id) {
          setSelectedLead(updated);
        }
      } else {
        await createLead(formData);
        showToast(`Created new deal for ${formData.company || formData.name}`, 'success');
      }
      setIsModalOpen(false);
      setEditingLead(null);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to save deal information');
      showToast('Failed to save deal information', 'error');
      throw err;
    }
  };

  const handleUpdateLead = async (id: string, data: any) => {
    try {
      const updated = await updateLead(id, data);
      showToast('Lead status updated', 'success');
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead(updated);
      }
    } catch (err) {
      showToast('Failed to update lead', 'error');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this deal opportunity?')) {
      try {
        await deleteLead(id);
        showToast('Deal permanently deleted', 'success');
        if (selectedLead && selectedLead._id === id) {
          setSelectedLead(null);
        }
      } catch (err) {
        showToast('Failed to delete deal', 'error');
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, lead: Lead) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      lead,
    });
  };

  const greetingMessage = () => {
    const hr = new Date().getHours();
    const name = user?.name || 'Demigod';
    if (hr < 12) return `Good morning, ${name}! 🌅`;
    if (hr < 18) return `Good afternoon, ${name}! ☀️`;
    return `Good evening, ${name}! 👋`;
  };

  const getStatusCount = (status: string) => {
    if (!stats || !stats.byStatus) return 0;
    const match = stats.byStatus.find((s) => s._id === status);
    return match ? match.count : 0;
  };

  // Real-time calculation of deal changes from past 7 days
  const getRealtimePercentage = (status?: string) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let filteredLeads = leads;
    if (status) {
      filteredLeads = leads.filter((l) => l.status === status);
    }

    const totalCount = filteredLeads.length;
    if (totalCount === 0) return '+0%';

    const recentCount = filteredLeads.filter((l) => {
      const createdTime = l.createdAt ? new Date(l.createdAt) : null;
      const updatedTime = l.updatedAt ? new Date(l.updatedAt) : null;
      return (createdTime && createdTime >= sevenDaysAgo) || (updatedTime && updatedTime >= sevenDaysAgo);
    }).length;

    const pct = Math.round((recentCount / totalCount) * 100);
    return `+${pct}%`;
  };

  // Handle sidebar navigation clicks
  const handleSidebarClick = (id: string) => {
    setActiveSidebarId(id);
    setSidebarOpen(false);
    if (id === 'dashboard') {
      clearFilters();
      setViewMode('kanban');
      showToast('Showing sales pipeline dashboard', 'success');
    } else if (id === 'leads') {
      setViewMode('list');
      showToast('Switched to Leads compact list view', 'success');
    } else if (id === 'pipelines') {
      setViewMode('kanban');
      showToast('Switched to Pipelines Kanban board view', 'success');
    } else if (id === 'reports') {
      setViewMode('reports');
      showToast('Switched to Reports & Analytics dashboard', 'success');
    } else if (id === 'sources') {
      setViewMode('sources');
      showToast('Switched to Acquisition Sources manager', 'success');
    } else if (id === 'tasks') {
      setViewMode('tasks');
      showToast('Switched to Tasks & Follow-ups list', 'success');
    } else if (id === 'settings') {
      setProfileModalOpen(true);
    }
  };

  // Handle profile modal changes submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        title: profileTitle,
        company: profileCompany,
        ...(profilePassword ? { password: profilePassword } : {}),
      });
      showToast('Profile settings updated successfully!', 'success');
      setProfileModalOpen(false);
      setProfilePassword('');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile settings');
      showToast('Failed to update profile settings', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Sidebar navigation drawer content (Removed Pro banner and Help & Support)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-none text-slate-700 dark:text-gray-300 p-5">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8 select-none">
        <img src="/logo.png" alt="GigFlow Logo" className="w-9 h-9 object-contain rounded-xl" />
        <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-wider">GigFlow</span>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeSidebarId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-650 dark:bg-brand-600/15 dark:text-brand-300 shadow-sm border border-brand-200 dark:border-brand-500/10'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Version identifier */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-4">
        <div className="px-3 text-[10px] text-slate-400 dark:text-gray-500 font-medium font-mono select-none">
          GigFlow Pro v1.2.0 (Stable)
        </div>
      </div>
    </div>
  );

  const renderProfileModal = () => {
    if (!profileModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800 dark:text-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20">
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <span>👤</span> Profile Settings
            </h2>
            <button
              onClick={() => {
                setProfileModalOpen(false);
                setProfileError(null);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            {profileError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-200 rounded-lg text-xs font-semibold">
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-950 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-950 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. (555) 123-4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-950 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Job Title</label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  placeholder="e.g. Senior Sales Representative"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-950 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  placeholder="e.g. ServiceHive Ltd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-950 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">New Password (optional)</label>
                <input
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Min 6 chars to update"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-950 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(false);
                  setProfileError(null);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 font-semibold rounded-xl text-xs transition-all"
                disabled={profileLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setCustomTasks([
      ...customTasks,
      {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        date: newTaskDate || undefined
      }
    ]);
    setNewTaskText('');
    setNewTaskDate('');
    showToast('New task added successfully!', 'success');
  };

  const toggleTaskCompleted = (id: string) => {
    setCustomTasks(
      customTasks.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            showToast('Task completed! 🎉', 'success');
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };









  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A13] text-slate-800 dark:text-gray-100 flex transition-colors duration-200">
      
      {/* 1. Desktop Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-white/5 shrink-0 hidden md:block sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* 2. Mobile Drawer Navigation Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[990] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-64 z-[1000] animate-slide-right md:hidden">
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* 3. Main Dashboard Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header bar with Quick Profile summary */}
        <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#0B0F19]/40 sticky top-0 z-30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide uppercase">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Light/Dark mode switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Vertical separator */}
            <span className="w-px h-6 bg-slate-200 dark:bg-white/10" />

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all select-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : 'D'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {user?.name || 'Demigod'}
                  </span>
                  <span className="text-[9px] text-slate-450 dark:text-gray-500 capitalize leading-none mt-0.5">
                    {user?.title ? user.title : user?.role === 'admin' ? '🛡️ Admin' : '💼 Sales Rep'}
                  </span>
                </div>
                {/* Chevron icon */}
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 dark:text-gray-550 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Floating Dropdown Card */}
              {profileDropdownOpen && (
                <>
                  {/* Backdrop to close */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2.5 z-50 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-2 text-slate-800 dark:text-gray-200 animate-fade-in">
                    {/* User Identity Details */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
                      <div className="font-bold text-slate-950 dark:text-white text-xs truncate">
                        {user?.name || 'Demigod'}
                      </div>
                      <div className="text-[10px] text-slate-450 dark:text-gray-400 truncate mt-0.5">
                        {user?.email}
                      </div>
                      {user?.company && (
                        <div className="text-[9px] text-brand-600 dark:text-brand-400 font-semibold truncate mt-1">
                          🏢 {user.company}
                        </div>
                      )}
                    </div>

                    {/* Navigation Items */}
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-left transition-all"
                      >
                        <span>👤</span> Profile Settings
                      </button>
                    </div>

                    {/* Sign Out Action */}
                    <div className="border-t border-slate-100 dark:border-white/5 p-1 mt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-450 dark:hover:bg-red-950/20 rounded-lg text-left transition-all"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Workspace body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin">
          
          {/* Main Greeting Banner row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {viewMode === 'reports' ? 'Sales Insights & Reports 📈' :
                 viewMode === 'sources' ? 'Acquisition Channels 🔗' :
                 viewMode === 'tasks' ? 'Tasks & Scheduled Actions ✔️' :
                 greetingMessage()}
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-550 mt-1 font-medium">
                {viewMode === 'reports' ? 'Deep-dive analytics on pipeline conversion and top deals.' :
                 viewMode === 'sources' ? 'Monitor and configure source channels for your leads.' :
                 viewMode === 'tasks' ? 'Keep track of discovery calls and milestone follow-ups.' :
                 "Here's what's happening with your sales pipeline today."}
              </p>
            </div>
            
            {(viewMode === 'kanban' || viewMode === 'list') && (
              <div className="flex items-center gap-3">
                <button
                  onClick={exportCSV}
                  disabled={leads.length === 0}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-[#131929] dark:hover:bg-[#1C243B] dark:text-gray-250 dark:border-white/5 dark:hover:border-white/10 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <span>📥</span> Export CSV
                </button>
                <button
                  onClick={handleCreateClick}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>➕</span> Add New Lead
                </button>
              </div>
            )}
          </div>

          {/* Premium Glass KPI Stats row (Dynamically calculated in real-time) */}
          {(viewMode === 'kanban' || viewMode === 'list') && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 select-none">
            {/* 1. Total Leads */}
            <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Total Leads</span>
                <span className="text-base p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">👥</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono leading-none">
                {stats?.totalLeads || 0}
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-2.5 block">
                📈 {getRealtimePercentage()} from last 7 days
              </span>
            </div>

            {/* 2. New Leads */}
            <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">New Leads</span>
                <span className="text-base p-1.5 rounded-lg bg-slate-500/10 text-slate-500 dark:text-gray-400">📄</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono leading-none">
                {getStatusCount('new')}
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-2.5 block">
                📈 {getRealtimePercentage('new')} from last 7 days
              </span>
            </div>

            {/* 3. Contacted */}
            <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Contacted</span>
                <span className="text-base p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">⏳</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono leading-none">
                {getStatusCount('contacted')}
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-2.5 block">
                📈 {getRealtimePercentage('contacted')} from last 7 days
              </span>
            </div>

            {/* 4. Qualified */}
            <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Qualified</span>
                <span className="text-base p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">✅</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono leading-none">
                {getStatusCount('qualified')}
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-2.5 block">
                📈 {getRealtimePercentage('qualified')} from last 7 days
              </span>
            </div>

            {/* 5. Lost Leads */}
            <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Lost Leads</span>
                <span className="text-base p-1.5 rounded-lg bg-red-500/10 text-red-650 dark:text-red-400">❌</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono leading-none">
                {getStatusCount('lost')}
              </div>
              <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold mt-2.5 block">
                📈 {getRealtimePercentage('lost')} from last 7 days
              </span>
            </div>
          </div>
          )}

          {/* Global Errors */}
          {error && <ErrorMessage message={error} />}
          {actionError && <ErrorMessage message={actionError} onDismiss={() => setActionError(null)} />}

          {/* Filters Bar & View Switcher */}
          {(viewMode === 'kanban' || viewMode === 'list') && (
            <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-100 dark:bg-[#131929]/30 p-2 border border-slate-200 dark:border-white/5 rounded-xl shrink-0">
              <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 pl-2 select-none">Pipeline View</div>
              {/* Radio view toggle */}
              <div className="bg-white dark:bg-[#0B0F19]/80 border border-slate-200 dark:border-white/10 rounded-lg p-0.5 flex">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  List view
                </button>
              </div>
            </div>

            <FilterBar
              filters={filters}
              onFilterChange={updateFilters}
              onClear={clearFilters}
            />
          </div>
          )}

          {/* Main workspace area: Kanban/List view OR dynamic sub-views */}
          <div className="flex-1 flex flex-col min-h-0 select-none">
            {viewMode === 'reports' ? (
              <ReportsView leads={leads} />
            ) : viewMode === 'sources' ? (
              <SourcesView leads={leads} />
            ) : viewMode === 'tasks' ? (
              <TasksView
                leads={leads}
                customTasks={customTasks}
                newTaskText={newTaskText}
                newTaskDate={newTaskDate}
                onNewTaskTextChange={setNewTaskText}
                onNewTaskDateChange={setNewTaskDate}
                onAddTask={handleAddTask}
                onToggleTask={toggleTaskCompleted}
              />
            ) : leads.length === 0 ? (
              /* High fidelity premium empty state matching attached screenshot */
              <div className="bg-white dark:bg-[#131929]/25 border border-slate-200 dark:border-white/5 rounded-2xl py-16 px-6 text-center flex flex-col items-center justify-center space-y-5 animate-fade-in select-none">
                
                {/* 3D Purple Folder SVG Illustration */}
                <div className="relative w-48 h-48 select-none">
                  <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="50" fill="#6366F1" opacity="0.15" filter="blur(20px)" />
                    <path d="M40 70C40 64.4772 44.4772 60 50 60H85L98 75H150C155.523 75 160 79.4772 160 85V140C160 145.523 155.523 150 150 150H50C44.4772 150 40 145.523 40 140V70Z" fill="#312E81" opacity="0.6"/>
                    <rect x="70" y="45" width="60" height="40" rx="4" fill="#E0E7FF" opacity="0.8" />
                    <line x1="80" y1="55" x2="120" y2="55" stroke="#312E81" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="80" y1="65" x2="110" y2="65" stroke="#312E81" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M40 85C40 79.4772 44.4772 75 50 75H150C155.523 75 160 79.4772 160 85V140C160 145.523 155.523 150 150 150H50C44.4772 150 40 145.523 40 140V85Z" fill="#4F46E5" />
                    {/* Lightning bolt emblem */}
                    <path d="M96 90L87 108H97L93 125L107 103H97L101 90H96Z" fill="#E0E7FF" />
                    <circle cx="130" cy="130" r="16" stroke="#E0E7FF" strokeWidth="4" fill="#0B0F19" />
                    <path d="M141 141L155 155" stroke="#E0E7FF" strokeWidth="4" strokeLinecap="round" />
                    <path d="M30 50L32 54L36 55L32 56L30 60L28 56L24 55L28 54L30 50Z" fill="#818CF8" />
                    <path d="M170 100L171 103L174 104L171 105L170 108L169 105L166 104L169 103L170 100Z" fill="#818CF8" />
                  </svg>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">No leads found</h3>
                  <p className="text-xs text-slate-550 dark:text-gray-500 font-medium">
                    Try adjusting your filters or add a new lead to get started.
                  </p>
                </div>

                <button
                  onClick={handleCreateClick}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>➕</span> Add New Lead
                </button>

              </div>
            ) : viewMode === 'kanban' ? (
              <KanbanBoard
                leads={leads}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onEditLead={handleEditClick}
                onAddLeadToStage={handleCreateInStageClick}
                onSelectLead={setSelectedLead}
                onContextMenu={handleContextMenu}
                activeColIndex={activeColIndex}
                activeCardIndex={activeCardIndex}
              />
            ) : (
              <div className="bg-white dark:bg-[#131929]/20 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden p-4 shadow-sm dark:shadow-none">
                <LeadList
                  leads={leads}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={changePage}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteLead}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Profile Settings Modal */}
      {renderProfileModal()}

      {/* Form modal */}
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

      {/* Right details sidebar panel */}
      {selectedLead && (
        <DealDetailsSidebar
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
        />
      )}

      {/* Context menu overlay */}
      {contextMenu && (
        <CardContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          lead={contextMenu.lead}
          onClose={() => setContextMenu(null)}
          onCall={() => {
            window.open(`tel:${contextMenu.lead.phone || ''}`);
          }}
          onEmail={() => {
            window.open(`mailto:${contextMenu.lead.email}`);
          }}
          onAddNote={() => {
            setSelectedLead(contextMenu.lead);
          }}
          onViewDetails={() => {
            setSelectedLead(contextMenu.lead);
          }}
          onEdit={() => {
            handleEditClick(contextMenu.lead);
          }}
          onReassign={() => {
            handleEditClick(contextMenu.lead);
          }}
          onAttach={() => {
            setSelectedLead(contextMenu.lead);
          }}
          onDelete={() => {
            handleDeleteLead(contextMenu.lead._id);
          }}
        />
      )}

      {/* Keyboard Shortcuts Helper Legend overlay */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-850 dark:text-gray-250">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⌨️</span> Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white text-lg p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-medium">Navigate stage columns</span>
                <span className="bg-slate-55 border border-slate-250 dark:bg-slate-950 dark:border-white/10 px-2.5 py-1 rounded font-mono text-[10px] text-brand-600 dark:text-brand-350">
                  H / L or ← / →
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-medium">Navigate cards in active column</span>
                <span className="bg-slate-55 border border-slate-250 dark:bg-slate-950 dark:border-white/10 px-2.5 py-1 rounded font-mono text-[10px] text-brand-600 dark:text-brand-350">
                  J / K or ↑ / ↓
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-medium">Open selected deal side panel</span>
                <span className="bg-slate-55 border border-slate-250 dark:bg-slate-950 dark:border-white/10 px-2.5 py-1 rounded font-mono text-[10px] text-brand-600 dark:text-brand-350">
                  D
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-medium">Close sidebar panel / legend modal</span>
                <span className="bg-slate-55 border border-slate-250 dark:bg-slate-950 dark:border-white/10 px-2.5 py-1 rounded font-mono text-[10px] text-brand-600 dark:text-brand-350">
                  Esc
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-medium">Toggle shortcuts help legend</span>
                <span className="bg-slate-55 border border-slate-250 dark:bg-slate-950 dark:border-white/10 px-2.5 py-1 rounded font-mono text-[10px] text-brand-600 dark:text-brand-350">
                  ?
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-gray-550 text-center mt-5 italic">
              Press Esc at any time to close modal overlays.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
