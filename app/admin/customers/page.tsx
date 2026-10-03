'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useOrder } from '@/lib/store/orderContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

interface Customer {
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

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Tamim Iqbal',
    phone: '01712-345678',
    email: 'tamim.iqbal@example.com',
    city: 'Dhaka',
    address: 'House 14, Road 7, Dhanmondi, Dhaka',
    totalOrders: 6,
    totalSpent: 14850,
    tier: 'VIP',
    lastOrderDate: '2026-09-27',
    joinDate: '2026-01-15',
  },
  {
    id: 'cust-2',
    name: 'Nusrat Jahan',
    phone: '01823-456789',
    email: 'nusrat.jahan@example.com',
    city: 'Chittagong',
    address: 'GEC Circle, Nasirabad, Chattogram',
    totalOrders: 4,
    totalSpent: 8900,
    tier: 'Regular',
    lastOrderDate: '2026-09-25',
    joinDate: '2026-03-20',
  },
  {
    id: 'cust-3',
    name: 'Mahmudul Hasan',
    phone: '01775-743148',
    email: 'hasansheikh9080@gmail.com',
    city: 'Dhaka',
    address: '13-14 Zoo Road, Mollik Tower, Mirpur-01, Dhaka',
    totalOrders: 8,
    totalSpent: 22400,
    tier: 'VIP',
    lastOrderDate: '2026-09-28',
    joinDate: '2025-11-10',
  },
  {
    id: 'cust-4',
    name: 'Fariha Rahman',
    phone: '01934-567890',
    email: 'fariha.r@example.com',
    city: 'Sylhet',
    address: 'Kumarpara, Sylhet Sadar',
    totalOrders: 2,
    totalSpent: 4200,
    tier: 'Regular',
    lastOrderDate: '2026-09-20',
    joinDate: '2026-06-12',
  },
  {
    id: 'cust-5',
    name: 'Rakibul Islam',
    phone: '01645-678901',
    email: 'rakibul.99@example.com',
    city: 'Dhaka',
    address: 'Sector 4, Uttara, Dhaka-1230',
    totalOrders: 1,
    totalSpent: 2150,
    tier: 'New',
    lastOrderDate: '2026-09-29',
    joinDate: '2026-09-29',
  },
  {
    id: 'cust-6',
    name: 'Sadia Sultana',
    phone: '01556-789012',
    email: 'sadia.denim@example.com',
    city: 'Rajshahi',
    address: 'Shaheb Bazar, Rajshahi',
    totalOrders: 5,
    totalSpent: 11950,
    tier: 'VIP',
    lastOrderDate: '2026-09-18',
    joinDate: '2026-02-05',
  },
];

export default function AdminCustomersPage() {
  const { orders } = useOrder();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Merge INITIAL_CUSTOMERS with real customers extracted from placed orders
  const allCustomers = useMemo(() => {
    const list: Customer[] = [...INITIAL_CUSTOMERS];

    orders.forEach((order) => {
      const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
      const existing = list.find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.totalAmount;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt.slice(0, 10);
        }
        if (existing.totalSpent > 10000 || existing.totalOrders >= 5) {
          existing.tier = 'VIP';
        }
      } else {
        list.unshift({
          id: `cust-order-${order.id}`,
          name: order.customer.fullName,
          phone: order.customer.phone,
          email: order.customer.email || 'customer@order.com',
          city: order.customer.district,
          address: order.customer.address,
          totalOrders: 1,
          totalSpent: order.totalAmount,
          tier: 'New',
          lastOrderDate: order.createdAt.slice(0, 10),
          joinDate: order.createdAt.slice(0, 10),
        });
      }
    });

    return list;
  }, [orders]);

  const filteredCustomers = allCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === 'All' || c.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const totalSpentAll = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersAll = allCustomers.reduce((sum, c) => sum + c.totalOrders, 0);

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Customer Relationship Management (CRM)</span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Customer Directory
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Monitor client purchase frequency, order volume, and VIP loyalty status
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Customer CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-5 rounded-2xl border flex items-center gap-4 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Registered Buyers</span>
            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{allCustomers.length} Customers</h3>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border flex items-center gap-4 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lifetime Spend</span>
            <h3 className="text-xl font-black text-emerald-500">{formatPrice(totalSpentAll)}</h3>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border flex items-center gap-4 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Orders Completed</span>
            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalOrdersAll} Parcels</h3>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border ${
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
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'VIP', 'Regular', 'New'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTier === tier
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
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
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Tier Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-medium ${
                isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-100 text-slate-700'
              }`}
            >
              {filteredCustomers.map((customer) => (
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
                          .slice(0, 2)}
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
                      className={`px-2 py-0.5 rounded border ${
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
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className={`px-3 py-1.5 rounded-xl transition-colors font-bold text-xs ${
                        isDark
                          ? 'bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 space-y-4 animate-scale-up ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Customer Profile</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCustomer.name}</h4>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{selectedCustomer.email}</span>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Phone:</span>
                  <a href={`tel:${selectedCustomer.phone}`} className="font-bold text-emerald-500">
                    {selectedCustomer.phone}
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
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Orders:</span>
                  <span className="font-bold text-blue-500">{selectedCustomer.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Spent:</span>
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

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
