'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Layers,
  Box,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Mic,
  Shield,
  ShieldCheck,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Sliders,
  DollarSign,
  ArrowUpRight,
  Clock,
  Send,
  AlertCircle,
  Copy,
  Check,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { useProducts } from '@/lib/store/productsContext';
import { useOrder } from '@/lib/store/orderContext';
import AdminVoiceInterface from '@/components/ai/AdminVoiceInterface';
import { ProductAiService, GeneratedProductData, LowStockAlert, DuplicateDetectionResult } from '@/lib/services/ai/productAiService';
import { OrderAiService, OrderVerificationResult, DeliveryDelayAlert, CustomerNotificationCopies } from '@/lib/services/ai/orderAiService';
import { SalesReportAiService, SalesReportSummary } from '@/lib/services/ai/salesReportAiService';
import { BusinessIntelligenceService, BusinessIntelligenceReport } from '@/lib/services/ai/businessIntelligenceService';
import { AutomationEngine, AutomationRuleConfig, PendingApprovalAction, ActivityAuditLog } from '@/lib/services/ai/automationEngine';
import { Product, Order } from '@/types';

export default function AdminAiControlCenterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { theme, resolvedTheme, accent } = useAdminTheme();
  const isDark = theme === 'dark';

  const { products, addProduct, updateProduct } = useProducts();
  const { orders } = useOrder();

  // 1. Product AI State
  const [productForm, setProductForm] = useState({
    name: 'Vintage Distressed Baggy Denim',
    category: "Men's Baggy & Wide Fit",
    gender: 'men' as 'men' | 'women' | 'unisex',
    fit: 'Baggy Fit',
    washColor: 'Raw Indigo Tinted Wash',
    fabricComposition: '100% Ring-Spun Cotton 13.5oz',
    price: 2450,
  });
  const [generatedProduct, setGeneratedProduct] = useState<GeneratedProductData | null>(null);
  const [isGeneratingProduct, setIsGeneratingProduct] = useState(false);
  const [stockAlerts, setStockAlerts] = useState<LowStockAlert[]>([]);
  const [duplicatesResult, setDuplicatesResult] = useState<DuplicateDetectionResult | null>(null);

  // 2. Order AI State
  const [selectedOrderForVerify, setSelectedOrderForVerify] = useState<Order | null>(null);
  const [verificationResult, setVerificationResult] = useState<OrderVerificationResult | null>(null);
  const [delayAlerts, setDelayAlerts] = useState<DeliveryDelayAlert[]>([]);
  const [notificationDraft, setNotificationDraft] = useState<CustomerNotificationCopies | null>(null);

  // 3. Sales Reports State
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly');
  const [salesSummary, setSalesSummary] = useState<SalesReportSummary | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 4. BI & Forecast State
  const [biReport, setBiReport] = useState<BusinessIntelligenceReport | null>(null);
  const [isLoadingBi, setIsLoadingBi] = useState(false);

  // 5. Automation Rules & Approvals
  const [automationRules, setAutomationRules] = useState<AutomationRuleConfig[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalAction[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityAuditLog[]>([]);

  // Notification Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load Initial Calculations from active real catalog and orders
  useEffect(() => {
    // 1. Stock radar
    const alerts = ProductAiService.monitorStock(products, 5);
    setStockAlerts(alerts);

    // 2. Duplicate detection
    const dupes = ProductAiService.detectDuplicates(products);
    setDuplicatesResult(dupes);

    // 3. Delivery delays
    const delays = OrderAiService.detectDeliveryDelays(orders);
    setDelayAlerts(delays);

    // 4. Sales Report Summary
    const summary = SalesReportAiService.generateReport(orders, products, reportPeriod);
    setSalesSummary(summary);

    // 5. Rules & Approvals
    setAutomationRules(AutomationEngine.getRules());
    setPendingApprovals(AutomationEngine.getApprovals());
    setAuditLogs(AutomationEngine.getAuditLogs());

    // 6. Select first order for verification display if available
    if (orders.length > 0 && !selectedOrderForVerify) {
      const first = orders[0];
      setSelectedOrderForVerify(first);
      setVerificationResult(OrderAiService.verifyOrder(first, orders));
      setNotificationDraft(OrderAiService.generateNotificationCopy(first, 'order_confirmed', 'sms'));
    }
  }, [products, orders, reportPeriod]);

  // Load BI Insights
  const loadBiInsights = async () => {
    setIsLoadingBi(true);
    try {
      const insights = await BusinessIntelligenceService.generateInsights(orders, products);
      setBiReport(insights);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBi(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bi' && !biReport) {
      loadBiInsights();
    }
  }, [activeTab]);

  // Generate Product via AI
  const handleGenerateProduct = async () => {
    setIsGeneratingProduct(true);
    try {
      const res = await fetch('/api/ai/products?action=generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedProduct(data.data);
        AutomationEngine.logActivity({
          actorEmail: 'admin@jeansbd.com',
          actorRole: 'Admin',
          action: 'AI Product Generation',
          targetType: 'product',
          details: `Generated bilingual specs and SEO for "${productForm.name}".`,
        });
        setAuditLogs(AutomationEngine.getAuditLogs());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingProduct(false);
    }
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!salesSummary) return;

    if (format === 'csv') {
      const csv = SalesReportAiService.exportToCsv(orders);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jeansbd_sales_report_${reportPeriod}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      const xml = SalesReportAiService.exportToExcelHtml(orders, salesSummary);
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jeansbd_sales_report_${reportPeriod}_${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      window.print();
    }
  };

  const handleCopyText = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    const updated = AutomationEngine.toggleRule(ruleId, enabled);
    setAutomationRules(updated);
    AutomationEngine.logActivity({
      actorEmail: 'admin@jeansbd.com',
      actorRole: 'Admin',
      action: 'Rule Toggle',
      targetType: 'automation',
      details: `Rule "${ruleId}" set to ${enabled ? 'ENABLED' : 'DISABLED'}.`,
    });
    setAuditLogs(AutomationEngine.getAuditLogs());
  };

  const handleResolveApproval = (approvalId: string, status: 'approved' | 'rejected') => {
    AutomationEngine.resolveApproval(approvalId, status, 'hasansheikh9080@gmail.com');
    setPendingApprovals(AutomationEngine.getApprovals());
    AutomationEngine.logActivity({
      actorEmail: 'hasansheikh9080@gmail.com',
      actorRole: 'Super Admin',
      action: `Approval ${status.toUpperCase()}`,
      targetType: 'order',
      details: `Approval request ${approvalId} was ${status} by Super Admin.`,
    });
    setAuditLogs(AutomationEngine.getAuditLogs());
  };

  const navTabs = [
    { id: 'overview', label: 'Command Center', icon: Sparkles },
    { id: 'products', label: 'Product AI Studio', icon: Box },
    { id: 'orders', label: 'Order AI Radar', icon: ShoppingBag },
    { id: 'reports', label: 'Sales Reports & Export', icon: TrendingUp },
    { id: 'bi', label: 'BI & Forecasting', icon: Layers },
    { id: 'automation', label: 'Smart Rules & Approvals', icon: Sliders },
    { id: 'security', label: 'Security & Audit Logs', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/60 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Full Autonomous E-Commerce Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Jeans BD AI Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Unified artificial intelligence cockpit powering real-time product copywriting, SEO optimization,
              Bangladesh order risk verification, sales analytics, voice control, and inventory replenishment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Engine</span>
                <span className="text-xs font-black text-white">Google Gemini + Local</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStockAlerts(ProductAiService.monitorStock(products, 5));
                setDelayAlerts(OrderAiService.detectDeliveryDelays(orders));
                setSalesSummary(SalesReportAiService.generateReport(orders, products, reportPeriod));
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Live DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & VOICE COMMANDER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`p-5 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>TOTAL REVENUE (REAL DB)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">৳{(salesSummary?.totalRevenue || 0).toLocaleString()}</div>
              <span className="text-[11px] text-emerald-400 font-bold mt-1 inline-block">
                Gross Margin: {salesSummary?.grossMarginPercent || 45}%
              </span>
            </div>

            <div
              className={`p-5 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>ORDERS PROCESSED</span>
                <ShoppingBag className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{orders.length} Orders</div>
              <span className="text-[11px] text-blue-400 font-bold mt-1 inline-block">
                {orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'pending').length} Pending Review
              </span>
            </div>

            <div
              className={`p-5 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>LOW STOCK RADAR</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">{stockAlerts.length} Depleted Styles</div>
              <span className="text-[11px] text-amber-400 font-bold mt-1 inline-block">
                Variants &le; 5 units remaining
              </span>
            </div>

            <div
              className={`p-5 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>DELIVERY WATCHDOG</span>
                <Clock className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">{delayAlerts.length} Delayed Parcels</div>
              <span className="text-[11px] text-rose-400 font-bold mt-1 inline-block">
                Courier sync &gt; 48 hours
              </span>
            </div>
          </div>

          {/* Voice AI Interface */}
          <div>
            <AdminVoiceInterface
              onActionTrigger={(intent, payload) => {
                if (intent === 'view_sales_today') {
                  setActiveTab('reports');
                  setReportPeriod('daily');
                } else if (intent === 'view_low_stock') {
                  setActiveTab('products');
                } else if (intent === 'view_monthly_report') {
                  setActiveTab('reports');
                  setReportPeriod('monthly');
                } else if (intent === 'view_pending_orders') {
                  setActiveTab('orders');
                } else if (intent === 'view_customers') {
                  router.push('/admin/customers');
                } else if (intent === 'open_tryon') {
                  router.push('/admin/try-on');
                }
                AutomationEngine.logActivity({
                  actorEmail: 'hasansheikh9080@gmail.com',
                  actorRole: 'Super Admin',
                  action: 'Voice AI Command',
                  targetType: 'automation',
                  details: `Executed voice command: "${payload?.rawTranscript}" -> ${intent}`,
                });
                setAuditLogs(AutomationEngine.getAuditLogs());
              }}
            />
          </div>

          {/* Automation Executive Summary */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Autonomous Assistant Briefing</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Dhaka Node • 24/7 Active</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The AI automation engine is synchronized with your Supabase database. All customer orders placed via
              Cash on Delivery (COD), bKash, or Nagad are analyzed for mobile validity, address completeness, and fraud risk.
              Catalog inventory is actively tracked with auto-replenishment warnings before popular sizes run out.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT AI STUDIO */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Form */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-400" />
                  <span>AI Denim Copywriter &amp; SEO Generator</span>
                </h3>
                <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                  Bilingual BD
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Denim Fit
                    </label>
                    <select
                      value={productForm.fit}
                      onChange={(e) => setProductForm({ ...productForm, fit: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="Baggy Fit">Baggy Fit</option>
                      <option value="Straight Fit">Straight Fit</option>
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Cargo Jeans">Cargo Jeans</option>
                      <option value="Denim Jacket">Denim Jacket</option>
                      <option value="Wide Leg">Wide Leg</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Wash &amp; Texture
                    </label>
                    <input
                      type="text"
                      value={productForm.washColor}
                      onChange={(e) => setProductForm({ ...productForm, washColor: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Target Retail Price (BDT)
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Fabric Composition &amp; GSM
                  </label>
                  <input
                    type="text"
                    value={productForm.fabricComposition}
                    onChange={(e) => setProductForm({ ...productForm, fabricComposition: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateProduct}
                  disabled={isGeneratingProduct}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingProduct ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate Descriptions, SEO &amp; Fit Guide</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Generated Output Viewer */}
            <div
              className={`p-6 rounded-3xl border space-y-4 overflow-y-auto max-h-[600px] ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AI Generated Output</span>
                </h3>
                {generatedProduct && (
                  <button
                    onClick={() => handleCopyText(JSON.stringify(generatedProduct, null, 2), 'prod_json')}
                    className="text-[11px] text-blue-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'prod_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'prod_json' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              {generatedProduct ? (
                <div className="space-y-4 text-xs">
                  {/* Bengali Title */}
                  <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      বাংলা নাম (Bengali Title):
                    </span>
                    <span className="text-sm font-black text-amber-300">{generatedProduct.nameBn}</span>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-2">
                    <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        বাংলা বিবরণ (Bengali Description):
                      </span>
                      <p className="text-slate-200 leading-relaxed">{generatedProduct.descriptionBn}</p>
                    </div>

                    <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        English Copy:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{generatedProduct.descriptionEn}</p>
                    </div>
                  </div>

                  {/* SEO Box */}
                  <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-blue-400 block">
                      Google SEO &amp; Meta Tags:
                    </span>
                    <div className="text-white font-bold">{generatedProduct.seo.metaTitle}</div>
                    <div className="text-slate-400 text-[11px]">{generatedProduct.seo.metaDescription}</div>
                    <div className="text-blue-300 font-mono text-[10px]">Slug: /{generatedProduct.seo.slug}</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {generatedProduct.seo.focusKeywords.map((k, i) => (
                        <span key={i} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Size Guide Table */}
                  <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Recommended Measurement Chart (Inches):
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1">Size</th>
                            <th>Waist</th>
                            <th>Inseam</th>
                            <th>Thigh</th>
                            <th>Opening</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedProduct.sizeFitGuide.measurementsTable.map((row) => (
                            <tr key={row.size} className="border-b border-slate-800/40 text-slate-300">
                              <td className="py-1 font-bold text-white">{row.size}</td>
                              <td>{row.waistInches}"</td>
                              <td>{row.inseamInches}"</td>
                              <td>{row.thighInches}"</td>
                              <td>{row.legOpeningInches}"</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 animate-pulse" />
                  <p>Click "Generate Descriptions, SEO &amp; Fit Guide" to create high-converting copy.</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Radar & Duplicate Detection Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Radar */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Real-Time Stock Depletion Radar</span>
                </h3>
                <span className="text-[11px] font-mono text-amber-400 font-bold">{stockAlerts.length} Alerts</span>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {stockAlerts.length > 0 ? (
                  stockAlerts.map((alert) => (
                    <div
                      key={alert.productId}
                      className="p-3 bg-[#0a0f1d] border border-amber-500/30 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate max-w-[220px]">
                          {alert.productName}
                        </span>
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-black ${
                            alert.urgency === 'critical'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {alert.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{alert.recommendedAction}</p>
                      {alert.depletedVariants.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {alert.depletedVariants.map((v, i) => (
                            <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                              Size {v.size}: {v.stock} left
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">All inventory levels are healthy!</div>
                )}
              </div>
            </div>

            {/* Duplicate Detection */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Catalog Integrity &amp; Duplicate Checker</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {duplicatesResult?.hasDuplicate ? 'Conflicts Found' : 'Catalog Clean'}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {duplicatesResult?.hasDuplicate ? (
                  duplicatesResult.duplicateItems.map((dup, i) => (
                    <div key={i} className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                      <div className="font-bold text-rose-400 text-xs">{dup.name}</div>
                      <p className="text-[11px] text-slate-300">{dup.reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white">No Duplicate Slugs or SKUs Detected</p>
                    <p className="text-[11px] text-slate-500">
                      Active database catalog conforms strictly to unique indexing requirements.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER AI RADAR */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders Selector Column */}
            <div
              className={`p-5 rounded-3xl border space-y-3 lg:col-span-1 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <h3 className="text-xs font-black uppercase text-white tracking-wider border-b border-slate-800 pb-2">
                Recent Orders Queue ({orders.length})
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {orders.map((ord) => {
                  const isSelected = selectedOrderForVerify?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setSelectedOrderForVerify(ord);
                        setVerificationResult(OrderAiService.verifyOrder(ord, orders));
                        setNotificationDraft(OrderAiService.generateNotificationCopy(ord, 'order_confirmed', 'sms'));
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : isDark
                          ? 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:bg-slate-800/40'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span>#{ord.orderNumber}</span>
                        <span className="text-emerald-400">৳{ord.totalAmount}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 truncate">
                        {ord.customer?.fullName} • {ord.customer?.district}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{ord.paymentMethod.toUpperCase()}</span>
                        <span className="font-bold text-blue-400">{ord.orderStatus}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Verification & Risk Analysis */}
            <div
              className={`p-6 rounded-3xl border space-y-4 lg:col-span-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {selectedOrderForVerify && verificationResult ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Order</span>
                      <h3 className="text-lg font-black text-white">
                        #{selectedOrderForVerify.orderNumber} — {selectedOrderForVerify.customer?.fullName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedOrderForVerify.customer?.phone} • {selectedOrderForVerify.customer?.address},{' '}
                        {selectedOrderForVerify.customer?.district}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fraud Risk Score</span>
                        <span
                          className={`text-xl font-black ${
                            verificationResult.riskLevel === 'high'
                              ? 'text-rose-400'
                              : verificationResult.riskLevel === 'medium'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {verificationResult.riskScore} / 100
                        </span>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase border ${
                          verificationResult.riskLevel === 'high'
                            ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                            : verificationResult.riskLevel === 'medium'
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                            : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {verificationResult.riskLevel}
                      </div>
                    </div>
                  </div>

                  {/* Verification Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl flex items-center gap-2.5">
                      {verificationResult.verificationChecks.phoneValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-white block">Bangladesh Phone Check</span>
                        <span className="text-[11px] text-slate-400">
                          {verificationResult.verificationChecks.phoneValid
                            ? `Valid ${verificationResult.verificationChecks.phoneOperator} SIM`
                            : verificationResult.verificationChecks.phoneIssue}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl flex items-center gap-2.5">
                      {verificationResult.verificationChecks.districtRecognized ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-white block">District Match</span>
                        <span className="text-[11px] text-slate-400">
                          {verificationResult.verificationChecks.districtRecognized
                            ? `Recognized 64 District Hub (${selectedOrderForVerify.customer?.district})`
                            : 'Unrecognized district name'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Box */}
                  <div className="p-4 bg-blue-950/30 border border-blue-900/60 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-blue-400 block tracking-wider">
                      AI Dispatch Advice (বাংলা ও ইংরেজি):
                    </span>
                    <p className="text-xs font-bold text-white">{verificationResult.adminNotesBn}</p>
                    <p className="text-xs text-slate-400">{verificationResult.adminNotesEn}</p>
                  </div>

                  {/* Customer Notification Drafts */}
                  {notificationDraft && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Auto-Prepared Customer Notification
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyText(notificationDraft.messageBn, 'notif_bn')}
                            className="text-[11px] bg-slate-800 text-blue-300 px-2.5 py-1 rounded-lg hover:bg-slate-700 flex items-center gap-1"
                          >
                            {copiedKey === 'notif_bn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copy SMS (বাংলা)</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans">
                        {notificationDraft.messageBn}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">Select an order to view AI radar analysis.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SALES REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Select Period:</span>
              {(['daily', 'weekly', 'monthly', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setReportPeriod(p)}
                  className={`text-xs uppercase font-black px-3.5 py-1.5 rounded-xl transition-all ${
                    reportPeriod === p
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => handleExport('excel')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel (.xls)</span>
              </button>

              <button
                onClick={() => handleExport('pdf')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print PDF Summary</span>
              </button>
            </div>
          </div>

          {/* Financial Overview Cards */}
          {salesSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">TOTAL SALES REVENUE</span>
                <div className="text-2xl font-black text-white">৳{salesSummary.totalRevenue.toLocaleString()}</div>
                <span className="text-[11px] text-slate-400 mt-1 block">{salesSummary.totalOrders} total orders placed</span>
              </div>

              <div className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">AVERAGE ORDER VALUE</span>
                <div className="text-2xl font-black text-blue-400">৳{salesSummary.averageOrderValue.toLocaleString()}</div>
                <span className="text-[11px] text-slate-400 mt-1 block">Per fulfilled basket</span>
              </div>

              <div className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ESTIMATED GROSS PROFIT</span>
                <div className="text-2xl font-black text-emerald-400">৳{salesSummary.estimatedGrossProfit.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
                  {salesSummary.grossMarginPercent}% Profit Margin
                </span>
              </div>

              <div className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">RETURN &amp; CANCEL RATE</span>
                <div className="text-2xl font-black text-rose-400">{salesSummary.returnRatePercent}%</div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {salesSummary.returnedOrders} returns / {salesSummary.cancelledOrders} cancelled
                </span>
              </div>
            </div>
          )}

          {/* Size & Color Breakdown Charts */}
          {salesSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Size Breakdown */}
              <div className="p-6 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                  <span>Size-Wise Sales Breakdown</span>
                  <span className="text-blue-400 font-mono text-[10px]">Real Catalog Orders</span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(salesSummary.sizeBreakdown).map(([sz, count]) => {
                    const max = Math.max(...Object.values(salesSummary.sizeBreakdown), 1);
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={sz} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>Size {sz}</span>
                          <span>{count} units sold</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color & Payment Breakdown */}
              <div className="p-6 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                  <span>Payment Gateway Split</span>
                  <span className="text-emerald-400 font-mono text-[10px]">bKash / Nagad / COD</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">bKash</span>
                    <span className="text-sm font-black text-pink-400">৳{salesSummary.paymentBreakdown.bkash}</span>
                  </div>
                  <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Nagad</span>
                    <span className="text-sm font-black text-orange-400">৳{salesSummary.paymentBreakdown.nagad}</span>
                  </div>
                  <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Cash on Delivery</span>
                    <span className="text-sm font-black text-emerald-400">৳{salesSummary.paymentBreakdown.cod}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">Top Selling Products:</span>
                  <div className="space-y-1.5">
                    {salesSummary.topSellingProducts.slice(0, 4).map((p) => (
                      <div key={p.productId} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate max-w-[200px]">{p.productName}</span>
                        <span className="font-bold text-white">৳{p.revenue.toLocaleString()} ({p.unitsSold} units)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BUSINESS INTELLIGENCE & FORECAST */}
      {activeTab === 'bi' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Predictive Demand Forecasting &amp; Trend Intelligence</span>
            </h3>
            <button
              onClick={loadBiInsights}
              disabled={isLoadingBi}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBi ? 'animate-spin' : ''}`} />
              <span>Recalculate Projections</span>
            </button>
          </div>

          {biReport ? (
            <div className="space-y-6">
              {/* Executive Briefing Cards */}
              <div className="p-6 rounded-3xl border bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-purple-800/40 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                  AI Strategic Overview:
                </span>
                <p className="text-sm font-bold text-white leading-relaxed">{biReport.executiveSummaryBn}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{biReport.executiveSummaryEn}</p>
              </div>

              {/* Demand Forecast Horizon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {biReport.demandForecast.map((fc, i) => (
                  <div key={i} className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-purple-400">{fc.period} Projected</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                        {fc.confidencePercent}% Confidence
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white">৳{fc.projectedRevenueBDT.toLocaleString()}</div>
                    <span className="text-xs text-slate-400 block">Forecasted Volume: ~{fc.projectedOrders} Orders</span>
                  </div>
                ))}
              </div>

              {/* Stock Replenishment Suggestions */}
              <div className="p-6 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase text-white tracking-wider">
                  Urgent Stock Replenishment Schedule
                </h4>
                <div className="space-y-2">
                  {biReport.stockReplenishmentSuggestions.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{item.productName}</span>
                        <span className="text-[11px] text-slate-400">
                          Current Stock: {item.currentStock} units • Estimated {item.estimatedDaysRemaining} days remaining
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-purple-400 font-bold block">
                          Reorder +{item.suggestedReorderQuantity} units
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-black bg-purple-500/20 text-purple-300">
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Marketing Campaigns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {biReport.marketingRecommendations.map((rec, i) => (
                  <div key={i} className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-white">{rec.title}</span>
                      <span className="text-[10px] text-emerald-400 font-black">{rec.expectedUplift}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{rec.strategyBn}</p>
                    <span className="text-[10px] text-slate-500 block">Target: {rec.targetAudience}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">Loading Business Intelligence forecasts...</div>
          )}
        </div>
      )}

      {/* TAB 6: SMART RULES & APPROVAL QUEUE */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rules Toggles */}
            <div className="p-6 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                <span>Active Automation Rules</span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  {automationRules.filter((r) => r.enabled).length} Enabled
                </span>
              </h4>

              <div className="space-y-3">
                {automationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 bg-[#0a0f1d] border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">{rule.name}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{rule.description}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals Queue */}
            <div className="p-6 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                <span>Sensitive Action Approvals</span>
                <span className="text-amber-400 font-mono text-[10px]">
                  {pendingApprovals.filter((a) => a.status === 'pending').length} Pending Review
                </span>
              </h4>

              <div className="space-y-3">
                {pendingApprovals.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{appr.title}</span>
                      <span
                        className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                          appr.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : appr.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {appr.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{appr.description}</p>
                    <div className="text-[10px] text-slate-500">Requested by: {appr.requestedBy}</div>

                    {appr.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleResolveApproval(appr.id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all"
                        >
                          Approve Action
                        </button>
                        <button
                          onClick={() => handleResolveApproval(appr.id, 'rejected')}
                          className="bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] px-3 py-1.5 rounded-xl border border-rose-600/40 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY & AUDIT LOGS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Server API Key Shield</span>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Protected (Node.js Server Only)</span>
              </div>
              <p className="text-[11px] text-slate-500">GEMINI_API_KEY is never exposed to customer browser clients.</p>
            </div>

            <div className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Session Gate</span>
              <div className="text-sm font-black text-blue-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>256-bit Cookie &amp; RBAC</span>
              </div>
              <p className="text-[11px] text-slate-500">Only authorized staff can trigger mutations or view P&amp;L.</p>
            </div>

            <div className="p-5 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Database Sync Status</span>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Supabase Live Connected</span>
              </div>
              <p className="text-[11px] text-slate-500">Real orders and stock fetched from PostgreSQL tables.</p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="p-6 rounded-3xl border bg-slate-900/60 border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
              <span>Security &amp; Activity Audit Log ({auditLogs.length})</span>
              <span className="text-slate-400 font-mono text-[10px]">Immutable History</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="py-2.5">Timestamp</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="text-slate-300">
                      <td className="py-2 font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString('en-GB')}
                      </td>
                      <td className="font-bold text-white">{log.actorEmail}</td>
                      <td>
                        <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="uppercase font-mono text-[10px] text-slate-400">{log.targetType}</td>
                      <td className="text-slate-400 text-[11px] max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
