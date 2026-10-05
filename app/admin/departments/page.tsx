'use client';

import React, { useState, useEffect } from 'react';
import {
  Split,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

interface Department {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  description: string;
  status: 'Active' | 'Draft';
  featured: boolean;
  bannerUrl: string;
}

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: "Men's Denim Department",
    slug: 'men',
    itemCount: 42,
    description: 'Men slim, straight, baggy, cargo fits & denim trucker jackets.',
    status: 'Active',
    featured: true,
    bannerUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dept-2',
    name: "Women's Denim Department",
    slug: 'women',
    itemCount: 38,
    description: 'High-rise wide leg, vintage mom jeans, skinny sculpt & crop jackets.',
    status: 'Active',
    featured: true,
    bannerUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dept-3',
    name: "Unisex & Streetwear Denim",
    slug: 'unisex',
    itemCount: 24,
    description: 'Oversized skater cuts, heavy drop-crotch & neutral tones.',
    status: 'Active',
    featured: false,
    bannerUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dept-4',
    name: "Outerwear & Jackets",
    slug: 'outerwear',
    itemCount: 16,
    description: 'Authentic 14oz trucker denim jackets, washed sherpa denim coats.',
    status: 'Active',
    featured: true,
    bannerUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dept-5',
    name: "Denim Accessories & Belts",
    slug: 'accessories',
    itemCount: 12,
    description: 'Full-grain leather belts, denim tote bags, cap accessories.',
    status: 'Draft',
    featured: false,
    bannerUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
  },
];

export default function AdminDepartmentsPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft'>('Active');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formBanner, setFormBanner] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_departments');
      if (saved) {
        setDepartments(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load departments', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_departments', JSON.stringify(departments));
    } catch (e) {
      console.error('Failed to save departments', e);
    }
  }, [departments, isLoaded]);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormStatus('Active');
    setFormFeatured(false);
    setFormBanner('https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormSlug(dept.slug);
    setFormDesc(dept.description);
    setFormStatus(dept.status);
    setFormFeatured(dept.featured);
    setFormBanner(dept.bannerUrl);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const slug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDept.id
            ? {
                ...d,
                name: formName,
                slug,
                description: formDesc,
                status: formStatus,
                featured: formFeatured,
                bannerUrl: formBanner,
              }
            : d
        )
      );
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: formName,
        slug,
        itemCount: 0,
        description: formDesc,
        status: formStatus,
        featured: formFeatured,
        bannerUrl: formBanner,
      };
      setDepartments((prev) => [newDept, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <Split className="w-4 h-4" />
            <span>Product Taxonomy</span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Denim Departments
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Organize high-level store divisions (Men, Women, Unisex, Outerwear)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div
        className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
        <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Total: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filteredDepts.length}</strong> departments
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepts.map((dept) => (
          <div
            key={dept.id}
            className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all shadow-md group ${
              isDark
                ? 'bg-slate-950/90 border-slate-800/80 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="relative h-36 w-full overflow-hidden bg-slate-900">
              <img
                src={dept.bannerUrl}
                alt={dept.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {dept.featured && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                )}
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    dept.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600'
                  }`}
                >
                  {dept.status}
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  /{dept.slug}
                </span>
                <h3 className="text-base font-black text-white">{dept.name}</h3>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {dept.description}
              </p>

              <div className={`pt-3 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Items:{' '}
                  <strong className={`px-2 py-0.5 rounded border ${isDark ? 'text-white bg-slate-900 border-slate-800' : 'text-slate-900 bg-slate-100 border-slate-200'}`}>
                    {dept.itemCount}
                  </strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(dept)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600'
                    }`}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/shop?gender=${dept.slug}`}
                    target="_blank"
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white'
                    }`}
                    title="View in Store"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-lg w-full p-6 space-y-4 animate-scale-up ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Men's Denim Department"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. men"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Banner Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formBanner}
                  onChange={(e) => setFormBanner(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short summary of this department..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <label className={`flex items-center gap-2 font-semibold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Feature on Store Homepage & Header</span>
              </label>

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
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
