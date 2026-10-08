'use client';

/**
 * Production Virtual Fitting Room Modal
 * Replaces legacy canvas overlay with the Real AI Virtual Try-On Engine (Fashn.ai API Pipeline)
 */

import React from 'react';
import { Product } from '@/types';
import VirtualTryOnModal from '@/components/VirtualTryOnModal';

interface VirtualFittingRoomModalProps {
  product: Product;
  initialSize?: string;
  initialColor?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VirtualFittingRoomModal({
  product,
  initialSize,
  initialColor,
  isOpen,
  onClose,
}: VirtualFittingRoomModalProps) {
  return (
    <VirtualTryOnModal
      product={product}
      initialSize={initialSize}
      initialColor={initialColor}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
