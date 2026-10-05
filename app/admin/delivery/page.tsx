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
  Edit,
  Copy,
  Check,
  Filter,
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
  const { orders, updateOrderDelivery, updateOrderStatus } = useOrder();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Edit form state
  const [courierCompany, setCourierCompany] = useState('Steadfast');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('In Transit');
  const [deliveryCharge, setDeliveryCharge] = useState(80);
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setCourierCompany(order.delivery?.courierCompany || 'Steadfast');
    setTrackingNumber(order.delivery?.trackingNumber || '');
    setDeliveryStatus(order.delivery?.deliveryStatus || (order.orderStatus === 'Delivered' ? 'Delivered' : 'Pending Dispatch'));
    setDeliveryCharge(order.delivery?.deliveryCharge ?? order.deliveryCharge ?? 80);
    setDeliveryPerson((order.delivery as any)?.deliveryPerson || '');
    setExpectedDate(order.delivery?.estimatedDeliveryDate || '');
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    updateOrderDelivery(editingOrder.id, {
      courierCompany,
      trackingNumber,
      deliveryStatus,
      deliveryCharge,
      estimatedDeliveryDate: expectedDate || undefined,
      notes: deliveryPerson ? `Delivery Agent: ${deliveryPerson}` : undefined,
    });

    if (deliveryStatus === 'Delivered') {
      updateOrderStatus(editingOrder.id, 'Delivered', `Delivered via ${courierCompany}`);
    } else if (deliveryStatus === 'In Transit' || deliveryStatus === 'Out for Delivery') {
      updateOrderStatus(editingOrder.id, 'Shipped', `Courier in transit with ${courierCompany}`);
    }

    setEditingOrder(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats
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
    if (selectedCourier !== 'all' && (o.delivery?.courierCompany || 'Unassigned') !== selectedCourier) {
      return false;
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
      const matchCity = o.customer.district.toLowerCase().includes(q);
      const matchTracking = (o.delivery?.trackingNumber || '').toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchCity || matchTracking;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            Track nationwide courier shipments, assign riders, set delivery tracking numbers, and manage Dhaka / Outside Dhaka orders.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Shipments</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalDeliveries}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">All registered dispatches</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Pending Dispatch</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-black mt-2 text-amber-500`}>
            {pendingDispatch}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting packaging / rider</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">In Transit / Out</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-black mt-2 text-blue-500`}>
            {inTransit}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">On the road to customer</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-black mt-2 text-emerald-500`}>
            {deliveredCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Completed & verified</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-4 ${
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
            <option value="Steadfast Courier">Steadfast Courier</option>
            <option value="Pathao Express">Pathao Express</option>
            <option value="RedX">RedX</option>
            <option value="Paperfly">Paperfly</option>
            <option value="Sundarban Courier">Sundarban Courier</option>
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
                    No shipments found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const courier = ord.delivery?.courierCompany || (ord.customer.district === 'Dhaka' ? 'Steadfast Courier' : 'Pathao Express');
                  const tracking = ord.delivery?.trackingNumber || 'Pending assignment';
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
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {ord.customer.address}, {ord.customer.area}
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
                        {ord.delivery?.trackingNumber ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-blue-500 font-bold">
                              {ord.delivery.trackingNumber}
                            </span>
                            <button
                              onClick={() => handleCopy(ord.delivery.trackingNumber!, ord.id)}
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
                          <Link
                            href={`/track-order?order=${encodeURIComponent(ord.orderNumber)}&phone=${encodeURIComponent(ord.customer.phone)}`}
                            target="_blank"
                            title="Public Tracking View"
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(ord)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Dispatch</span>
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

      {/* Edit Delivery Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl space-y-5 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-3.5 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-500">Logistics Fulfillment</span>
                <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Dispatch Order #{editingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                  </select>
                </div>

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
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Courier Tracking Number (Consignment ID)
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Delivery Person / Rider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kabir Hossain"
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
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
                  Save Dispatch Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
