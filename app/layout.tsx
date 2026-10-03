import type { Metadata } from 'next';
import './globals.css';
import { ProductsProvider } from '@/lib/store/productsContext';
import { CartProvider } from '@/lib/store/cartContext';
import { WishlistProvider } from '@/lib/store/wishlistContext';
import { OrderProvider } from '@/lib/store/orderContext';
import StoreLayoutShell from '@/components/layout/StoreLayoutShell';

export const metadata: Metadata = {
  title: 'Jeans BD | Premium Denim & Jeans Fashion Bangladesh',
  description:
    'Shop the finest collection of Men and Women denim in Bangladesh. Slim fit, Baggy, Straight, Cargo jeans, and denim jackets. Cash on delivery & fast nationwide shipping.',
  keywords: [
    'Jeans BD',
    'Denim Bangladesh',
    'Men Jeans Dhaka',
    'Women Jeans Bangladesh',
    'Baggy Jeans BD',
    'Slim Fit Jeans',
    'bKash Online Shopping',
  ],
  openGraph: {
    title: 'Jeans BD - Premium Denim & Jeans Store',
    description: 'Contemporary fashion denim engineered for style and endurance.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col justify-between bg-white text-slate-900">
        <ProductsProvider>
          <WishlistProvider>
            <CartProvider>
              <OrderProvider>
                <StoreLayoutShell>{children}</StoreLayoutShell>
              </OrderProvider>
            </CartProvider>
          </WishlistProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
