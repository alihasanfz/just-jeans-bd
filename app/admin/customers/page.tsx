'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ExternalLink,
  Crown,
  CheckCircle2,
  Calendar,
  DollarSign,
  Download,
  Edit,
  Trash2,
  Plus,
  X,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useOrder } from '@/lib/store/orderContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { idbGet, idbSet } from '@/lib/utils/db';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  tier: 'VIP' | 'Regular' | 'New';
  lastOrderDate: string;
  joinDate: string;
}

const INITIAL_CUSTOMERS: Customer[] = [];

export default function AdminCustomersPage() {
  const { orders } = useOrder();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Create Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Modal form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTier, setFormTier] = useState<'VIP' | 'Regular' | 'New'>('New');
  const [formOrders, setFormOrders] = useState<number>(1);
  const [formSpent, setFormSpent] = useState<number>(0);

  // Load saved customers from IndexedDB / localStorage on mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        const idbCusts = await idbGet<Customer[]>('jeansbd_customers');
        let baseList: Customer[] = [];

        if (idbCusts && Array.isArray(idbCusts) && idbCusts.length > 0) {
          baseList = idbCusts.filter((c) => !c.id.startsWith('cust-') || c.id.startsWith('cust-order-'));
        } else {
          const saved = localStorage.getItem('jeansbd_customers');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              baseList = parsed.filter((c) => !c.id.startsWith('cust-') || c.id.startsWith('cust-order-'));
            }
          }
        }

        // Merge any new orders that haven't been added yet
        const merged = [...baseList];
        const safeOrdersList = Array.isArray(orders) ? orders : [];
        safeOrdersList.forEach((order) => {
          if (!order) return;
          const cleanPhone = String(order.customer?.phone || '').replace(/[^0-9]/g, '');
          if (!cleanPhone) return;
          const existing = merged.find((c) => String(c?.phone || '').replace(/[^0-9]/g, '') === cleanPhone);

          if (!existing) {
            const nowIso = new Date().toISOString().slice(0, 10);
            const orderDate = order.createdAt ? String(order.createdAt).slice(0, 10) : nowIso;
            merged.unshift({
              id: `cust-order-${order.id || Date.now()}`,
              name: order.customer?.fullName || 'Customer',
              phone: order.customer?.phone || '',
              email: order.customer?.email || 'customer@order.com',
              city: order.customer?.district || 'Dhaka',
              address: order.customer?.address || '',
              totalOrders: 1,
              totalSpent: Number(order.totalAmount) || 0,
              tier: (Number(order.totalAmount) || 0) >= 10000 ? 'VIP' : 'New',
              lastOrderDate: orderDate,
              joinDate: orderDate,
            });
          }
        });

        setCustomers(merged);
      } catch (e) {
        console.error('Failed to load customers', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadCustomers();
  }, [orders]);

  // Save customers to IndexedDB & localStorage on update
  useEffect(() => {
    if (!isLoaded) return;
    idbSet('jeansbd_customers', customers);
    try {
      localStorage.setItem('jeansbd_customers', JSON.stringify(customers));
    } catch (e) {
      console.warn('LocalStorage limit reached; saved to IndexedDB');
    }
  }, [customers, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Edit Modal
  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormPhone(cust.phone);
    setFormEmail(cust.email);
    setFormCity(cust.city);
    setFormAddress(cust.address);
    setFormTier(cust.tier);
    setFormOrders(cust.totalOrders);
    setFormSpent(cust.totalSpent);
    setIsEditModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCity('Dhaka');
    setFormAddress('');
    setFormTier('New');
    setFormOrders(1);
    setFormSpent(2000);
    setIsEditModalOpen(true);
  };

  // Save Edit / Create
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Please fill out customer name and phone number.');
      return;
    }

    if (editingCustomer) {
      // Update existing
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                name: formName.trim(),
                phone: formPhone.trim(),
                email: formEmail.trim() || 'customer@order.com',
                city: formCity.trim(),
                address: formAddress.trim(),
                tier: formTier,
                totalOrders: Number(formOrders) || 0,
                totalSpent: Number(formSpent) || 0,
              }
            : c
        )
      );

      // If this customer is currently selected in profile drawer, update it too
      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer({
          ...selectedCustomer,
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || 'customer@order.com',
          city: formCity.trim(),
          address: formAddress.trim(),
          tier: formTier,
          totalOrders: Number(formOrders) || 0,
          totalSpent: Number(formSpent) || 0,
        });
      }

      showToast(`Customer "${formName}" updated successfully!`);
    } else {
      // Create new
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || 'customer@order.com',
        city: formCity.trim() || 'Dhaka',
        address: formAddress.trim(),
        tier: formTier,
        totalOrders: Number(formOrders) || 1,
        totalSpent: Number(formSpent) || 0,
        lastOrderDate: new Date().toISOString().slice(0, 10),
        joinDate: new Date().toISOString().slice(0, 10),
      };
      setCustomers((prev) => [newCust, ...prev]);
      showToast(`New customer "${formName}" added successfully!`);
    }

    setIsEditModalOpen(false);
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(null);
      }
      showToast(`Customer "${name}" has been deleted.`);
    }
  };

  const handleViewAsCustomer = (cust: Customer) => {
    const userProf = {
      id: cust.id,
      fullName: cust.name,
      phone: cust.phone,
      email: cust.email,
      city: cust.city,
      address: cust.address,
      tier: cust.tier,
      joinedDate: cust.joinDate || 'September 2026',
      totalOrders: cust.totalOrders,
      totalSpent: cust.totalSpent,
      role: 'customer',
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jeansbd_current_user', JSON.stringify(userProf));
      } catch (e) {}
    }
    window.open('/account', '_blank');
  };

  // Filtered list
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === 'All' || c.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersAll = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const vipCount = customers.filter((c) => c.tier === 'VIP').length;

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'City', 'Address', 'Total Orders', 'Total Spent', 'Tier'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.city}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.totalOrders,
      c.totalSpent,
      c.tier,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'jeansbd_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Customer Directory & CRM</span>
          </div>
          <h1 className={`text-2xl lg:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Store Customers
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Monitor client purchase frequency, order volume, address details, and manage customer accounts
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={handleExportCSV}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border shadow-xs ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Registered Buyers</span>
              <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {customers.length} Customers
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Lifetime Spend</span>
              <div className="text-xl font-black text-emerald-500">
                {formatPrice(totalSpentAll)}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Orders Completed</span>
              <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalOrdersAll} Parcels
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'VIP', 'Regular', 'New'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                filterTier === tier
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all shadow-md ${
          isDark ? 'bg-slate-950/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
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
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Tier Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-medium ${
                isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-100 text-slate-700'
              }`}
            >
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                          {customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{customer.name}</div>
                          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`tel:${customer.phone}`}
                        className="font-mono text-emerald-500 hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{customer.phone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className={`flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{customer.city}</span>
                      </div>
                      <span className={`text-[10px] block truncate max-w-[180px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {customer.address}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-lg border ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        {customer.totalOrders} Orders
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-500">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="py-3.5 px-4">
                      {customer.tier === 'VIP' && (
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                          <Crown className="w-3 h-3" />
                          VIP
                        </span>
                      )}
                      {customer.tier === 'Regular' && (
                        <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full w-max block">
                          Regular
                        </span>
                      )}
                      {customer.tier === 'New' && (
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full w-max block border ${
                            isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          New
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className={`px-2.5 py-1.5 rounded-xl transition-all font-bold text-xs ${
                            isDark
                              ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
                          }`}
                          title="View Profile Details"
                        >
                          View Profile
                        </button>

                        <button
                          onClick={() => handleViewAsCustomer(customer)}
                          className={`p-1.5 rounded-xl transition-all font-bold text-xs active:scale-95 ${
                            isDark
                              ? 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20'
                              : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200'
                          }`}
                          title="View /account as this user"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(customer)}
                          className={`p-1.5 rounded-xl transition-all font-bold text-xs active:scale-95 ${
                            isDark
                              ? 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20'
                              : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200'
                          }`}
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className={`p-1.5 rounded-xl transition-all font-bold text-xs active:scale-95 ${
                            isDark
                              ? 'bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20'
                              : 'bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200'
                          }`}
                          title="Delete Customer"
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

      {/* Customer Detail Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 space-y-4 animate-scale-up ${
              isDark ? 'bg-slate-950 border-slate-800 shadow-2xl shadow-black/80' : 'bg-white border-slate-200 shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Customer Profile
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className={`p-1 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCustomer.name}
                  </h4>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{selectedCustomer.email}</span>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Contact Hotline:</span>
                  <a href={`tel:${selectedCustomer.phone}`} className="font-bold text-emerald-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedCustomer.phone}</span>
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>City / District:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCustomer.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Address:</span>
                  <span className={`text-right max-w-[200px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCustomer.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loyalty Tier:</span>
                  <span className="font-bold text-amber-400">{selectedCustomer.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Orders:</span>
                  <span className="font-bold text-blue-500">{selectedCustomer.totalOrders} Orders</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Lifetime Spent:</span>
                  <span className="font-bold text-emerald-500">
                    {formatPrice(selectedCustomer.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Last Order Date:</span>
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>{selectedCustomer.lastOrderDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions inside Profile Modal */}
            <div className={`pt-3 border-t flex items-center justify-between gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.name)}
                className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleViewAsCustomer(selectedCustomer)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  title="Open /account page as this customer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Account</span>
                </button>
                <button
                  onClick={() => openEditModal(selectedCustomer)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Customer</span>
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs ${
                    isDark ? 'text-slate-400 hover:text-white bg-slate-900' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-scale-up my-8 ${
              isDark ? 'bg-slate-950 border-slate-800 shadow-2xl shadow-black/80' : 'bg-white border-slate-200 shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className={`text-base font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Update client information, loyalty tier status, and address details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamim Iqbal"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01712-345678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    City / District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Delivery Street Address
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. House 14, Road 7, Dhanmondi, Dhaka"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Loyalty Tier
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as any)}
                    className={`w-full border rounded-xl px-3 py-2 font-bold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="VIP">VIP</option>
                    <option value="Regular">Regular</option>
                    <option value="New">New</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Total Orders
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formOrders}
                    onChange={(e) => setFormOrders(Number(e.target.value))}
                    className={`w-full border rounded-xl px-3 py-2 font-mono ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold uppercase text-[11px] mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Total Spent (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formSpent}
                    onChange={(e) => setFormSpent(Number(e.target.value))}
                    className={`w-full border rounded-xl px-3 py-2 font-mono ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className={`pt-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  {editingCustomer ? 'Save Customer Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
