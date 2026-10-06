'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShieldCheck,
  Truck,
  ExternalLink,
  Edit,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  UserPlus,
  LogIn,
  Save,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { useAuth } from '@/lib/store/authContext';
import { BANGLADESH_DISTRICTS, formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const { orders } = useOrder();
  const { wishlistCount } = useWishlist();
  const { user, isLoggedIn, isLoading, login, register, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  // Auth toggle for non-logged-in users
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginFeedback, setLoginFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Dhaka');
  const [regAddress, setRegAddress] = useState('');
  const [regFeedback, setRegFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Edit Profile Form States (synced with logged-in user)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('Dhaka');
  const [editAddress, setEditAddress] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync edit profile form with logged-in user
  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditPhone(user.phone || '');
      setEditEmail(user.email || '');
      setEditCity(user.city || 'Dhaka');
      setEditAddress(user.address || '');
    }
  }, [user]);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setLoginFeedback({ success: false, message: 'Please enter your phone number or email.' });
      return;
    }
    const res = login(loginIdentifier.trim(), loginPassword);
    setLoginFeedback(res);
  };

  // Handle Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regPhone.trim()) {
      setRegFeedback({ success: false, message: 'Full name and phone number are required.' });
      return;
    }
    const res = register({
      fullName: regFullName,
      phone: regPhone,
      email: regEmail,
      city: regCity,
      address: regAddress,
      password: regPassword,
    });
    setRegFeedback(res);
  };

  // Handle Profile Update Submit
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setSaveStatus('Full name cannot be empty.');
      return;
    }
    const res = updateProfile({
      fullName: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      city: editCity.trim(),
      address: editAddress.trim(),
    });

    setSaveStatus(res.message || 'Changes saved successfully!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Quick 1-click Demo Login
  const handleQuickDemoLogin = () => {
    login('01711223344');
  };

  // Filter orders matching logged-in user or show all orders
  const userOrders = orders.filter((o) => {
    if (!user) return true;
    const cleanUserPhone = user.phone.replace(/[^0-9]/g, '');
    const cleanOrderPhone = o.customer.phone.replace(/[^0-9]/g, '');
    const emailMatch = user.email && o.customer.email && user.email.toLowerCase() === o.customer.email.toLowerCase();
    return cleanOrderPhone.includes(cleanUserPhone) || cleanUserPhone.includes(cleanOrderPhone) || emailMatch;
  });

  const displayOrders = userOrders.length > 0 ? userOrders : orders;

  // Extract initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'JB';

  // If user is NOT logged in, show Auth / Create Account Portal
  if (!isLoggedIn || !user) {
    return (
      <div className="bg-slate-950/95 text-white py-12 lg:py-20 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <User className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white font-display">Jeans BD Customer Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Create an account or sign in to track orders, saved addresses &amp; wishlist
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginFeedback(null);
                setRegFeedback(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (লগইন)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginFeedback(null);
                setRegFeedback(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account (নতুন একাউন্ট)
            </button>
          </div>

          {/* SIGN IN TAB */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Phone Number or Email
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01711-223344 or name@mail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter password (optional)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {loginFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    loginFeedback.success
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {loginFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{loginFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500 font-bold">Or Test Account</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue as Tanvir Hossain (Demo Account)</span>
              </button>
            </form>
          )}

          {/* CREATE ACCOUNT TAB */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Full Name (আপনার নাম) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Hasan"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Phone (মোবাইল) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Email (ইমেইল)
                  </label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    District / City (জেলা)
                  </label>
                  <select
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Password (পাসওয়ার্ড)
                  </label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Full Delivery Address (ঠিকানা)
                </label>
                <input
                  type="text"
                  placeholder="House, Road, Area (e.g. Mirpur-1, Dhaka)"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {regFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    regFeedback.success
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {regFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{regFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account &amp; Sign In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // LOGGED-IN ACCOUNT DASHBOARD
  return (
    <div className="bg-slate-50/60 py-10 lg:py-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
        {/* Profile Card Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-black text-2xl flex items-center justify-center border-2 border-white/20 shadow-lg shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-xl font-black text-white">{user.fullName}</h1>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  {user.tier === 'VIP' ? '★ VIP Customer' : 'Verified Customer'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Active Account
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {user.phone} • {user.email || 'No email provided'} • {user.city}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Member since {user.joinedDate || 'September 2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Profile</span>
            </button>

            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Admin Dashboard
            </Link>

            <button
              type="button"
              onClick={logout}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Account Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-blue-500" />
                <span>My Orders</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {displayOrders.length}
              </span>
            </button>

            <Link
              href="/account/wishlist"
              className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Saved Wishlist</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {wishlistCount}
              </span>
            </Link>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Saved Delivery Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4 text-purple-500" />
              <span>Account Settings (Edit)</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                    Order History ({displayOrders.length})
                  </h3>
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <span>Browse Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {displayOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                    <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No previous orders found.</p>
                  </div>
                ) : (
                  displayOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900">
                              Order #{order.orderNumber}
                            </span>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {order.orderStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs font-black text-slate-900 block">
                            {formatPrice(order.totalAmount)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-12 rounded-lg object-cover bg-slate-100"
                              />
                              <div>
                                <span className="font-bold text-slate-900">{item.name}</span>
                                <p className="text-slate-400 text-[11px]">
                                  Waist: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">{formatPrice(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{order.delivery.courierCompany || 'Steadfast Courier'}</span>
                        </div>

                        <Link
                          href={`/track-order?order=${order.orderNumber}&phone=${order.customer.phone}`}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>Live Tracking</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                    Saved Delivery Addresses
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit in Settings
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Primary Delivery Address</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">
                    {user.fullName} ({user.phone})
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {user.address || '13-14 Zoo Road, Mollik Tower, Mirpur-01'}
                  </p>
                  <p className="text-slate-500 font-semibold">{user.city || 'Dhaka'}, Bangladesh</p>
                </div>
              </div>
            )}

            {/* TAB 3: PROFILE SETTINGS / EDIT ACCOUNT */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                      Edit Account Profile (একাউন্ট এডিট করুন)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update your name, contact phone, delivery address &amp; profile details
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                    {user.tier || 'New'} Customer
                  </span>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                        Full Name (পুরো নাম) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                        Phone Number (মোবাইল) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                        Email Address (ইমেইল)
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                        District / City (জেলা)
                      </label>
                      <select
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        {BANGLADESH_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                      Default Delivery Address (সম্পূর্ণ ঠিকানা)
                    </label>
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="House No, Road No, Area, Landmark"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  {saveStatus && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{saveStatus}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes (সংরক্ষণ করুন)</span>
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      Switch / Log Out Account
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
