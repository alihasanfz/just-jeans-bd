import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Order, OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmrtzobqtbrbcqpbvipo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_meaAVvXdPVRF5pGJwi86Zg_IvITFpRn';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to convert database row to standard Order model
function mapDbRowToOrder(row: any): Order {
  const items = Array.isArray(row.items) ? row.items : [];
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: {
      fullName: row.customer_name || 'Valued Customer',
      phone: row.customer_phone || '',
      email: row.customer_email || undefined,
      district: row.district || 'Dhaka',
      area: row.area || row.district || 'Dhaka',
      address: row.delivery_address || '',
      notes: row.notes || undefined,
    },
    items: items.map((it: any) => ({
      id: it.id || `oi-${Math.random().toString(36).substring(2, 7)}`,
      productId: it.productId || it.product_id || '',
      productSlug: it.productSlug || it.product_slug || '',
      name: it.name || it.product_name || 'Premium Denim Item',
      image: it.image || it.thumbnail || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
      size: it.size || it.variant_size || '32',
      color: it.color || it.variant_color || 'Blue',
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      subtotal: Number(it.subtotal || it.total_price || (it.price * it.quantity)) || 0,
    })),
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount_amount) || 0,
    deliveryCharge: Number(row.shipping_fee) || 80,
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: (row.payment_method || 'cod') as any,
    paymentStatus: (row.payment_status || 'pending') as any,
    paymentTransactionId: row.payment_trx_id || undefined,
    orderStatus: (row.order_status ? (row.order_status.charAt(0).toUpperCase() + row.order_status.slice(1)) : 'Pending') as OrderStatus,
    delivery: {
      courierCompany: row.courier_name || (row.district?.toLowerCase().includes('dhaka') ? 'Steadfast Courier' : 'Pathao Express'),
      trackingNumber: row.tracking_number || undefined,
      consignmentId: row.consignment_id || undefined,
      deliveryCharge: Number(row.shipping_fee) || 80,
      deliveryStatus: row.tracking_number ? 'In Transit' : 'Pending Dispatch',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    statusHistory: [
      {
        status: (row.order_status ? (row.order_status.charAt(0).toUpperCase() + row.order_status.slice(1)) : 'Pending') as OrderStatus,
        timestamp: row.created_at,
        note: `Order placed via ${(row.payment_method || 'cod').toUpperCase()}`,
      },
    ],
  };
}

// GET: Fetch all orders from Supabase database
export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const orders = (rows || []).map(mapDbRowToOrder);

    return NextResponse.json(
      { success: true, orders },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('GET /api/orders error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Place & save a new order into Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, subtotal, discount, deliveryCharge, totalAmount, paymentMethod, paymentStatus, paymentTransactionId, orderStatus, delivery } = body;

    if (!customer?.fullName || !customer?.phone || !customer?.address) {
      return NextResponse.json({ success: false, error: 'Customer name, phone, and delivery address are required' }, { status: 400 });
    }

    const orderId = body.id || `ord-${Date.now()}`;
    const orderNumber = body.orderNumber || `JBD-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();

    const dbRow = {
      id: orderId,
      order_number: orderNumber,
      customer_name: customer.fullName.trim(),
      customer_phone: customer.phone.trim(),
      customer_email: customer.email?.trim() || '',
      delivery_address: customer.address.trim(),
      district: customer.district || 'Dhaka',
      area: customer.area || customer.district || 'Dhaka',
      notes: customer.notes || '',
      subtotal: Number(subtotal) || 0,
      shipping_fee: Number(deliveryCharge) || 80,
      discount_amount: Number(discount) || 0,
      total_amount: Number(totalAmount) || 0,
      payment_method: paymentMethod || 'cod',
      payment_status: paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'paid'),
      order_status: (orderStatus || 'pending').toLowerCase(),
      payment_trx_id: paymentTransactionId || '',
      tracking_number: delivery?.trackingNumber || '',
      items: items || [],
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data: inserted, error } = await supabase
      .from('orders')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Error inserting order into Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const order = mapDbRowToOrder(inserted);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update order status or courier delivery
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderStatus, delivery, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const updateFields: any = { updated_at: new Date().toISOString() };
    if (orderStatus) updateFields.order_status = orderStatus.toLowerCase();
    if (paymentStatus) updateFields.payment_status = paymentStatus.toLowerCase();
    if (delivery?.trackingNumber) updateFields.tracking_number = delivery.trackingNumber;

    const { data: updated, error } = await supabase
      .from('orders')
      .update(updateFields)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: mapDbRowToOrder(updated) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete order
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
