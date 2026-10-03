'use client';

import React from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanner from '@/components/home/PromoBanner';
import DenimFitGuide from '@/components/home/DenimFitGuide';
import CustomerReviews from '@/components/home/CustomerReviews';
import InstagramFeed from '@/components/home/InstagramFeed';
import { useProducts } from '@/lib/store/productsContext';

export default function HomePage() {
  const { products, categories } = useProducts();

  return (
    <div>
      <HeroBanner />
      <CategoryShowcase categories={categories} />
      <FeaturedProducts products={products} />
      <PromoBanner />
      <DenimFitGuide />
      <CustomerReviews />
      <InstagramFeed />
    </div>
  );
}
