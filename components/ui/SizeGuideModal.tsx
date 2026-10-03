'use client';

import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  gender?: 'men' | 'women' | 'unisex';
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  gender = 'men',
}: SizeGuideModalProps) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const menSizes = [
    { size: '28', waistIn: '28-29', waistCm: '71-74', hipIn: '34-35', hipCm: '86-89', thighIn: '21', thighCm: '53', lengthIn: '32', lengthCm: '81' },
    { size: '30', waistIn: '30-31', waistCm: '76-79', hipIn: '36-37', hipCm: '91-94', thighIn: '22', thighCm: '56', lengthIn: '32', lengthCm: '81' },
    { size: '32', waistIn: '32-33', waistCm: '81-84', hipIn: '38-39', hipCm: '96-99', thighIn: '23', thighCm: '58', lengthIn: '32', lengthCm: '81' },
    { size: '34', waistIn: '34-35', waistCm: '86-89', hipIn: '40-41', hipCm: '101-104', thighIn: '24', thighCm: '61', lengthIn: '32', lengthCm: '81' },
    { size: '36', waistIn: '36-37', waistCm: '91-94', hipIn: '42-43', hipCm: '106-109', thighIn: '25', thighCm: '63', lengthIn: '32', lengthCm: '81' },
    { size: '38', waistIn: '38-39', waistCm: '96-99', hipIn: '44-45', hipCm: '111-114', thighIn: '26', thighCm: '66', lengthIn: '32', lengthCm: '81' },
  ];

  const womenSizes = [
    { size: '26', waistIn: '25-26', waistCm: '63-66', hipIn: '35-36', hipCm: '89-91', thighIn: '20', thighCm: '51', lengthIn: '30', lengthCm: '76' },
    { size: '28', waistIn: '27-28', waistCm: '68-71', hipIn: '37-38', hipCm: '94-96', thighIn: '21', thighCm: '53', lengthIn: '30', lengthCm: '76' },
    { size: '30', waistIn: '29-30', waistCm: '73-76', hipIn: '39-40', hipCm: '99-102', thighIn: '22', thighCm: '56', lengthIn: '30', lengthCm: '76' },
    { size: '32', waistIn: '31-32', waistCm: '78-81', hipIn: '41-42', hipCm: '104-107', thighIn: '23', thighCm: '58', lengthIn: '30', lengthCm: '76' },
    { size: '34', waistIn: '33-34', waistCm: '84-86', hipIn: '43-44', hipCm: '109-112', thighIn: '24', thighCm: '61', lengthIn: '30', lengthCm: '76' },
  ];

  const data = gender === 'women' ? womenSizes : menSizes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close size guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {gender === 'women' ? "Women's Denim Size Guide" : "Men's Denim Size Guide"}
            </h3>
            <p className="text-xs text-slate-500">Accurate body measurements to help you find the perfect fit</p>
          </div>
        </div>

        {/* Unit toggle */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded-md transition-all ${
                unit === 'inches' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-md transition-all ${
                unit === 'cm' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-5">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Size (Tag)</th>
                <th className="py-3 px-4">Waist</th>
                <th className="py-3 px-4">Hip</th>
                <th className="py-3 px-4">Thigh</th>
                <th className="py-3 px-4">Inseam Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data.map((row) => (
                <tr key={row.size} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">{row.size}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? `${row.waistIn}"` : `${row.waistCm} cm`}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? `${row.hipIn}"` : `${row.hipCm} cm`}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? `${row.thighIn}"` : `${row.thighCm} cm`}</td>
                  <td className="py-3 px-4">{unit === 'inches' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Tip */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
          <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>
            <strong className="text-slate-900">Pro Tip:</strong> For slim or skinny fits with 2% elastane stretch, select your exact waist measurement. For 100% rigid vintage cotton baggy cuts, we recommend picking true size for relaxed drape or sizing down for fitted waist.
          </span>
        </div>
      </div>
    </div>
  );
}
