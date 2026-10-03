'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  UserCheck,
  Key,
  Lock,
  Mail,
  Phone,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Inventory Manager' | 'Dispatch Coordinator' | 'Support Specialist';
  permissions: string[];
  status: 'Active' | 'Suspended';
  lastActive: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Hasan Sheikh',
    email: 'hasansheikh9080@gmail.com',
    phone: '01775743148',
    role: 'Super Admin',
    permissions: ['All Permissions', 'Manage Products', 'Manage Orders', 'Logistics Settings', 'Financial Reports'],
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: 'staff-2',
    name: 'Anisur Rahman',
    email: 'anis.stock@jeansbd.com',
    phone: '01720-112233',
    role: 'Inventory Manager',
    permissions: ['Manage Products', 'Adjust Stock', 'Print Barcodes'],
    status: 'Active',
    lastActive: '12 mins ago',
  },
  {
    id: 'staff-3',
    name: 'Tanvir Ahmed',
    email: 'tanvir.dispatch@jeansbd.com',
    phone: '01830-445566',
    role: 'Dispatch Coordinator',
    permissions: ['Manage Orders', 'Assign Courier (Steadfast/Pathao)', 'Print Shipping Slips'],
    status: 'Active',
    lastActive: '45 mins ago',
  },
  {
    id: 'staff-4',
    name: 'Shirin Akter',
    email: 'shirin.care@jeansbd.com',
    phone: '01940-778899',
    role: 'Support Specialist',
    permissions: ['View Orders', 'Track Status', 'Customer Inquiries'],
    status: 'Active',
    lastActive: '2 hours ago',
  },
];

export default function AdminStaffPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<StaffMember['role']>('Inventory Manager');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended'>('Active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'Manage Products',
    'Manage Orders',
  ]);

  const availablePermissions = [
    'Manage Products',
    'Manage Orders',
    'Assign Courier (Steadfast/Pathao)',
    'Discount Coupons',
    'Logistics & Store Settings',
    'Financial Reports & Analytics',
    'Customer Data Access',
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_staff');
      if (saved) {
        setStaff(JSON.parse(saved));
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

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Inventory Manager');
    setFormStatus('Active');
    setSelectedPermissions(['Manage Products']);
    setIsModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone);
    setFormRole(member.role);
    setFormStatus(member.status);
    setSelectedPermissions(member.permissions);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingStaff) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                name: formName,
                email: formEmail,
                phone: formPhone,
                role: formRole,
                status: formStatus,
                permissions: selectedPermissions,
              }
            : s
        )
      );
    } else {
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        permissions: selectedPermissions,
        status: formStatus,
        lastActive: 'Invited (Pending login)',
      };
      setStaff((prev) => [...prev, newStaff]);
    }
    setIsModalOpen(false);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to revoke this staff member access?')) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sub-Admins & Store Staff
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Assign team member permissions for order packaging, inventory updates, and dispatching
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div
        className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Active Members: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filteredStaff.length}</strong>
        </span>
      </div>

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className={`rounded-2xl border p-5 space-y-4 transition-all shadow-sm flex flex-col justify-between ${
              isDark ? 'bg-slate-950/90 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-base leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {member.name}
                    </h3>
                    <span className={`text-xs flex items-center gap-1.5 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Mail className="w-3 h-3 text-blue-500" />
                      {member.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      member.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                <div>
                  <span className={`text-[11px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Staff Role
                  </span>
                  <span className={`font-bold flex items-center gap-1 mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    {member.role}
                  </span>
                </div>

                <div>
                  <span className={`text-[11px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Phone Helpline
                  </span>
                  <a href={`tel:${member.phone}`} className="font-mono text-emerald-500 block mt-0.5">
                    {member.phone}
                  </a>
                </div>
              </div>

              {/* Permissions Tags */}
              <div className="mt-3">
                <span className={`text-[10px] uppercase font-bold block mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Granted Privileges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.permissions.map((p) => (
                    <span
                      key={p}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={`pt-3 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-900 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
              <span className="text-[11px]">Last active: {member.lastActive}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(member)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                  title="Edit permissions"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600'
                  }`}
                  title="Revoke access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-lg w-full p-6 space-y-4 animate-scale-up ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingStaff ? 'Edit Staff Privileges' : 'Invite Staff Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Mahmud"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@jeansbd.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="01700-000000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Dispatch Coordinator">Dispatch Coordinator</option>
                    <option value="Support Specialist">Support Specialist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Access Permissions Checkbox
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => (
                    <label
                      key={perm}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                        selectedPermissions.includes(perm)
                          ? isDark
                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 font-bold'
                            : 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                          : isDark
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`pt-3 border-t flex justify-end gap-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md"
                >
                  {editingStaff ? 'Update Staff Member' : 'Invite Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
