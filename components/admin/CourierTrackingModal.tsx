'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';

interface CourierTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courierCompany: string;
  trackingNumber: string;
  consignmentId?: string;
  orderNumber?: string;
}

export default function CourierTrackingModal({
  isOpen,
  onClose,
  courierCompany,
  trackingNumber,
  consignmentId,
  orderNumber,
}: CourierTrackingModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    success: boolean;
    statusText?: string;
    humanStatus?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && (trackingNumber || consignmentId)) {
      fetchStatus();
    }
  }, [isOpen, trackingNumber, consignmentId]);

  const fetchStatus = async () => {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch('/api/courier/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: courierCompany,
          trackingCode: trackingNumber,
          consignmentId: consignmentId,
          invoice: orderNumber,
        }),
      });

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setData({
        success: false,
        message: err?.message || 'Failed to query tracking information.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSteadfast = courierCompany.toLowerCase().includes('steadfast');
  const trackingUrl = isSteadfast
    ? `https://steadfast.com.bd/t/${trackingNumber}`
    : `https://pathao.com/courier-tracking/?consignment_id=${consignmentId || trackingNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isSteadfast ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                Live Courier Tracking
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {courierCompany} • {trackingNumber || consignmentId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Querying live status from {courierCompany} hub...
              </p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${
                data.success ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-500/10 border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Delivery Status
                  </span>
                  <span className="text-[11px] text-slate-500">Live API Sync</span>
                </div>

                <div className="text-base font-black text-white">
                  {data.humanStatus || data.statusText || data.message}
                </div>

                {data.statusText && data.humanStatus && data.statusText !== data.humanStatus && (
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Raw Status: {data.statusText}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  <span>Open Official Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={fetchStatus}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Refresh Status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              Click refresh to check status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
