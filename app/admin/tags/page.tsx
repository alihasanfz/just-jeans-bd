'use client';

import React, { useState, useEffect } from 'react';
import {
  Tags as TagsIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Sparkles,
  Hash,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

interface DenimTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  productCount: number;
  featured: boolean;
}

const INITIAL_TAGS: DenimTag[] = [
  { id: 'tag-1', name: 'Bestseller', slug: 'bestseller', color: '#f59e0b', productCount: 18, featured: true },
  { id: 'tag-2', name: 'New Arrival 2026', slug: 'new-arrival-2026', color: '#3b82f6', productCount: 12, featured: true },
  { id: 'tag-3', name: '100% Turkish Cotton', slug: 'turkish-cotton', color: '#10b981', productCount: 28, featured: true },
  { id: 'tag-4', name: 'Vintage 90s Wash', slug: 'vintage-90s', color: '#8b5cf6', productCount: 15, featured: false },
  { id: 'tag-5', name: 'Heavyweight 14oz', slug: 'heavyweight-14oz', color: '#ec4899', productCount: 9, featured: false },
  { id: 'tag-6', name: 'Streetwear Baggy', slug: 'streetwear-baggy', color: '#06b6d4', productCount: 14, featured: true },
  { id: 'tag-7', name: 'High-Rise Sculpt', slug: 'high-rise-sculpt', color: '#f43f5e', productCount: 11, featured: false },
  { id: 'tag-8', name: 'Limited Run Drop', slug: 'limited-run', color: '#eab308', productCount: 6, featured: true },
];

export default function AdminTagsPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [tags, setTags] = useState<DenimTag[]>(INITIAL_TAGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<DenimTag | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formFeatured, setFormFeatured] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_tags');
      if (saved) {
        setTags(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load tags', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_tags', JSON.stringify(tags));
    } catch (e) {
      console.error('Failed to save tags', e);
    }
  }, [tags, isLoaded]);

  const openCreateModal = () => {
    setEditingTag(null);
    setFormName('');
    setFormSlug('');
    setFormColor('#3b82f6');
    setFormFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (tag: DenimTag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setFormColor(tag.color);
    setFormFeatured(tag.featured);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const slug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingTag) {
      setTags((prev) =>
        prev.map((t) =>
          t.id === editingTag.id
            ? { ...t, name: formName, slug, color: formColor, featured: formFeatured }
            : t
        )
      );
    } else {
      const newTag: DenimTag = {
        id: `tag-${Date.now()}`,
        name: formName,
        slug,
        color: formColor,
        productCount: 0,
        featured: formFeatured,
      };
      setTags((prev) => [newTag, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this tag?')) {
      setTags((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <TagsIcon className="w-4 h-4" />
            <span>Product Taxonomy</span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Denim Marketing Tags
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Badge highlights, search filters, and campaign markers
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tag</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tags..."
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
          Total: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filteredTags.length}</strong> tags
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTags.map((tag) => (
          <div
            key={tag.id}
            className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
              isDark ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <h3 className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{tag.name}</h3>
              </div>
              {tag.featured && (
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/20 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            <div className={`flex items-center justify-between text-xs pt-3 border-t ${isDark ? 'border-slate-900 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
              <span className="font-mono text-[11px]">#{tag.slug}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {tag.productCount} items
              </span>
            </div>

            <div className={`mt-3 pt-3 border-t flex justify-end gap-1.5 ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
              <button
                onClick={() => openEditModal(tag)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                }`}
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600'
                }`}
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 space-y-4 animate-scale-up ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingTag ? 'Edit Marketing Tag' : 'New Marketing Tag'}
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
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tag Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100% Turkish Cotton"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Slug</label>
                <input
                  type="text"
                  placeholder="e.g. turkish-cotton"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Badge Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className={`flex-1 border rounded-xl px-3.5 py-2 font-mono ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <label className={`flex items-center gap-2 font-semibold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Feature Tag Badge on Store Product Cards</span>
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
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
