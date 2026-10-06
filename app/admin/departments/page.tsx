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
  Tag,
  ShoppingBag,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { idbGet, idbSet } from '@/lib/utils/db';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft'>('Active');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formBanner, setFormBanner] = useState('');

  // Load from IndexedDB and LocalStorage on mount
  useEffect(() => {
    async function loadDepts() {
      try {
        const idbDepts = await idbGet<Department[]>('jeansbd_departments');
        if (idbDepts && Array.isArray(idbDepts) && idbDepts.length > 0) {
          setDepartments(idbDepts);
        } else {
          const saved = localStorage.getItem('jeansbd_departments');
          if (saved) {
            setDepartments(JSON.parse(saved));
          }
        }
      } catch (e) {
        console.error('Failed to load departments', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadDepts();
  }, []);

  // Save to IndexedDB and LocalStorage when updated
  useEffect(() => {
    if (!isLoaded) return;
    idbSet('jeansbd_departments', departments);
    try {
      localStorage.setItem('jeansbd_departments', JSON.stringify(departments));
    } catch (e) {
      console.warn('LocalStorage quota limit reached; saved to IndexedDB');
    }
  }, [departments, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
                bannerUrl: formBanner || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
              }
            : d
        )
      );
      showToast(`Department "${formName}" updated successfully!`);
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: formName,
        slug,
        itemCount: 0,
        description: formDesc,
        status: formStatus,
        featured: formFeatured,
        bannerUrl: formBanner || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
      };
      setDepartments((prev) => [newDept, ...prev]);
      showToast(`New department "${formName}" created successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? Products in this department will remain intact.`)) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showToast(`Department "${name}" removed.`);
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = departments.filter((d) => d.status === 'Active').length;
  const featuredCount = departments.filter((d) => d.featured).length;
  const totalItems = departments.reduce((acc, curr) => acc + curr.itemCount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
            <Split className="w-4 h-4 text-blue-400" />
            <span>Product Taxonomy & Store Divisions</span>
          </div>
          <h1 className={`text-2xl lg:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Denim Departments
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Organize main storefront divisions (Men, Women, Unisex, Outerwear, Accessories) with custom photo banners
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Departments</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
              <Split className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {departments.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Configured divisions</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active Live</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activeCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Visible on store navigation</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Featured</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {featuredCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Highlighted in header & hero</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Total Items Mapped</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalItems}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Catalog products linked</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by name, slug or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
        <div className={`text-xs font-semibold px-2 flex items-center justify-between sm:justify-end gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>Showing:</span>
          <strong className={`px-2 py-0.5 rounded-lg border ${isDark ? 'text-white bg-slate-900 border-slate-800' : 'text-slate-900 bg-slate-100 border-slate-200'}`}>
            {filteredDepts.length} of {departments.length}
          </strong>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <div
            key={dept.id}
            className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:shadow-blue-600/10 ${
              isDark
                ? 'bg-slate-950/90 border-slate-800/80 hover:border-blue-500/50'
                : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-sm'
            }`}
          >
            {/* Banner Photo Container */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-900">
              <img
                src={dept.bannerUrl || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80'}
                alt={dept.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

              {/* Status and Featured Badges */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                {dept.featured && (
                  <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-1 backdrop-blur-md shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Featured</span>
                  </span>
                )}
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border backdrop-blur-md flex items-center gap-1 ${
                    dept.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      dept.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span>{dept.status}</span>
                </span>
              </div>

              {/* Department Name and Slug */}
              <div className="absolute bottom-3 left-4 right-4 z-10">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest block mb-0.5">
                  /{dept.slug}
                </span>
                <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                  {dept.name}
                </h3>
              </div>
            </div>

            {/* Department Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {dept.description || 'No description provided for this department.'}
              </p>

              {/* Bottom Card Controls */}
              <div className={`pt-3.5 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Catalog Items:
                  </span>
                  <strong
                    className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                      isDark
                        ? 'text-blue-400 bg-blue-950/40 border-blue-900/50'
                        : 'text-blue-700 bg-blue-50 border-blue-200'
                    }`}
                  >
                    {dept.itemCount} items
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(dept)}
                    className={`p-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1 active:scale-95 ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
                    }`}
                    title="Edit department"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    className={`p-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1 active:scale-95 ${
                      isDark
                        ? 'bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40'
                        : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200'
                    }`}
                    title="Delete department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/shop?gender=${dept.slug}`}
                    target="_blank"
                    className={`p-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1 active:scale-95 ${
                      isDark
                        ? 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20'
                        : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200'
                    }`}
                    title="View department in store"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-scale-up my-8 ${
              isDark ? 'bg-slate-950 border-slate-800 shadow-2xl shadow-black/80' : 'bg-white border-slate-200 shadow-2xl'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Split className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingDept ? 'Edit Department' : 'Create New Department'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Configure department name, slug, description, and custom photo banner
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className={`block font-bold uppercase text-[11px] mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Men's Denim Department"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. men"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Used in link: /shop?gender={formSlug || 'slug'}</span>
                </div>

                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload from Computer or Web URL */}
              <div>
                <ImageUploadField
                  label="Department Banner Photo (Upload from Computer)"
                  value={formBanner}
                  onChange={setFormBanner}
                  aspect="landscape"
                  helpText="Click 'Upload from Computer' to pick an image from your device, or click 'Paste Web URL' to use an online link."
                />
              </div>

              <div>
                <label className={`block font-bold uppercase text-[11px] mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this department for customers and SEO..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full border rounded-xl p-3 leading-relaxed ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40">
                <label className={`flex items-center gap-2.5 font-semibold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Feature on Store Homepage & Header</span>
                    <span className="text-[11px] text-slate-400 block font-normal">Showcase as a priority category tab on mobile navigation and store hero.</span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className={`pt-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95"
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
