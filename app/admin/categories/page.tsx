'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Layers,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/lib/store/productsContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { Category, GenderCategory } from '@/types';
import ImageUploadField from '@/components/admin/ImageUploadField';

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, syncCategoriesToSupabase, isCloudConnected } = useProducts();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [cats, setCats] = useState<Category[]>(categories);
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Sync cats whenever productsContext categories change
  useEffect(() => {
    setCats(categories);
  }, [categories]);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formGender, setFormGender] = useState<GenderCategory>('men');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  const openCreateModal = () => {
    setEditingCat(null);
    setFormName('');
    setFormSlug('');
    setFormGender('men');
    setFormDesc('');
    setFormImage('https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormGender(cat.gender);
    setFormDesc(cat.description);
    setFormImage(cat.image);
    setIsModalOpen(true);
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncCategoriesToSupabase();
      if (res.success) {
        setSyncStatus(`Successfully synced ${res.count} categories to live website!`);
      } else {
        setSyncStatus(`Sync error: ${res.message}`);
      }
    } catch (e: any) {
      setSyncStatus(`Sync error: ${e?.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const slug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingCat) {
      await updateCategory(editingCat.id, {
        name: formName,
        slug,
        gender: formGender,
        description: formDesc,
        image: formImage,
      });
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug,
        gender: formGender,
        description: formDesc,
        image: formImage,
        itemCount: 0,
      };
      await addCategory(newCategory);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this category? Products in this category will become unassigned.')) {
      deleteCategory(id);
    }
  };

  const filteredCategories = cats.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesGender = selectedGender === 'all' || c.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Product Taxonomy</span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Denim Categories
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage Homepage &quot;Shop by Category&quot; cards, photos, and fits
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isCloudConnected && (
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border shadow-xs active:scale-95 ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-blue-400 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-blue-600 border-slate-200'
              } ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Push all categories to Supabase cloud database to update live website across all devices"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Syncing to Cloud...' : 'Sync to Live Site'}</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
          syncStatus.includes('error') || syncStatus.includes('Error')
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Homepage Integration Info Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap ${
        isDark ? 'bg-blue-950/20 border-blue-900/40 text-blue-300' : 'bg-blue-50/80 border-blue-200/70 text-blue-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Homepage &quot;Shop by Category&quot; Control</h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              Editing these categories immediately updates the 8 cards shown in the &quot;Shop by Category&quot; grid on the Homepage.
            </p>
          </div>
        </div>
        <Link
          href="/#shop-by-category"
          target="_blank"
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <span>View on Homepage</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'men', 'women'].map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedGender === gender
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all group ${
              isDark
                ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-2.5 right-2.5">
                <span className="bg-black/70 backdrop-blur-md text-blue-400 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border border-white/10">
                  {cat.gender}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-3 right-3">
                <h3 className="text-sm font-black text-white leading-snug">{cat.name}</h3>
              </div>
            </div>

            <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
              <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {cat.description}
              </p>

              <div className={`pt-2 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Items: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{cat.itemCount || 10}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600'
                    }`}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    target="_blank"
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white'
                    }`}
                    title="Preview on shop"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-6 space-y-4 animate-scale-up ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingCat ? 'Edit Category' : 'Create New Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Men's Baggy & Wide Fit"
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
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mens-baggy-jeans"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Gender Group
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Cover Image (Upload from Computer)"
                value={formImage}
                onChange={setFormImage}
                aspect="landscape"
                helpText="Upload a category cover photo from your computer."
              />

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
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
                  {editingCat ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
