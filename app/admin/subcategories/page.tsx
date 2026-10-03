'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { useProducts } from '@/lib/store/productsContext';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parentCategory: string;
  fabricType: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

const INITIAL_SUBCATEGORIES: SubCategory[] = [
  {
    id: 'sub-1',
    name: '13.5oz Rigid Heavyweight',
    slug: 'rigid-heavyweight',
    parentCategory: "Men's Baggy & Wide Fit",
    fabricType: '100% Cotton 3/1 Right Hand Twill',
    productCount: 14,
    status: 'Active',
  },
  {
    id: 'sub-2',
    name: 'Turkish Flex Stretch Denim',
    slug: 'flex-stretch',
    parentCategory: "Men's Slim Fit Jeans",
    fabricType: '98% Cotton, 2% Elastane Spandex',
    productCount: 18,
    status: 'Active',
  },
  {
    id: 'sub-3',
    name: 'Vintage Stone Washed',
    slug: 'stone-wash',
    parentCategory: "Men's Straight Leg Jeans",
    fabricType: 'Enzyme Treated Ring-Spun Cotton',
    productCount: 12,
    status: 'Active',
  },
  {
    id: 'sub-4',
    name: 'Multi-Pocket Carpenter Cargo',
    slug: 'carpenter-cargo',
    parentCategory: "Men's Denim Cargo Jeans",
    fabricType: 'Reinforced Cordura Blend Cotton',
    productCount: 9,
    status: 'Active',
  },
  {
    id: 'sub-5',
    name: 'Retro 90s Acid Wash',
    slug: 'acid-wash',
    parentCategory: "Women's Vintage Mom Jeans",
    fabricType: 'Ozone Washed Ring Cotton',
    productCount: 11,
    status: 'Active',
  },
  {
    id: 'sub-6',
    name: 'Sculpt & Lift High-Rise',
    slug: 'sculpt-high-rise',
    parentCategory: "Women's High-Rise Wide Leg",
    fabricType: 'Soft Lycra Flex Denim',
    productCount: 15,
    status: 'Active',
  },
  {
    id: 'sub-7',
    name: 'Sherpa Lined Trucker Outerwear',
    slug: 'sherpa-trucker',
    parentCategory: "Men's Denim Jackets",
    fabricType: '14oz Cotton + Poly Fleece',
    productCount: 8,
    status: 'Active',
  },
];

export default function AdminSubCategoriesPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const { categories } = useProducts();

  const [subCats, setSubCats] = useState<SubCategory[]>(INITIAL_SUBCATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedParent, setSelectedParent] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formParent, setFormParent] = useState("Men's Slim Fit Jeans");
  const [formFabric, setFormFabric] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_subcategories');
      if (saved) {
        setSubCats(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load subcategories', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_subcategories', JSON.stringify(subCats));
    } catch (e) {
      console.error('Failed to save subcategories', e);
    }
  }, [subCats, isLoaded]);

  // Dynamically derive parent categories from productsContext
  const parentCategoryOptions = [
    'All',
    ...Array.from(new Set([
      ...categories.map((c) => c.name),
      "Men's Slim Fit Jeans",
      "Men's Baggy & Wide Fit",
      "Men's Straight Leg Jeans",
      "Men's Denim Cargo Jeans",
      "Women's High-Rise Wide Leg",
      "Women's Vintage Mom Jeans",
      "Men's Denim Jackets",
    ]))
  ];

  const openCreateModal = () => {
    setEditingSub(null);
    setFormName('');
    setFormSlug('');
    setFormParent(categories[0]?.name || "Men's Slim Fit Jeans");
    setFormFabric('100% Turkish Ring-Spun Cotton');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: SubCategory) => {
    setEditingSub(sub);
    setFormName(sub.name);
    setFormSlug(sub.slug);
    setFormParent(sub.parentCategory);
    setFormFabric(sub.fabricType);
    setFormStatus(sub.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const slug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingSub) {
      setSubCats((prev) =>
        prev.map((s) =>
          s.id === editingSub.id
            ? {
                ...s,
                name: formName,
                slug,
                parentCategory: formParent,
                fabricType: formFabric,
                status: formStatus,
              }
            : s
        )
      );
    } else {
      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        name: formName,
        slug,
        parentCategory: formParent,
        fabricType: formFabric,
        productCount: 0,
        status: formStatus,
      };
      setSubCats((prev) => [newSub, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this sub-category?')) {
      setSubCats((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const filteredSubs = subCats.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.fabricType.toLowerCase().includes(search.toLowerCase());
    const matchesParent = selectedParent === 'All' || s.parentCategory === selectedParent;
    return matchesSearch && matchesParent;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" />
            <span>Product Taxonomy</span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Denim Sub-Categories
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Classify denim by wash type, fabric weight (oz), and special treatments
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sub-Category</span>
        </button>
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
            placeholder="Search sub-categories or fabrics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <select
          value={selectedParent}
          onChange={(e) => setSelectedParent(e.target.value)}
          className={`border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {parentCategoryOptions.map((p) => (
            <option key={p} value={p}>
              {p === 'All' ? 'All Parent Categories' : p}
            </option>
          ))}
        </select>
      </div>

      {/* Table List */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`font-bold uppercase tracking-wider text-[11px] border-b ${
                isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <tr>
                <th className="py-3 px-4">Sub-Category Name</th>
                <th className="py-3 px-4">Parent Category</th>
                <th className="py-3 px-4">Fabric / Material Spec</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-medium ${
                isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-100 text-slate-700'
              }`}
            >
              {filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-3.5 px-4">
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{sub.name}</div>
                    <span className="text-[10px] text-blue-500">/{sub.slug}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    <span
                      className={`px-2.5 py-1 rounded-lg border ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {sub.parentCategory}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {sub.fabricType}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-blue-500/10 text-blue-500 font-black px-2.5 py-1 rounded-md text-xs border border-blue-500/20">
                      {sub.productCount} Items
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        sub.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(sub)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600'
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                {editingSub ? 'Edit Sub-Category' : 'New Sub-Category'}
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
                  Sub-Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 13.5oz Rigid Heavyweight"
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
                    Parent Category *
                  </label>
                  <select
                    value={formParent}
                    onChange={(e) => setFormParent(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {parentCategoryOptions
                      .filter((p) => p !== 'All')
                      .map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                  </select>
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
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Fabric / Material Spec
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Turkish Cotton 13oz twill"
                  value={formFabric}
                  onChange={(e) => setFormFabric(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 ${
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
                  {editingSub ? 'Update Sub-Category' : 'Create Sub-Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
