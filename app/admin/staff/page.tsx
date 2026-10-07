'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  UserCheck,
  Key,
  Lock,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Sparkles,
  Copy,
  Check,
  Users,
  UserX,
  RefreshCw,
  Sliders,
  ExternalLink,
  Package,
  Truck,
  CreditCard,
  Settings,
  AlertTriangle,
  User,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Inventory Manager' | 'Dispatch Coordinator' | 'Support Specialist';
  avatar?: string;
  password?: string;
  permissions: string[];
  status: 'Active' | 'Suspended';
  lastActive: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Ali Hasan Sheikh',
    email: 'hasansheikh9080@gmail.com',
    phone: '01775743148',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    password: 'admin123',
    permissions: [
      'Manage Products',
      'Manage Orders',
      'Assign Courier (Steadfast/Pathao)',
      'Discount Coupons',
      'Logistics & Store Settings',
      'Financial Reports & Analytics',
      'Customer Data Access',
    ],
    status: 'Active',
    lastActive: 'Active Now',
  },
  {
    id: 'staff-2',
    name: 'Anisur Rahman',
    email: 'anis.stock@jeansbd.com',
    phone: '01720-112233',
    role: 'Inventory Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    password: 'stock123',
    permissions: ['Manage Products', 'Logistics & Store Settings'],
    status: 'Active',
    lastActive: '12 mins ago',
  },
  {
    id: 'staff-3',
    name: 'Tanvir Ahmed',
    email: 'tanvir.dispatch@jeansbd.com',
    phone: '01830-445566',
    role: 'Dispatch Coordinator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    password: 'dispatch123',
    permissions: ['Manage Orders', 'Assign Courier (Steadfast/Pathao)'],
    status: 'Active',
    lastActive: '45 mins ago',
  },
  {
    id: 'staff-4',
    name: 'Shirin Akter',
    email: 'shirin.care@jeansbd.com',
    phone: '01940-778899',
    role: 'Support Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    password: 'support123',
    permissions: ['Manage Orders', 'Customer Data Access'],
    status: 'Active',
    lastActive: '2 hours ago',
  },
];

const PERMISSION_GROUPS = [
  {
    category: 'Inventory & Products',
    icon: Package,
    color: 'text-amber-500',
    permissions: ['Manage Products', 'Discount Coupons'],
  },
  {
    category: 'Orders & Couriers',
    icon: Truck,
    color: 'text-blue-500',
    permissions: ['Manage Orders', 'Assign Courier (Steadfast/Pathao)'],
  },
  {
    category: 'Finance & Analytics',
    icon: CreditCard,
    color: 'text-emerald-500',
    permissions: ['Financial Reports & Analytics'],
  },
  {
    category: 'Store & Data Access',
    icon: Settings,
    color: 'text-purple-500',
    permissions: ['Logistics & Store Settings', 'Customer Data Access'],
  },
];

export default function AdminStaffPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formRole, setFormRole] = useState<StaffMember['role']>('Inventory Manager');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended'>('Active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'Manage Products',
    'Manage Orders',
  ]);

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStaff(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load staff list', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_staff', JSON.stringify(staff));
    } catch (e) {
      console.error('Failed to save staff list', e);
    }
  }, [staff, isLoaded]);

  const generatePassword = () => {
    const words = ['Jeans', 'Denim', 'Staff', 'Admin', 'BD', 'Secure', 'Hub'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const generated = `${word}@${num}`;
    setFormPassword(generated);
    setShowPassword(true);
    showToast('✨ Generated secure password!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('Photo size should be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('jeansbd' + Math.floor(100 + Math.random() * 900));
    setFormAvatar('');
    setFormRole('Inventory Manager');
    setFormStatus('Active');
    setSelectedPermissions(['Manage Products', 'Discount Coupons']);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone || '');
    setFormPassword(member.password || 'admin123');
    setFormAvatar(member.avatar || '');
    setFormRole(member.role);
    setFormStatus(member.status);
    setSelectedPermissions(member.permissions || []);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const applyRolePreset = (role: StaffMember['role']) => {
    setFormRole(role);
    if (role === 'Super Admin') {
      setSelectedPermissions([
        'Manage Products',
        'Manage Orders',
        'Assign Courier (Steadfast/Pathao)',
        'Discount Coupons',
        'Logistics & Store Settings',
        'Financial Reports & Analytics',
        'Customer Data Access',
      ]);
    } else if (role === 'Inventory Manager') {
      setSelectedPermissions(['Manage Products', 'Discount Coupons', 'Logistics & Store Settings']);
    } else if (role === 'Dispatch Coordinator') {
      setSelectedPermissions(['Manage Orders', 'Assign Courier (Steadfast/Pathao)']);
    } else if (role === 'Support Specialist') {
      setSelectedPermissions(['Manage Orders', 'Customer Data Access']);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      alert('Staff name and email are required');
      return;
    }

    const passwordVal = formPassword.trim() || 'admin123';

    if (editingStaff) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                name: formName.trim(),
                email: formEmail.trim().toLowerCase(),
                phone: formPhone.trim(),
                role: formRole,
                avatar: formAvatar.trim() || undefined,
                password: passwordVal,
                status: formStatus,
                permissions: selectedPermissions,
              }
            : s
        )
      );
      showToast(`Updated profile & privileges for ${formName}!`);
    } else {
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        role: formRole,
        avatar: formAvatar.trim() || undefined,
        password: passwordVal,
        permissions: selectedPermissions,
        status: formStatus,
        lastActive: 'Invited (Pending login)',
      };
      setStaff((prev) => [newStaff, ...prev]);
      showToast(`Added ${formName} as ${formRole}! Credentials ready.`);
    }
    setIsModalOpen(false);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleSelectAllPermissions = () => {
    const all = PERMISSION_GROUPS.flatMap((g) => g.permissions);
    if (selectedPermissions.length === all.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(all);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke access for ${name}?`)) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      showToast(`Staff access revoked for ${name}`);
    }
  };

  const copyCredentials = (member: StaffMember) => {
    const text = `Jeans BD Backoffice Access:\n👤 Staff: ${member.name}\n📧 Email: ${member.email}\n🔑 Password: ${member.password || 'admin123'}\n🌐 Portal: ${window.location.origin}/admin/login`;
    navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    showToast(`Copied ${member.name}'s login info to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleStaffStatus = (member: StaffMember) => {
    const newStatus = member.status === 'Active' ? 'Suspended' : 'Active';
    setStaff((prev) =>
      prev.map((s) => (s.id === member.id ? { ...s, status: newStatus } : s))
    );
    showToast(`${member.name} is now ${newStatus}`);
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.toLowerCase().includes(search.toLowerCase())) ||
      s.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalMembers = staff.length;
  const activeMembers = staff.filter((s) => s.status === 'Active').length;
  const suspendedMembers = totalMembers - activeMembers;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/40 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 border-slate-800'
            : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-100 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Role-Based Access Control &amp; Credentials</span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Staff &amp; Admin Privileges
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage staff accounts, assign profile photos, configure unique login passwords, and grant granular role permissions for order fulfillment, courier dispatching, and inventory.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all active:scale-95 group shrink-0"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Staff Member</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/30">
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/80 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Total Team</span>
            </div>
            <p className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalMembers}
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/80 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-500 uppercase">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Active Access</span>
            </div>
            <p className="text-xl font-black mt-1 text-emerald-500">{activeMembers}</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/80 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-500 uppercase">
              <UserX className="w-3.5 h-3.5" />
              <span>Suspended</span>
            </div>
            <p className="text-xl font-black mt-1 text-amber-500">{suspendedMembers}</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/80 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold text-purple-400 uppercase">
              <Key className="w-3.5 h-3.5" />
              <span>Auth Method</span>
            </div>
            <p className={`text-xs font-mono font-bold mt-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Email + Passkey
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`p-4 rounded-3xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff name, email, phone, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Role & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Role:
          </span>
          {['All', 'Super Admin', 'Inventory Manager', 'Dispatch Coordinator', 'Support Specialist'].map(
            (r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                  roleFilter === r
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isDark
                    ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {r === 'All' ? 'All Roles' : r}
              </button>
            )
          )}
        </div>
      </div>

      {/* Staff Grid Cards */}
      {filteredStaff.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <UserX className="w-12 h-12 mx-auto text-slate-500 mb-3 opacity-50" />
          <h3 className="text-base font-bold">No Staff Found</h3>
          <p className="text-xs mt-1">Try adjusting your search or role filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setRoleFilter('All');
              setStatusFilter('All');
            }}
            className="mt-4 text-xs font-bold text-blue-500 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStaff.map((member) => {
            const isPasswordVisible = visiblePasswords[member.id];
            const isSuperAdmin = member.role === 'Super Admin';

            return (
              <div
                key={member.id}
                className={`relative rounded-3xl border p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl ${
                  isDark
                    ? 'bg-slate-950/90 border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-900/40'
                    : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Header: Avatar, Name, Role Badge, Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Avatar Image / Fallback */}
                      <div className="relative">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/40 shadow-md ring-2 ring-blue-500/10"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-lg uppercase tracking-tight">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                        )}
                        {/* Status Glow Dot */}
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                            isDark ? 'border-slate-950' : 'border-white'
                          } ${
                            member.status === 'Active'
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                              : 'bg-red-500'
                          }`}
                          title={member.status}
                        />
                      </div>

                      {/* Name & Role */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-black text-base truncate ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {member.name}
                          </h3>
                        </div>

                        {/* Role Pill */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border inline-flex items-center gap-1 ${
                              isSuperAdmin
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                : member.role === 'Inventory Manager'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : member.role === 'Dispatch Coordinator'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>{member.role}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleStaffStatus(member)}
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                        member.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                      }`}
                      title="Click to toggle status"
                    >
                      {member.status}
                    </button>
                  </div>

                  {/* Contact Info (Email & Phone) */}
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className={`truncate font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {member.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <a
                        href={`tel:${member.phone}`}
                        className="font-mono text-emerald-500 hover:underline truncate"
                      >
                        {member.phone || 'No phone set'}
                      </a>
                    </div>
                  </div>

                  {/* Login Credentials Box (Password + Copy) */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                      isDark
                        ? 'bg-blue-950/20 border-blue-900/40 text-blue-300'
                        : 'bg-blue-50/60 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center shrink-0">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[9px] font-black uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Login Key / Password
                        </span>
                        <div className="flex items-center gap-2 font-mono text-xs font-bold">
                          <span>
                            {isPasswordVisible ? member.password || 'admin123' : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(member.id)}
                            className="text-slate-400 hover:text-blue-500"
                            title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCredentials(member)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 ${
                        copiedId === member.id
                          ? 'bg-emerald-600 text-white'
                          : isDark
                          ? 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30'
                          : 'bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 shadow-xs'
                      }`}
                      title="Copy Login Details for WhatsApp/SMS"
                    >
                      {copiedId === member.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Info</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Permissions Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] uppercase font-black tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Assigned Privileges ({member.permissions.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.permissions.map((p) => (
                        <span
                          key={p}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                            isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-300'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: Last active + Actions */}
                <div
                  className={`mt-4 pt-3.5 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  <span className="text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Last active: {member.lastActive}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(member)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        isDark
                          ? 'bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-white border border-slate-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-blue-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        isDark
                          ? 'bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800'
                          : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200'
                      }`}
                      title="Revoke staff access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-scale-up my-8 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-[#0b101c] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-2xl text-slate-900'
            }`}
          >
            {/* Modal Title */}
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingStaff ? 'Edit Staff Privileges & Credentials' : 'Add New Staff Member'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Set up photo avatar, secure password key, role &amp; access permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-xl transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* 1. PHOTO & AVATAR UPLOAD SECTION */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="block font-black uppercase tracking-wider text-xs mb-3">
                  Staff Profile Photo / Avatar
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    {formAvatar ? (
                      <img
                        src={formAvatar}
                        alt="Staff Avatar"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-md uppercase">
                        {formName
                          ? formName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                          : 'ST'}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {formAvatar && (
                        <button
                          type="button"
                          onClick={() => setFormAvatar('')}
                          className={`px-3 py-2 rounded-xl font-bold text-xs transition-colors ${
                            isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    {/* Quick Preset Avatars */}
                    <div>
                      <span className={`text-[10px] uppercase font-bold block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Or choose preset avatar:
                      </span>
                      <div className="flex items-center gap-2">
                        {PRESET_AVATARS.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormAvatar(url)}
                            className={`w-7 h-7 rounded-xl overflow-hidden border-2 transition-all ${
                              formAvatar === url
                                ? 'border-blue-500 scale-110 shadow-md ring-2 ring-blue-500/20'
                                : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt="Preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. BASIC PROFILE FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Staff Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ali Hasan Sheikh"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 font-medium transition-all ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Email Address (Login ID) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="staff@jeansbd.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 font-medium transition-all ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="01775-743148"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 font-medium transition-all ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Staff Role
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={formRole}
                      onChange={(e) => applyRolePreset(e.target.value as any)}
                      className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 font-bold transition-all ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Super Admin">Super Admin (Full Access)</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                      <option value="Dispatch Coordinator">Dispatch Coordinator</option>
                      <option value="Support Specialist">Support Specialist</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. PASSWORD & CREDENTIALS CONFIG */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-blue-950/20 border-blue-900/40' : 'bg-blue-50/70 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-black uppercase tracking-wider text-xs text-blue-500">
                    <Lock className="w-4 h-4" />
                    <span>Staff Login Password / Secret Key *</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter staff login password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className={`w-full border rounded-xl pl-4 pr-10 py-2.5 font-mono text-xs font-bold transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Staff member will enter their email address and this password to log in at{' '}
                  <span className="font-mono text-blue-400 font-bold">/admin/login</span>.
                </p>
              </div>

              {/* 4. PERMISSIONS CHECKBOX MATRIX */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-black uppercase tracking-wider text-xs text-slate-400">
                    Access Permissions Checkbox ({selectedPermissions.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={toggleSelectAllPermissions}
                    className="text-[11px] font-bold text-blue-500 hover:underline"
                  >
                    {selectedPermissions.length === PERMISSION_GROUPS.flatMap((g) => g.permissions).length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="space-y-3">
                  {PERMISSION_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <div
                        key={group.category}
                        className={`p-3 rounded-2xl border ${
                          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GroupIcon className={`w-3.5 h-3.5 ${group.color}`} />
                          <span className={`text-[11px] font-black uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {group.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.permissions.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm);
                            return (
                              <label
                                key={perm}
                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? isDark
                                      ? 'bg-blue-600/15 border-blue-500/50 text-blue-400 font-bold'
                                      : 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                                    : isDark
                                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs">{perm}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. ACCOUNT STATUS */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-900/40 border-slate-800">
                <div>
                  <span className="font-bold text-xs block text-slate-200">Account Access Status</span>
                  <span className="text-[11px] text-slate-400">
                    Suspended accounts cannot log in to backoffice
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Active')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      formStatus === 'Active'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Suspended')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      formStatus === 'Suspended'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Suspended
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className={`pt-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                >
                  {editingStaff ? 'Update Staff Member' : 'Save & Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
