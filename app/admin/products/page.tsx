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
  Download,
  Copy,
  Database,
  RefreshCw,
  Cloud,
  Video,
  Film,
  Play,
  Link2,
  Tv,
} from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/lib/store/productsContext';
import { Product, ProductFit, GenderCategory } from '@/types';
import { formatPrice } from '@/lib/utils';
import { compressImageFile } from '@/lib/utils/db';
import { parseVideoUrl, isVideoUrl } from '@/lib/utils/video';

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
  const { products, addProduct, updateProduct, deleteProduct, categories, isCloudConnected, syncLocalProductsToSupabase } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleSyncCloud = async () => {
    if (!isCloudConnected) {
      setShowCloudModal(true);
      return;
    }
    setIsSyncing(true);
    try {
      const res = await syncLocalProductsToSupabase();
      if (res.success) {
        alert(`Success! ${res.count} products synced to Supabase Cloud Database! They are now visible to everyone across all devices.`);
      } else {
        alert(res.message || 'Sync failed');
      }
    } catch (e: any) {
      alert(e?.message || 'Sync error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    if (!products || products.length === 0) {
      alert('No products to export.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jeansbd-products-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJSON = () => {
    if (!products || products.length === 0) {
      alert('No products to copy.');
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(products, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          let count = 0;
          for (const p of imported) {
            if (p.name && !products.some((existing) => existing.id === p.id)) {
              addProduct(p);
              count++;
            }
          }
          alert(`Successfully imported ${count} products!`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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

  // Video State (Uploaded file or streaming Link: YouTube/Vimeo/Direct)
  const [formVideoUrl, setFormVideoUrl] = useState<string>('');
  const [formVideos, setFormVideos] = useState<string[]>([]);
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const [showVideoUrlInput, setShowVideoUrlInput] = useState<boolean>(false);
  const [inputVideoUrl, setInputVideoUrl] = useState<string>('');
  const [previewingVideoUrl, setPreviewingVideoUrl] = useState<string | null>(null);

  // Hidden file inputs for 6 slots & video file
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

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
    setFormPrice(2500);
    setFormDiscountPrice(0);
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
    setFormVideoUrl('');
    setFormVideos([]);
    setShowVideoUrlInput(false);
    setInputVideoUrl('');
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
    setFormDiscountPrice(
      product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : 0
    );
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

    // populate video
    const vid = product.videoUrl || (product.videos && product.videos[0]) || '';
    setFormVideoUrl(vid);
    setFormVideos(product.videos && product.videos.length > 0 ? product.videos : vid ? [vid] : []);
    setShowVideoUrlInput(false);
    setInputVideoUrl('');
    setIsModalOpen(true);
  };

  // Upload handler for single slot with client-side compression
  const handleSlotFile = async (slotIndex: number, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setUploadingSlot(slotIndex);

    try {
      // 1. Try uploading to /api/upload
      const formData = new FormData();
      formData.append('file', file);

      try {
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
      } catch (e) {
        // Fallback to client-side compression below
      }

      // 2. High-performance client-side image compression
      const compressed = await compressImageFile(file, 900, 1200, 0.78);
      if (compressed) {
        applySlotUrl(slotIndex, compressed);
      }
      setUploadingSlot(null);
    } catch (err) {
      console.error('Upload slot error:', err);
      setUploadingSlot(null);
    }
  };

  // Upload handler for Video File from computer
  const handleVideoFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|mkv|avi)$/i.test(file.name)) {
      alert('Please select a valid video file (MP4, WebM, MOV, MKV)');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file exceeds 50MB. For large videos, we recommend uploading to YouTube/Vimeo and using the "+ Video Link" option!');
      return;
    }

    setUploadingVideo(true);
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
          setFormVideoUrl(data.url);
          setFormVideos((prev) => Array.from(new Set([...prev, data.url])));
          setUploadingVideo(false);
          return;
        }
      }

      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error || 'Video upload processing failed');
    } catch (err: any) {
      console.error('Video upload error:', err);
      alert(`Video upload failed: ${err?.message || 'Please check your connection or use + Video Link'}`);
      setUploadingVideo(false);
    }
  };

  // Add Video Link (YouTube, Vimeo, MP4 URL)
  const handleAddVideoLink = (url: string) => {
    const clean = url.trim();
    if (!clean) return;
    const parsed = parseVideoUrl(clean);
    if (!parsed || parsed.type === 'unknown') {
      alert('Please enter a valid YouTube, Vimeo, or direct MP4/WebM video URL.');
      return;
    }
    setFormVideoUrl(clean);
    setFormVideos((prev) => Array.from(new Set([...prev, clean])));
    setInputVideoUrl('');
    setShowVideoUrlInput(false);
  };

  const removeVideo = (targetUrl?: string) => {
    if (targetUrl) {
      const updated = formVideos.filter((v) => v !== targetUrl);
      setFormVideos(updated);
      if (formVideoUrl === targetUrl) {
        setFormVideoUrl(updated[0] || '');
      }
    } else {
      setFormVideoUrl('');
      setFormVideos([]);
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
    const hasDiscount = formDiscountPrice > 0 && formDiscountPrice < formPrice;
    const finalDiscountPrice = hasDiscount ? formDiscountPrice : undefined;
    const discountPct = hasDiscount
      ? Math.round(((formPrice - formDiscountPrice) / formPrice) * 100)
      : 0;

    // Filter non-empty images from slots
    const validImages = formImages.filter((img) => img && img.trim() !== '');
    const mainThumbnail = formThumbnail.trim() || validImages[0] || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80';
    const validVideoUrl = formVideoUrl.trim() || (formVideos[0] ? formVideos[0].trim() : undefined);
    const validVideos = formVideos.filter((v) => v && v.trim() !== '');

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
        discountPrice: finalDiscountPrice,
        discountPercentage: discountPct,
        isOnSale: hasDiscount,
        totalStock: formStock,
        thumbnail: mainThumbnail,
        images: validImages.length > 0 ? validImages : [mainThumbnail],
        videoUrl: validVideoUrl,
        videos: validVideos,
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
        discountPrice: finalDiscountPrice,
        discountPercentage: discountPct,
        thumbnail: mainThumbnail,
        images: validImages.length > 0 ? validImages : [mainThumbnail],
        videoUrl: validVideoUrl,
        videos: validVideos,
        rating: 5.0,
        reviewCount: 1,
        isNewArrival: true,
        isBestSeller: false,
        isFeatured: true,
        isOnSale: hasDiscount,
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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportJSON}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow hover:border-slate-600"
            title="Download JSON backup of your current products"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Backup (JSON)</span>
          </button>

          <button
            onClick={handleCopyJSON}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow hover:border-slate-600"
            title="Copy all product data to clipboard"
          >
            {copiedJson ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-400" />
                <span>Copy Data</span>
              </>
            )}
          </button>

          <input
            type="file"
            ref={importInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => importInputRef.current?.click()}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow hover:border-slate-600"
            title="Import/restore products from JSON backup"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Restore</span>
          </button>

          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className={`font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow border ${
              isCloudConnected
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/50 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
            }`}
            title={
              isCloudConnected
                ? 'Sync your local products to Supabase Cloud Database'
                : 'Connect Supabase for multi-device live sync'
            }
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Cloud className={`w-4 h-4 ${isCloudConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            )}
            <span>{isCloudConnected ? (isSyncing ? 'Syncing...' : 'Sync to Cloud') : 'Cloud Setup'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Denim Product</span>
          </button>
        </div>
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
                    {prod.discountPrice && prod.discountPrice < prod.price ? (
                      <div>
                        <div className="font-bold text-white text-sm">৳{prod.discountPrice}</div>
                        <span className="text-[10px] text-slate-500 line-through">৳{prod.price}</span>
                      </div>
                    ) : (
                      <div className="font-bold text-white text-sm">৳{prod.price}</div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        REGULAR PRICE (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="e.g. 2500"
                        value={formPrice || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormPrice(val);
                          if (formDiscountPrice && formDiscountPrice >= val) {
                            setFormDiscountPrice(0);
                          }
                        }}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5 flex items-center justify-between">
                        <span>OFFER PRICE (BDT ৳)</span>
                        <span className="text-[9px] text-[#f59e0b] font-normal">OPTIONAL</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Optional discount price"
                        value={formDiscountPrice > 0 ? formDiscountPrice : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setFormDiscountPrice(val);
                        }}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase text-[11px] mb-1.5">
                        INITIAL STOCK COUNT
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="30"
                        value={formStock}
                        onChange={(e) => setFormStock(Number(e.target.value))}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Live Final Price Preview */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Customer Selling Price:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#f59e0b] text-sm font-mono">
                        ৳{formDiscountPrice > 0 && formDiscountPrice < formPrice ? formDiscountPrice : formPrice}
                      </span>
                      {formDiscountPrice > 0 && formDiscountPrice < formPrice && (
                        <span className="text-slate-500 line-through text-[11px] font-mono">৳{formPrice}</span>
                      )}
                      {formDiscountPrice > 0 && formDiscountPrice < formPrice && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {Math.round(((formPrice - formDiscountPrice) / formPrice) * 100)}% OFF
                        </span>
                      )}
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

                {/* RIGHT COLUMN: MEDIA GALLERY (PHOTOS & VIDEOS) */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Media Gallery Header matching screenshot */}
                  <div className="bg-[#090d16] p-4 rounded-2xl border border-slate-800/90 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
                          <div className="w-6 h-6 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <span>Media Gallery</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Upload high-res images, video files or streaming links.
                        </p>
                      </div>

                      {/* 3 Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* + Image */}
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[0]?.click()}
                          className="bg-blue-600/90 hover:bg-blue-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all shadow active:scale-95"
                          title="Upload image photo"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <Camera className="w-3 h-3" />
                          <span>Image</span>
                        </button>

                        {/* + Video File */}
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          disabled={uploadingVideo}
                          className="bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all shadow active:scale-95"
                          title="Upload video from computer (MP4, WebM, MOV)"
                        >
                          {uploadingVideo ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          ) : (
                            <>
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <Film className="w-3 h-3" />
                            </>
                          )}
                          <span>{uploadingVideo ? 'Uploading...' : 'Video File'}</span>
                        </button>

                        {/* + Video Link */}
                        <button
                          type="button"
                          onClick={() => setShowVideoUrlInput(!showVideoUrlInput)}
                          className={`font-bold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all shadow active:scale-95 ${
                            showVideoUrlInput
                              ? 'bg-purple-500 text-white'
                              : 'bg-purple-600/90 hover:bg-purple-600 text-white'
                          }`}
                          title="Add YouTube, Vimeo, or MP4 link"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <Link2 className="w-3 h-3" />
                          <span>Video Link</span>
                        </button>
                      </div>
                    </div>

                    {/* Hidden Video File Input */}
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      accept="video/mp4,video/webm,video/quicktime,video/mkv,video/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleVideoFile(f);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />

                    {/* Video Link Input Form Drawer */}
                    {showVideoUrlInput && (
                      <div className="p-3 bg-slate-900/90 border border-purple-500/40 rounded-xl space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                          <span className="flex items-center gap-1.5">
                            <Tv className="w-3.5 h-3.5" />
                            <span>Add Video Link (YouTube / Vimeo / MP4 URL)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowVideoUrlInput(false)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                            value={inputVideoUrl}
                            onChange={(e) => setInputVideoUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddVideoLink(inputVideoUrl);
                              }
                            }}
                            className="w-full bg-[#090d16] border border-slate-700 focus:border-purple-400 rounded-lg px-3 py-1.5 text-white text-xs placeholder-slate-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddVideoLink(inputVideoUrl)}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0"
                          >
                            Add Video
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400">
                          💡 Supports YouTube standard/shorts links, Vimeo, and direct MP4/WebM URLs.
                        </p>
                      </div>
                    )}

                    {/* Active Video Section */}
                    {formVideoUrl ? (
                      <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>
                                {parseVideoUrl(formVideoUrl)?.type === 'youtube'
                                  ? 'YouTube Video'
                                  : parseVideoUrl(formVideoUrl)?.type === 'vimeo'
                                  ? 'Vimeo Video'
                                  : 'Video File / MP4'}
                              </span>
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Attached</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewingVideoUrl(formVideoUrl)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition shadow"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Test / Play Video</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVideo()}
                              className="bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white p-1 rounded-md transition"
                              title="Remove Video"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-slate-400 truncate bg-slate-950/60 p-1.5 rounded border border-slate-800">
                          {formVideoUrl}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* 6 Angle Slots Grid Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-[#f59e0b] font-black text-xs uppercase tracking-wider">
                      <Camera className="w-4 h-4" />
                      <span>Product Photos (6 Angle Slots)</span>
                    </div>
                    <span className="text-slate-500 font-bold text-[10px] tracking-wider uppercase">
                      Click Box to Choose File
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

      {/* Supabase Cloud Setup Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCloudModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Supabase Cloud Database Setup</h3>
                <p className="text-xs text-slate-400">Connect cloud database for multi-device sync</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <p className="font-bold text-amber-400">
                কেন অন্য ডিভাইসে আপনার ডিলিট করা প্রোডাক্টগুলো দেখাচ্ছিল?
              </p>
              <p>
                আপনার প্রোডাক্টগুলো বর্তমানে আপনার এই ব্রাউজারের মেমোরিতে (IndexedDB) সেভ করা আছে। সবার জন্য লাইভ করতে একটি সেন্ট্রাল ক্লাউড ডাটাবেজ (Supabase) প্রয়োজন।
              </p>
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <p className="font-semibold text-white">সহজ সেটআপের ধাপ:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li><a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">supabase.com</a> এ গিয়ে একটি ফ্রি একাউন্ট ও প্রজেক্ট তৈরি করুন।</li>
                  <li>Project Settings &gt; API থেকে <strong>Project URL</strong> এবং <strong>anon/public key</strong> কপি করুন।</li>
                  <li>প্রজেক্টের <code>.env.local</code> ফাইল অথবা Vercel Settings &gt; Environment Variables-এ কী দুটি দিয়ে দিন।</li>
                </ol>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCloudModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleExportJSON();
                  setShowCloudModal(false);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Test/Preview Modal */}
      {previewingVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#090d16] border border-slate-800 rounded-3xl max-w-3xl w-full p-5 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Product Video Preview</h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-md">{previewingVideoUrl}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingVideoUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800/80 flex items-center justify-center">
              {(() => {
                const info = parseVideoUrl(previewingVideoUrl);
                if (info?.type === 'youtube' || info?.type === 'vimeo') {
                  return (
                    <iframe
                      src={info.embedUrl}
                      title="Product Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    src={previewingVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                );
              })()}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewingVideoUrl(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
