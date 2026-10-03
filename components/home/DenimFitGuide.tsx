'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import SizeGuideModal from '@/components/ui/SizeGuideModal';

export default function DenimFitGuide() {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const fits = [
    {
      name: 'Slim Fit',
      tagline: 'Modern & Tailored',
      desc: 'Form-fitting through hip and thigh, tapering neatly at the ankle. Woven with 2% elastane flex for effortless stretch.',
      bestFor: 'Everyday casual, sneakers, dress shirts',
      image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
      link: '/shop?fit=Slim+Fit',
    },
    {
      name: 'Baggy & Skater Fit',
      tagline: 'Relaxed Street Silhouette',
      desc: 'Generous room from waist to hem. Heavyweight 13.5oz rigid cotton that stacks naturally over chunky footwear.',
      bestFor: 'Streetwear, graphic tees, hoodies',
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
      link: '/shop?fit=Baggy+Fit',
    },
    {
      name: 'Straight Leg',
      tagline: 'Timeless Heritage Cut',
      desc: 'Consistent parallel width from knee to cuff. Vintage American workwear heritage styling with authentic selvedge trims.',
      bestFor: 'Classic styles, boots, polo shirts',
      image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80',
      link: '/shop?fit=Straight+Fit',
    },
    {
      name: 'High-Rise Wide Leg',
      tagline: 'Chic Elongated Drape',
      desc: 'Cinched high waist that flows into a wide flare. Creates an elegant proportion and floor-sweeping grace.',
      bestFor: 'Crop tops, heels, relaxed blazers',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      link: '/shop?fit=Wide+Leg',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
              Fit Consultation
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">
              The Denim Fit Guide
            </h2>
          </div>
          <button
            onClick={() => setIsSizeGuideOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-blue-300 px-4 py-2.5 rounded-xl border border-white/10 transition-all self-start md:self-auto"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Open Measurement Chart</span>
          </button>
        </div>

        {/* Fit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fits.map((f, i) => (
            <div
              key={i}
              className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-slate-800">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>

                <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider block mb-1">
                  {f.tagline}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{f.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{f.desc}</p>
              </div>

              <div>
                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 text-[11px] text-slate-300 mb-4">
                  <span className="text-slate-400 font-semibold block mb-0.5">Best Paired With:</span>
                  <span>{f.bestFor}</span>
                </div>

                <Link
                  href={f.link}
                  className="w-full bg-white/10 hover:bg-blue-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Shop {f.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </section>
  );
}
