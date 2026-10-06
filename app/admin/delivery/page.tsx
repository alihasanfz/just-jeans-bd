'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Truck,
  Search,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  User,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  Copy,
  Check,
  X,
  FileText,
  DollarSign,
  Send,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminDeliveryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading courier delivery console...</div>}>
      <AdminDeliveryContent />
    </Suspense>
  );
}

function AdminDeliveryContent() {
  const { orders, updateOrderDelivery, updateOrderStatus, updateOrder, deleteOrder, createOrder } = useOrder();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [courierCompany, setCourierCompany] = useState('Steadfast Courier');
  const [customCourier, setCustomCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('In Transit');
  const [deliveryCharge, setDeliveryCharge] = useState(80);
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  // Delete modal state
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);

  // New dispatch modal state
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newDistrict, setNewDistrict] = useState('Dhaka');
  const [newAddress, setNewAddress] = useState('');
  const [newCourierCompany, setNewCourierCompany] = useState('Steadfast Courier');
  const [newCustomCourier, setNewCustomCourier] = useState('');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newDeliveryStatus, setNewDeliveryStatus] = useState('Pending Dispatch');
  const [newDeliveryCharge, setNewDeliveryCharge] = useState(80);
  const [newPackageValue, setNewPackageValue] = useState(1890);
  const [newExpectedDate, setNewExpectedDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Edit Modal with order data
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setCustomerName(order.customer.fullName || '');
    setCustomerPhone(order.customer.phone || '');
    setDistrict(order.customer.district || 'Dhaka');
    setAddress(order.customer.address || '');

    const currentCourier = order.delivery?.courierCompany || 'Steadfast Courier';
    const standardCouriers = ['Steadfast Courier', 'Pathao Express', 'RedX', 'Paperfly', 'Sundarban Courier', 'eCourier', 'SA Paribahan'];
    if (standardCouriers.includes(currentCourier)) {
      setCourierCompany(currentCourier);
      setCustomCourier('');
    } else {
      setCourierCompany('Other');
      setCustomCourier(currentCourier);
    }

    setTrackingNumber(order.delivery?.trackingNumber || '');
    setDeliveryStatus(order.delivery?.deliveryStatus || (order.orderStatus === 'Delivered' ? 'Delivered' : 'Pending Dispatch'));
    setDeliveryCharge(order.delivery?.deliveryCharge ?? order.deliveryCharge ?? 80);
    setDeliveryPerson((order.delivery as any)?.deliveryPerson || '');
    setDeliveryNotes(order.delivery?.notes || '');
    setExpectedDate(order.delivery?.estimatedDeliveryDate ? order.delivery.estimatedDeliveryDate.slice(0, 10) : '');
  };

  // Save changes to Order & Delivery
  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const finalCourier = courierCompany === 'Other' ? (customCourier.trim() || 'Custom Courier') : courierCompany;
    const chargeDiff = Number(deliveryCharge) - (editingOrder.deliveryCharge || 0);
    const newTotalAmount = Math.max(0, editingOrder.totalAmount + chargeDiff);

    updateOrder(editingOrder.id, {
      deliveryCharge: Number(deliveryCharge),
      totalAmount: newTotalAmount,
      customer: {
        ...editingOrder.customer,
        fullName: customerName.trim() || editingOrder.customer.fullName,
        phone: customerPhone.trim() || editingOrder.customer.phone,
        district,
        address,
      },
      delivery: {
        ...editingOrder.delivery,
        courierCompany: finalCourier,
        trackingNumber: trackingNumber.trim(),
        deliveryStatus,
        deliveryCharge: Number(deliveryCharge),
        estimatedDeliveryDate: expectedDate || undefined,
        notes: deliveryNotes.trim() || undefined,
        ...(deliveryPerson.trim() ? { deliveryPerson: deliveryPerson.trim() } as any : {}),
      },
    });

    if (deliveryStatus === 'Delivered') {
      updateOrderStatus(editingOrder.id, 'Delivered', `Delivered via ${finalCourier}`);
    } else if (deliveryStatus === 'In Transit' || deliveryStatus === 'Out for Delivery') {
      updateOrderStatus(editingOrder.id, 'Shipped', `Courier in transit with ${finalCourier}`);
    } else if (deliveryStatus === 'Returned') {
      updateOrderStatus(editingOrder.id, 'Returned', `Consignment returned by ${finalCourier}`);
    } else if (deliveryStatus === 'Pending Dispatch') {
      updateOrderStatus(editingOrder.id, 'Processing', `Pending courier assignment`);
    }

    setEditingOrder(null);
    showToast('success', `Dispatch info for #${editingOrder.orderNumber} successfully updated.`);
  };

  // Delete Order / Dispatch
  const handleConfirmDelete = () => {
    if (!deleteConfirmOrder) return;
    const num = deleteConfirmOrder.orderNumber;
    deleteOrder(deleteConfirmOrder.id);
    if (editingOrder?.id === deleteConfirmOrder.id) {
      setEditingOrder(null);
    }
    setDeleteConfirmOrder(null);
    showToast('success', `Shipment for Order #${num} deleted successfully.`);
  };

  // Create New Dispatch
  const handleCreateNewDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      showToast('error', 'Customer name and phone number are required.');
      return;
    }

    const finalCourier = newCourierCompany === 'Other' ? (newCustomCourier.trim() || 'Custom Courier') : newCourierCompany;
    const finalTracking = newTrackingNumber.trim() || `CN-${Date.now().toString().slice(-6)}`;

    const newOrder = createOrder({
      customer: {
        fullName: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        district: newDistrict,
        area: newDistrict,
        address: newAddress.trim() || `${newDistrict}, Bangladesh`,
      },
      items: [
        {
          id: `item-${Date.now()}`,
          productId: 'prod-001',
          productSlug: 'vintage-washed-slim-tapered-jeans',
          name: 'Denim Dispatch Parcel',
          image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
          size: '32',
          color: 'Indigo',
          price: Number(newPackageValue) || 1890,
          quantity: 1,
          subtotal: Number(newPackageValue) || 1890,
        },
      ],
      subtotal: Number(newPackageValue) || 1890,
      discount: 0,
      deliveryCharge: Number(newDeliveryCharge) || 80,
      totalAmount: (Number(newPackageValue) || 1890) + (Number(newDeliveryCharge) || 80),
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: newDeliveryStatus === 'Delivered' ? 'Delivered' : newDeliveryStatus === 'In Transit' ? 'Shipped' : 'Confirmed',
      delivery: {
        courierCompany: finalCourier,
        trackingNumber: finalTracking,
        deliveryCharge: Number(newDeliveryCharge) || 80,
        dispatchDate: new Date().toISOString(),
        estimatedDeliveryDate: newExpectedDate || undefined,
        deliveryStatus: newDeliveryStatus,
        notes: newNotes.trim() || undefined,
      },
    });

    setIsNewDispatchOpen(false);
    // Reset fields
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewAddress('');
    setNewTrackingNumber('');
    setNewNotes('');
    showToast('success', `New dispatch consignment #${newOrder.orderNumber} added.`);
  };

  // Stats calculation
  const totalDeliveries = orders.length;
  const pendingDispatch = orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed' || o.delivery?.deliveryStatus === 'Pending Dispatch'
  ).length;
  const inTransit = orders.filter(
    (o) => o.orderStatus === 'Shipped' || o.delivery?.deliveryStatus === 'In Transit' || o.delivery?.deliveryStatus === 'Out for Delivery'
  ).length;
  const deliveredCount = orders.filter(
    (o) => o.orderStatus === 'Delivered' || o.delivery?.deliveryStatus === 'Delivered'
  ).length;

  const filteredOrders = orders.filter((o) => {
    if (selectedCourier !== 'all') {
      const c = (o.delivery?.courierCompany || 'Unassigned').toLowerCase();
      if (!c.includes(selectedCourier.toLowerCase())) return false;
    }
    if (selectedStatus !== 'all') {
      const st = o.delivery?.deliveryStatus || o.orderStatus;
      if (st.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      const matchCity = (o.customer.district || '').toLowerCase().includes(q);
      const matchCourier = (o.delivery?.courierCompany || '').toLowerCase().includes(q);
      const matchTracking = (o.delivery?.trackingNumber || '').toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchCity || matchCourier || matchTracking;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl border backdrop-blur-md transition-all animate-bounce-short ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/50'
              : 'bg-rose-950/90 text-rose-300 border-rose-700/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-2 hover:opacity-75 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl lg:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Delivery & Courier Dispatch
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Truck className="w-3 h-3" />
              <span>Logistics Hub</span>
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage nationwide courier consignments, edit tracking codes, update delivery charges, and delete dispatches.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTrackingNumber(`STDF-${Math.floor(100000 + Math.random() * 900000)}`);
            setIsNewDispatchOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Shipments</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalDeliveries}</p>
          <span className="text-[10px] text-slate-400 font-medium">All registered dispatches</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase">Pending Dispatch</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{pendingDispatch}</p>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting packaging / rider</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-500 uppercase">In Transit / Out</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{inTransit}</p>
          <span className="text-[10px] text-slate-400 font-medium">On the road to customer</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{deliveredCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Completed & verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-3 ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Search by Order #, Customer, Phone, City, Tracking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-blue-600 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <select
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Couriers</option>
            <option value="Steadfast">Steadfast Courier</option>
            <option value="Pathao">Pathao Express</option>
            <option value="RedX">RedX</option>
            <option value="Paperfly">Paperfly</option>
            <option value="Sundarban">Sundarban Courier</option>
            <option value="eCourier">eCourier</option>
            <option value="SA Paribahan">SA Paribahan</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="Pending Dispatch">Pending Dispatch</option>
            <option value="In Transit">In Transit</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Returned">Returned</option>
          </select>

          {(searchQuery || selectedCourier !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCourier('all');
                setSelectedStatus('all');
              }}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Deliveries Table */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[11px] font-black uppercase tracking-wider border-b ${
              isDark ? 'text-slate-400 bg-slate-900/80 border-slate-800' : 'text-slate-500 bg-slate-50 border-slate-200'
            }`}>
            <tr>
              <th className="py-3.5 px-4">Order ID & Date</th>
              <th className="py-3.5 px-4">Customer Details</th>
              <th className="py-3.5 px-4">Delivery Location & Address</th>
              <th className="py-3.5 px-4">Courier Partner</th>
              <th className="py-3.5 px-4">Tracking Code</th>
              <th className="py-3.5 px-4">Delivery Charge</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
            </thead>
            <tbody className={`divide-y font-medium ${
              isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-700'
            }`}>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Truck className="w-8 h-8 opacity-40" />
                    <span>No courier dispatches found matching your search.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const courier = ord.delivery?.courierCompany || (ord.customer.district === 'Dhaka' ? 'Steadfast Courier' : 'Pathao Express');
                const tracking = ord.delivery?.trackingNumber;
                const st = ord.delivery?.deliveryStatus || (ord.orderStatus === 'Delivered' ? 'Delivered' : 'Pending Dispatch');
                const charge = ord.delivery?.deliveryCharge ?? ord.deliveryCharge ?? 80;

                return (
                  <tr key={ord.id} className={isDark ? 'hover:bg-slate-900/40 transition-colors' : 'hover:bg-slate-50/80 transition-colors'}>
                    {/* Order info */}
                    <td className="py-3.5 px-4">
                      <span className={`font-bold font-mono block text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {ord.customer.fullName}
                      </span>
                      <a href={`tel:${ord.customer.phone}`} className="text-[11px] text-blue-500 hover:underline font-mono block">
                        {ord.customer.phone}
                      </a>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {ord.customer.district}
                      </span>
                      <span className="text-[11px] text-slate-400 line-clamp-1" title={ord.customer.address}>
                        {ord.customer.address}{ord.customer.area ? `, ${ord.customer.area}` : ''}
                      </span>
                    </td>

                    {/* Courier Partner */}
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] ${
                        isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                      }`}>
                        <Truck className="w-3 h-3 text-blue-500" />
                        <span>{courier}</span>
                      </span>
                    </td>

                    {/* Tracking */}
                    <td className="py-3.5 px-4">
                      {tracking ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs text-blue-500 font-bold">
                            {tracking}
                          </span>
                          <button
                            onClick={() => handleCopy(tracking, ord.id)}
                            className="p-1 hover:text-white transition-colors"
                            title="Copy Tracking #"
                          >
                            {copiedId === ord.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No tracking code</span>
                      )}
                    </td>

                    {/* Delivery Charge */}
                    <td className="py-3.5 px-4">
                      <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatPrice(charge)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        st === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : st === 'In Transit' || st === 'Out for Delivery'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : st === 'Returned'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {st}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Public Tracking link */}
                        <Link
                          href={`/track-order?order=${encodeURIComponent(ord.orderNumber)}&phone=${encodeURIComponent(ord.customer.phone)}`}
                          target="_blank"
                          title="Public Tracking View"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(ord)}
                          title="Edit Delivery & Courier Details"
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmOrder(ord)}
                          title="Delete Shipment"
                          className={`p-1.5 rounded-lg border transition-all ${
                            isDark
                              ? 'bg-rose-950/40 border-rose-800/40 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                              : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT DELIVERY MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className={`border rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl space-y-5 my-8 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Logistics Dispatch Center</span>
                  <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Edit Dispatch: #{editingOrder.orderNumber}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDelivery} className="space-y-4">
              {/* Courier Partner & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={courierCompany}
                    onChange={(e) => setCourierCompany(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Steadfast Courier">Steadfast Courier</option>
                    <option value="Pathao Express">Pathao Express</option>
                    <option value="RedX">RedX</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="Sundarban Courier">Sundarban Courier</option>
                    <option value="eCourier">eCourier</option>
                    <option value="SA Paribahan">SA Paribahan</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>

                {courierCompany === 'Other' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Custom Courier Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karatoa Courier"
                      value={customCourier}
                      onChange={(e) => setCustomCourier(e.target.value)}
                      className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Delivery Status
                    </label>
                    <select
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Pending Dispatch">Pending Dispatch</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                )}
              </div>

              {courierCompany === 'Other' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Delivery Status
                  </label>
                  <select
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Pending Dispatch">Pending Dispatch</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              )}

              {/* Tracking Number & Delivery Charge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tracking Number / Consignment ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STDF-84920492"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-mono font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Delivery Charge (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div className="p-3.5 rounded-2xl border bg-slate-900/30 border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer & Destination</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full border rounded-xl p-2 text-xs font-medium ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className={`w-full border rounded-xl p-2 text-xs font-mono font-medium ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District / City</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={`w-full border rounded-xl p-2 text-xs font-medium ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chattogram">Chattogram</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barishal">Barishal</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                      <option value="Gazipur">Gazipur</option>
                      <option value="Narayanganj">Narayanganj</option>
                      <option value="Cumilla">Cumilla</option>
                      <option value="Bogura">Bogura</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full border rounded-xl p-2 text-xs font-medium ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Rider & Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Delivery Person / Rider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kabir Hossain (01700-112233)"
                    value={deliveryPerson}
                    onChange={(e) => setDeliveryPerson(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-medium ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-medium ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Courier Notes / Instructions
                </label>
                <input
                  type="text"
                  placeholder="Special instructions for rider or delivery hub..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 text-xs font-medium ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const ord = editingOrder;
                    setEditingOrder(null);
                    setDeleteConfirmOrder(ord);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Shipment</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW DISPATCH MODAL */}
      {isNewDispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className={`border rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl space-y-5 my-8 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Logistics Booking</span>
                  <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Create Courier Dispatch
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsNewDispatchOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDispatch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahfuz Ahmed"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-medium ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01711223344"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-mono font-medium ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Gazipur">Gazipur</option>
                    <option value="Narayanganj">Narayanganj</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Detailed Address
                  </label>
                  <input
                    type="text"
                    placeholder="House, Road, Area..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-medium ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={newCourierCompany}
                    onChange={(e) => setNewCourierCompany(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Steadfast Courier">Steadfast Courier</option>
                    <option value="Pathao Express">Pathao Express</option>
                    <option value="RedX">RedX</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="Sundarban Courier">Sundarban Courier</option>
                    <option value="eCourier">eCourier</option>
                    <option value="SA Paribahan">SA Paribahan</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STDF-849204"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTrackingNumber(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-mono font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Delivery Charge (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newDeliveryCharge}
                    onChange={(e) => setNewDeliveryCharge(Number(e.target.value))}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Package Value (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPackageValue}
                    onChange={(e) => setNewPackageValue(Number(e.target.value))}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newDeliveryStatus}
                    onChange={(e) => setNewDeliveryStatus(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Pending Dispatch">Pending Dispatch</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewDispatchOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md transition-colors"
                >
                  Create Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Delete Dispatch Record?
                </h3>
                <p className="text-xs text-slate-400">
                  Order #{deleteConfirmOrder.orderNumber}
                </p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to delete this courier dispatch for <strong>{deleteConfirmOrder.customer.fullName}</strong> ({deleteConfirmOrder.customer.district})? This will permanently remove the shipment record and tracking consignment.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOrder(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-rose-600/20 transition-colors"
              >
                Yes, Delete Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
