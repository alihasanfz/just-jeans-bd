'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  CheckCircle2,
  Truck,
  Printer,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronDown,
  PhoneCall,
  MapPin,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useOrder } from '@/lib/store/orderContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const highlightedOrder = searchParams.get('order') || '';

  const { orders, updateOrderStatus, updateOrderDelivery, deleteOrder } = useOrder();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState(highlightedOrder);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);

  // Edit status modal
  const [modalStatus, setModalStatus] = useState<OrderStatus>('Pending');
  const [modalCourier, setModalCourier] = useState('Steadfast');
  const [modalTracking, setModalTracking] = useState('');
  const [modalNote, setModalNote] = useState('');

  const openManageModal = (order: Order) => {
    setSelectedOrder(order);
    setModalStatus(order.orderStatus);
    setModalCourier(order.delivery.courierCompany || 'Steadfast');
    setModalTracking(order.delivery.trackingNumber || '');
    setModalNote('');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderStatus(selectedOrder.id, modalStatus, modalNote);
    updateOrderDelivery(selectedOrder.id, {
      courierCompany: modalCourier,
      trackingNumber: modalTracking,
      deliveryStatus: modalStatus === 'Delivered' ? 'Delivered' : modalStatus === 'Shipped' ? 'In Transit' : 'Pending',
    });

    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'all' && o.orderStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Orders & Courier Fulfillment
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Process customer orders, assign couriers, generate tracking numbers, and view customer details ({orders.length} total)
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order #, Customer, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl py-2 pl-9 pr-4 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'Pending', 'Confirmed', 'Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
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
                <th className="py-3.5 px-4">Customer & Phone</th>
                <th className="py-3.5 px-4">Delivery Location</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Courier & Tracking</th>
                <th className="py-3.5 px-4">Quick Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${
              isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-700'
            }`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No orders matching your search or status criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className={isDark ? 'hover:bg-slate-900/40 transition-colors' : 'hover:bg-slate-50/80 transition-colors'}>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold font-mono block text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{ord.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{ord.customer.fullName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a href={`tel:${ord.customer.phone}`} className="text-[11px] text-blue-500 hover:underline font-mono">
                          {ord.customer.phone}
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{ord.customer.district}</span>
                      <span className="text-[10px] text-slate-400 truncate block max-w-xs">{ord.customer.area}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{ord.items.length} items</span>
                      <span className="text-[10px] text-slate-400">
                        {ord.items.map((i) => `${i.name.slice(0, 12)}... (${i.size})`).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-black text-sm block ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(ord.totalAmount)}</span>
                      <span className="uppercase text-[10px] font-bold text-slate-400">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {ord.delivery.courierCompany || 'Unassigned'}
                      </span>
                      <span className="text-[10px] text-blue-500 font-mono">
                        {ord.delivery.trackingNumber || 'No tracking #'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus, `Status updated from table`)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-xl border focus:outline-none transition-all ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                            : ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Returned'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        } ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready to Ship">Ready to Ship</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/track-order?order=${encodeURIComponent(ord.orderNumber)}&phone=${encodeURIComponent(ord.customer.phone)}`}
                          target="_blank"
                          title="View Tracking / Invoice"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openManageModal(ord)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setDeleteConfirmOrder(ord)}
                          title="Delete Order"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Manage & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl space-y-6 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-500">Fulfillment Console</span>
                <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Order #{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`p-1 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Change Order Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as OrderStatus)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Pending">Pending (Order Placed)</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing (Packaging)</option>
                  <option value="Ready to Ship">Ready to Ship (Courier Dispatch)</option>
                  <option value="Shipped">Shipped (In Transit)</option>
                  <option value="Out for Delivery">Out for Delivery (With Courier Rider)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Courier Partner
                  </label>
                  <select
                    value={modalCourier}
                    onChange={(e) => setModalCourier(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Steadfast">Steadfast Courier</option>
                    <option value="Pathao">Pathao Express</option>
                    <option value="RedX">RedX Delivery</option>
                    <option value="Sundarban">Sundarban Courier</option>
                    <option value="Paperfly">Paperfly</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Courier Tracking #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ST-98432190"
                    value={modalTracking}
                    onChange={(e) => setModalTracking(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Status Note / Internal Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified by phone call, dispatched via banani hub"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className={`pt-4 border-t flex items-center justify-between gap-3 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    setDeleteConfirmOrder(ord);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Order</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className={`px-4 py-2 font-bold text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Update & Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                  Delete Order Permanently?
                </h3>
                <p className="text-xs text-slate-400">
                  Order #{deleteConfirmOrder.orderNumber}
                </p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to delete order <strong>#{deleteConfirmOrder.orderNumber}</strong> for <strong>{deleteConfirmOrder.customer.fullName}</strong>? This will remove this order and its tracking records permanently.
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
                onClick={() => {
                  deleteOrder(deleteConfirmOrder.id);
                  setDeleteConfirmOrder(null);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-rose-600/20 transition-colors"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Loading Orders Console...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
