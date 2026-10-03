'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Package,
  Check,
  X,
  Camera,
  Upload,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/lib/store/productsContext';
import { Product, ProductFit, GenderCategory } from '@/types';
import { formatPrice } from '@/lib/utils';

const ANGLE_SLOTS = [
  { id: 0, label: '1. FRONT VIEW (MAIN)', hint: 'Front angle' },
  { id: 1, label: '2. BACK VIEW (REAR)', hint: 'Rear design & text' },
  { id: 2, label: '3. SIDE PROFILE', hint: 'Leg drape' },
  { id: 3, label: '4. CLOSE-UP TEXTURE', hint: 'Fabric & stitch' },
  { id: 4, label: '5. MODEL FIT POSE', hint: 'Full body look' },
  { id: 5, label: '6. EXTRA ANGLE', hint: 'Hem & detail' },
];

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading denim inventory console...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states matching screenshot
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formFit, setFormFit] = useState<ProductFit>('Straight Fit');
  const [formGender, setFormGender] = useState<GenderCategory>('men');
  const [formCategory, setFormCategory] = useState("Men's Straight Leg Jeans");
  const [formPrice, setFormPrice] = useState<number>(4500);
  const [formDiscountPrice, setFormDiscountPrice] = useState<number>(3890);
  const [formStock, setFormStock] = useState<number>(30);
  const [formWash, setFormWash] = useState('Raw Deep Indigo');
  const [formFabric, setFormFabric] = useState('100% Ring-Spun Cotton');
  const [formDescription, setFormDescription] = useState(
    'Crafted with durable selvedge yarns, signature back pocket details, and premium comfort stretch.'
  );

  // 6 Image Slots
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [formThumbnail, setFormThumbnail] = useState(
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
  );
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Hidden file inputs for 6 slots
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openCreateModal();
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSubtitle('');
    setFormFit('Straight Fit');
    setFormGender('men');
    setFormCategory("Men's Straight Leg Jeans");
    setFormPrice(4500);
    setFormDiscountPrice(3890);
    setFormStock(30);
    setFormWash('Raw Deep Indigo');
    setFormFabric('100% Ring-Spun Cotton');
    setFormDescription(
      'Crafted with durable selvedge yarns, signature back pocket details, and premium comfort stretch.'
    );
    setFormImages([
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      '',
      '',
      '',
      '',
      '',
    ]);
    setFormThumbnail('https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSubtitle(product.subtitle || '');
    setFormFit(product.fit);
    setFormGender(product.gender);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormDiscountPrice(product.discountPrice || product.price);
    setFormStock(product.totalStock);
    setFormWash(product.washColor || 'Vintage Wash');
    setFormFabric(product.fabricComposition || '100% Cotton Denim');
    setFormDescription(product.description);

    // populate 6 slots
    const loadedImages = [...(product.images || [])];
    if (product.thumbnail && !loadedImages.includes(product.thumbnail)) {
      loadedImages.unshift(product.thumbnail);
    }
    const slots = [0, 1, 2, 3, 4, 5].map((i) => loadedImages[i] || '');
    setFormImages(slots);
    setFormThumbnail(product.thumbnail || slots[0] || '');
    setIsModalOpen(true);
  };

  // Upload handler for single slot
  const handleSlotFile = async (slotIndex: number, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setUploadingSlot(slotIndex);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          applySlotUrl(slotIndex, data.url);
          setUploadingSlot(null);
          return;
        }
      }

      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          applySlotUrl(slotIndex, e.target.result as string);
        }
        setUploadingSlot(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload slot error:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          applySlotUrl(slotIndex, e.target.result as string);
        }
        setUploadingSlot(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applySlotUrl = (index: number, url: string) => {
    setFormImages((prev) => {
      const copy = [...prev];
      copy[index] = url;
      return copy;
    });
    if (index === 0 || !formThumbnail) {
      setFormThumbnail(url);
    }
  };

  const removeSlotImage = (index: number) => {
    setFormImages((prev) => {
      const copy = [...prev];
      copy[index] = '';
      return copy;
    });
    if (index === 0) {
      setFormThumbnail('');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const discountPct =
      formPrice > formDiscountPrice
        ? Math.round(((formPrice - formDiscountPrice) / formPrice) * 100)
        : 0;

    // Filter non-empty images from slots
    const validImages = formImages.filter((img) => img && img.trim() !== '');
    const mainThumbnail = formThumbnail.trim() || validImages[0] || 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80';

    const variants = [
      { id: `v-${Date.now()}-1`, size: '28', color: formWash || 'Raw Deep Indigo', colorHex: '#1e3a8a', sku: `JBD-${slug.slice(0, 4).toUpperCase()}-28`, stock: Math.floor(formStock / 4) },
      { id: `v-${Date.now()}-2`, size: '30', color: formWash || 'Raw Deep Indigo', colorHex: '#1e3a8a', sku: `JBD-${slug.slice(0, 4).toUpperCase()}-30`, stock: Math.floor(formStock / 3) },
      { id: `v-${Date.now()}-3`, size: '32', color: formWash || 'Raw Deep Indigo', colorHex: '#1e3a8a', sku: `JBD-${slug.slice(0, 4).toUpperCase()}-32`, stock: Math.floor(formStock / 3) },
      { id: `v-${Date.now()}-4`, size: '34', color: formWash || 'Raw Deep Indigo', colorHex: '#1e3a8a', sku: `JBD-${slug.slice(0, 4).toUpperCase()}-34`, stock: Math.floor(formStock / 4) },
    ];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName,
        subtitle: formSubtitle,
        gender: formGender,
        category: formCategory,
        fit: formFit,
        washColor: formWash,
        fabricComposition: formFabric,
        price: formPrice,
        discountPrice: formDiscountPrice,
        discountPercentage: discountPct,
        totalStock: formStock,
        thumbnail: mainThumbnail,
        images: validImages.length > 0 ? validImages : [mainThumbnail],
        description: formDescription,
      });
    } else {
      addProduct({
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        name: formName,
        subtitle: formSubtitle,
        gender: formGender,
        category: formCategory,
        fit: formFit,
        washColor: formWash,
        fabricComposition: formFabric,
        description: formDescription,
        details: [
          formFabric || '100% Ring-Spun Cotton',
          `Wash: ${formWash || 'Raw Deep Indigo'}`,
          `Fit silhouette: ${formFit}`,
          'Reinforced copper rivet points & heavy-duty bar tacks',
        ],
        fabricCare: ['Machine wash cold inside out', 'Hang dry in shade to preserve indigo tone'],
        price: formPrice,
        discountPrice: formDiscountPrice,
        discountPercentage: discountPct,
        thumbnail: mainThumbnail,
        images: validImages.length > 0 ? validImages : [mainThumbnail],
        rating: 5.0,
        reviewCount: 1,
        isNewArrival: true,
        isBestSeller: false,
        isFeatured: true,
        isOnSale: formDiscountPrice < formPrice,
        totalStock: formStock,
        tags: [formFit.toLowerCase().replace(/\s+/g, '-'), formGender, 'denim-atelier'],
        variants,
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = selectedGenderFilter === 'all' || p.gender === selectedGenderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Inventory Management</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Denim Catalog & Products
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your cuts, washes, inventory counts, and multi-angle product photography
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Denim Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, fit, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {['all', 'men', 'women'].map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGenderFilter(gender)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedGenderFilter === gender
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Fit & Gender</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                        <img src={prod.thumbnail} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{prod.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{prod.subtitle || prod.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300 font-bold mr-2">
                      {prod.fit}
                    </span>
                    <span className="text-[11px] uppercase font-bold text-amber-400">
                      {prod.gender}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-white text-sm">৳{prod.discountPrice || prod.price}</div>
                    {prod.discountPrice && prod.discountPrice < prod.price && (
                      <span className="text-[10px] text-slate-500 line-through">৳{prod.price}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                        prod.totalStock > 10
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {prod.totalStock} in stock
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="View storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${prod.name}" from catalog?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete product"
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

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT (MATCHING SCREENSHOT PERFECTLY) */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative bg-[#0d1322] border border-slate-800/90 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl my-auto max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800/80 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
                    {editingProduct ? 'Edit Denim Product' : 'Add New Denim Product'}
                  </h2>
                  <span className="bg-[#241805] text-[#f59e0b] border border-[#f59e0b]/40 rounded-full px-3 py-0.5 text-[11px] font-black tracking-wider uppercase">
                    DENIM ATELIER
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Configure denim specifications and upload up to 6 multi-angle showcase photos directly from your computer files.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: PRODUCT SPECIFICATIONS */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-[#f59e0b] font-black text-xs uppercase tracking-wider pb-1.5 border-b border-slate-800">
                    PRODUCT SPECIFICATIONS
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                      PRODUCT NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Angel Wings Graphic Print Wide Leg Slouchy Jeans"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Subtitle / Tagline */}
                  <div>
                    <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                      SUBTITLE / TAGLINE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Casual Streetwear Statement with Back Pocket Text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Fit Silhouette & Gender Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        FIT SILHOUETTE
                      </label>
                      <select
                        value={formFit}
                        onChange={(e) => setFormFit(e.target.value as ProductFit)}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                      >
                        <option value="Straight Fit">Straight Fit</option>
                        <option value="Slim Fit">Slim Fit</option>
                        <option value="Baggy Fit">Baggy Fit</option>
                        <option value="Wide Leg">Wide Leg</option>
                        <option value="Mom Jeans">Mom Jeans</option>
                        <option value="Cargo Jeans">Cargo Jeans</option>
                        <option value="Skinny Fit">Skinny Fit</option>
                        <option value="Bootcut">Bootcut</option>
                        <option value="Denim Jacket">Denim Jacket</option>
                        <option value="Denim Shirt">Denim Shirt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        GENDER CATEGORY
                      </label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as GenderCategory)}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                  </div>

                  {/* Price & Initial Stock Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        PRICE (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        placeholder="4500"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        INITIAL STOCK COUNT
                      </label>
                      <input
                        type="number"
                        min={1}
                        placeholder="30"
                        value={formStock}
                        onChange={(e) => setFormStock(Number(e.target.value))}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Wash / Color & Fabric Composition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        WASH / COLOR
                      </label>
                      <input
                        type="text"
                        placeholder="Raw Deep Indigo"
                        value={formWash}
                        onChange={(e) => setFormWash(e.target.value)}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        FABRIC COMPOSITION
                      </label>
                      <input
                        type="text"
                        placeholder="100% Ring-Spun Cotton"
                        value={formFabric}
                        onChange={(e) => setFormFabric(e.target.value)}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                      PRODUCT DESCRIPTION
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Crafted with durable selvedge yarns, signature back pocket details, and premium comfort stretch."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl p-3.5 text-white placeholder-slate-500 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: PRODUCT PHOTOS (6 ANGLE SLOTS) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-[#f59e0b] font-black text-xs uppercase tracking-wider">
                      <Camera className="w-4 h-4" />
                      <span>PRODUCT PHOTOS (6 ANGLE SLOTS)</span>
                    </div>
                    <span className="text-slate-500 font-bold text-[10px] tracking-wider uppercase">
                      CLICK BOX TO CHOOSE FILE
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Click each box below to upload a photo directly from your computer:
                  </p>

                  {/* 6 Angle Slots Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {ANGLE_SLOTS.map((slot, idx) => {
                      const img = formImages[idx];
                      const isUploadingThis = uploadingSlot === idx;

                      return (
                        <div key={slot.id} className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-300 uppercase truncate">
                            {slot.label}
                          </label>

                          {/* Hidden File Input for this slot */}
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => {
                              fileInputRefs.current[idx] = el;
                            }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleSlotFile(idx, f);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />

                          {/* Slot Box */}
                          <div
                            onClick={() => fileInputRefs.current[idx]?.click()}
                            className="group relative aspect-[3/4] rounded-2xl border border-slate-800 bg-[#090d16] hover:border-amber-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-2 text-center"
                          >
                            {isUploadingThis ? (
                              <div className="flex flex-col items-center gap-2 text-amber-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-[10px] font-bold">Uploading...</span>
                              </div>
                            ) : img ? (
                              <>
                                <img
                                  src={img}
                                  alt={slot.label}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                                {/* Bottom Loaded Badge */}
                                <div className="absolute bottom-2 left-2 bg-[#f59e0b] text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                                  <span>✓ Loaded</span>
                                </div>
                                {/* Remove button on hover */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSlotImage(idx);
                                  }}
                                  className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors">
                                  <Upload className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black text-slate-200 tracking-wider">
                                  UPLOAD
                                </span>
                                <span className="text-[9px] text-slate-500">From Computer</span>
                                <span className="text-[9px] text-amber-400/90 font-medium pt-1">
                                  {slot.hint}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Or Paste Primary Image URL */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      OR PASTE PRIMARY IMAGE URL (OPTIONAL):
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formThumbnail}
                      onChange={(e) => {
                        setFormThumbnail(e.target.value);
                        applySlotUrl(0, e.target.value);
                      }}
                      className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#090d16] hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black px-7 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wide"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>PUBLISH DENIM PRODUCT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
