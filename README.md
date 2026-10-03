# Jeans BD (জিন্স বিডি) - Premium Fashion Denim E-Commerce

A full-stack, production-ready Denim & Jeans E-Commerce web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL/Auth)**, and modular **bKash & Nagad Payment Gateways**.

---

## 🌟 Key Features

### 1. Customer Shopping Experience
- **Dynamic Homepage**: Hero promotional slider, Category Showcase, Featured Collections, Denim Fit Guide, Customer Testimonials, Instagram Gallery, and Announcement Bar.
- **Product Catalog & Multi-Facet Filtering**:
  - Filter by Gender (Men, Women, Unisex), Denim Fit (Slim, Baggy, Straight, Cargo, Mom Jeans, Wide Leg, Denim Jacket), Size (26 to 38, M, L, XL), Price slider, and In-Stock / Sale items.
  - Quick View modal, animated hover previews, and Wishlist toggling.
- **Interactive Product Details**:
  - Multi-image zoom gallery, real-time stock feedback per size/color, interactive **Size Guide Modal** (Inches & CM measurements), Verified Customer Reviews submission, and Complete the Look recommendations.
- **Shopping Cart & Checkout**:
  - Free Delivery progress calculator (Orders above ৳2500 get Free Shipping).
  - Discount Coupon redemption (`JEANS10` for 10% off, `DENIM200` for ৳200 flat discount).
  - Bangladesh-tailored checkout with **Cash on Delivery (COD)**, **bKash**, and **Nagad**.
  - District-aware automated delivery fee calculation (Inside Dhaka: ৳80, Outside Dhaka: ৳150).
  - Celebratory Confetti Order Confirmation & Printable Invoices.
- **Real-Time Order Tracking**:
  - Search order status by Order Number (`JBD-84920`) and Mobile Number.
  - Step-by-step visual tracker (Pending → Confirmed → Processing → Ready to Ship → Shipped → Delivered).
  - Courier assignment (Steadfast, Pathao, RedX, Sundarban) and tracking ID details.

### 2. Admin Management Dashboard
- **Analytics & KPIs**: Total Sales Revenue, Order Volume, Active Products, and Low Stock Replenishment Warnings.
- **Product Catalog Manager**: Add new denim products, upload images, manage size/color variations, set regular vs sale prices, adjust stock.
- **Order Fulfillment Console**: Filter orders by status, change delivery stages, assign courier partner, add tracking number, and view customer shipping notes.
- **Coupon Manager**: Create percentage or fixed-amount discount promo codes with minimum purchase requirements and expiration dates.
- **Store Logistics Settings**: Adjust delivery charges, free shipping threshold, hotline phone, support email, and marquee announcement text.

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the active port shown in terminal) in your browser.

---

## 🗄️ Database Setup (Supabase)

1. Create a project on [Supabase](https://supabase.com).
2. Open the SQL Editor and run the SQL migration script located at:
   `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and API keys to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 💳 Payment Gateway Configuration

Add your merchant credentials in `.env.local`:

```env
# bKash PGW
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta

# Nagad PGW
NAGAD_MERCHANT_ID=your_nagad_merchant_id
NAGAD_MERCHANT_PRIVATE_KEY=your_nagad_private_key
```

*(Note: The application operates in sandbox/demo simulation mode when live credentials are not set, allowing full offline testing.)*
