import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ProductsProvider } from '@/lib/store/productsContext';
import { CartProvider } from '@/lib/store/cartContext';
import { WishlistProvider } from '@/lib/store/wishlistContext';
import { OrderProvider } from '@/lib/store/orderContext';
import { AuthProvider } from '@/lib/store/authContext';
import StoreLayoutShell from '@/components/layout/StoreLayoutShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

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
    'Cash on delivery Bangladesh jeans',
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
    <html lang="en" className={`scroll-smooth ${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
        <ProductsProvider>
          <WishlistProvider>
            <CartProvider>
              <OrderProvider>
                <AuthProvider>
                  <StoreLayoutShell>{children}</StoreLayoutShell>
                </AuthProvider>
              </OrderProvider>
            </CartProvider>
          </WishlistProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
