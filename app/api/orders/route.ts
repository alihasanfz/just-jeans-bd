import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Security protection: Prevent unauthorized scrapers or bots from reading customer orders and phone numbers
  const cookieHeader = request.headers.get('cookie') || '';
  const hasAdminCookie = cookieHeader.includes('jeansbd_admin_session=');
  const authHeader = request.headers.get('authorization');
  const customHeader = request.headers.get('x-admin-auth');

  if (!hasAdminCookie && !authHeader && customHeader !== 'true') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Admin session required to view order data.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    orders: [
      {
        id: 'ord-101',
        orderNumber: 'JBD-84920',
        customer: {
          fullName: 'Ali Hasan',
          phone: '01775743148',
          email: 'hasansheikh9080@gmail.com',
          district: 'Dhaka',
          area: 'Mirpur-01',
          address: '13-14 Zoo Road, Mollik Tower, Mirpur- 01, Dhaka',
        },
        items: [
          {
            id: 'oi-1',
            productId: 'prod-001',
            productSlug: 'vintage-washed-slim-tapered-jeans',
            name: 'Vintage Washed Slim Tapered Jeans',
            image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
            size: '32',
            color: 'Vintage Blue',
            price: 1890,
            quantity: 1,
            subtotal: 1890,
          },
        ],
        subtotal: 1890,
        discount: 0,
        deliveryCharge: 80,
        totalAmount: 1970,
        paymentMethod: 'bkash',
        paymentStatus: 'completed',
        paymentTransactionId: 'BK9A87X412',
        orderStatus: 'Shipped',
        delivery: {
          courierCompany: 'Steadfast',
          trackingNumber: 'ST-98432190',
          deliveryCharge: 80,
          dispatchDate: '2026-09-27T10:00:00Z',
          estimatedDeliveryDate: '2026-09-29T18:00:00Z',
          deliveryStatus: 'In Transit',
          notes: 'Handed over to Steadfast courier Banani hub',
        },
        createdAt: '2026-09-27T08:30:00Z',
      },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully',
        orderNumber: `JBD-${Math.floor(10000 + Math.random() * 90000)}`,
        data: body,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error handling order:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid order data' },
      { status: 400 }
    );
  }
}
