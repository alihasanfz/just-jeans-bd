export type ProductFit =
  | 'Slim Fit'
  | 'Regular Fit'
  | 'Straight Fit'
  | 'Skinny Fit'
  | 'Baggy Fit'
  | 'Cargo Jeans'
  | 'Mom Jeans'
  | 'Wide Leg'
  | 'Bootcut'
  | 'Denim Jacket'
  | 'Denim Shirt';

export type GenderCategory = 'men' | 'women' | 'unisex';

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  userAvatar?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  titleBn?: string;
  category: string;
  gender: GenderCategory;
  fit: ProductFit;
  washColor?: string;
  fabricComposition?: string;
  description: string;
  details: string[];
  fabricCare: string[];
  price: number; // Regular price in BDT
  discountPrice?: number; // Sale price in BDT
  discountPercentage?: number;
  images: string[];
  thumbnail: string;
  videoUrl?: string; // YouTube, Vimeo, MP4 file or streaming link
  videos?: string[]; // Multiple video links or files
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  variants: ProductVariant[];
  totalStock: number;
  tags: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: GenderCategory;
  description: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  id: string; // unique cart item id (productId_size_color)
  productId: string;
  productSlug: string;
  name: string;
  image: string;
  price: number;
  regularPrice: number;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  maxStock: number;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export interface OrderAddress {
  fullName: string;
  phone: string;
  email?: string;
  district: string;
  area: string;
  address: string;
  notes?: string;
}

export interface OrderDelivery {
  courierCompany?: string; // 'Steadfast' | 'Pathao' | 'RedX' | 'Sundarban' | 'Paperfly'
  trackingNumber?: string;
  deliveryCharge: number;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveryStatus: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "JBD-84920"
  userId?: string;
  guestEmail?: string;
  customer: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  orderStatus: OrderStatus;
  delivery: OrderDelivery;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
  addresses: OrderAddress[];
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  googleMapUrl?: string;
  announcementText: string;
  freeShippingThreshold: number;
  deliveryChargeDhaka: number;
  deliveryChargeOutsideDhaka: number;
  bkashNumber: string;
  nagadNumber: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  categoryShowcase?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  banners: {
    heroSlides: {
      id: string;
      title: string;
      titlePart1?: string;
      titleHighlight?: string;
      subtitle: string;
      badge: string;
      buttonText: string;
      buttonLink: string;
      button2Text?: string;
      button2Link?: string;
      imageUrl: string;
      videoUrl?: string; // Optional motion video background (MP4 file or streaming link)
    }[];
  };
  promoBanner?: {
    badge: string;
    title: string;
    subtitle?: string;
    description: string;
    couponCode: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    imageUrl2?: string;
    imageTag: string;
  };
  customerReviews?: {
    badge: string;
    title: string;
    subtitle: string;
    score?: string;
    reviewCountText?: string;
    items: {
      id: string;
      name: string;
      city: string;
      rating: number;
      productName?: string;
      comment: string;
      avatar?: string;
    }[];
  };
  fitGuide?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    items: {
      id: string;
      name: string;
      tagline?: string;
      desc: string;
      bestFor?: string;
      image: string;
      link: string;
    }[];
  };
  instagramFeed?: {
    badge?: string;
    handle: string;
    title: string;
    url: string;
    images: string[];
  };
  trustBadges?: {
    deliveryTitle: string;
    deliverySubtitle: string;
    cottonTitle: string;
    cottonSubtitle: string;
    exchangeTitle: string;
    exchangeSubtitle: string;
    paymentTitle: string;
    paymentSubtitle: string;
  };
  footerBrandDescription?: string;
  copyrightText?: string;
  stockAlerts?: {
    id: string;
    name: string;
    fit: string;
    stock: number;
    image: string;
    productId?: string;
  }[];
}

