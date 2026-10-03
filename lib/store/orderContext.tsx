'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, OrderDelivery } from '@/types';
import { generateOrderNumber } from '@/lib/utils';

interface OrderContextType {
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => Order;
  getOrderById: (id: string) => Order | undefined;
  getOrderByOrderNumber: (orderNumber: string) => Order | undefined;
  findOrderForTracking: (orderNumber: string, phone: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updateOrderDelivery: (orderId: string, delivery: Partial<OrderDelivery>) => void;
}

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'JBD-84920',
    customer: {
      fullName: 'Tanvir Hossain',
      phone: '01711223344',
      email: 'tanvir@gmail.com',
      district: 'Dhaka',
      area: 'Dhanmondi, Road 27',
      address: 'House 14, Flat 4B, Road 27, Dhanmondi',
    },
    items: [
      {
        id: 'oi-1',
        productId: 'prod-001',
        productSlug: 'vintage-washed-slim-tapered-jeans',
        name: 'Vintage Washed Slim Tapered Jeans',
        image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
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
    statusHistory: [
      { status: 'Pending', timestamp: '2026-09-26T14:30:00Z', note: 'Order placed via bKash' },
      { status: 'Confirmed', timestamp: '2026-09-26T15:00:00Z', note: 'Payment verified successfully' },
      { status: 'Processing', timestamp: '2026-09-26T16:20:00Z', note: 'Quality check and packing completed' },
      { status: 'Ready to Ship', timestamp: '2026-09-27T09:15:00Z', note: 'Assigned to Steadfast Courier' },
      { status: 'Shipped', timestamp: '2026-09-27T10:00:00Z', note: 'Tracking #ST-98432190 generated' },
    ],
    createdAt: '2026-09-26T14:30:00Z',
    updatedAt: '2026-09-27T10:00:00Z',
  },
  {
    id: 'ord-102',
    orderNumber: 'JBD-65123',
    customer: {
      fullName: 'Nusrat Jahan',
      phone: '01899887766',
      district: 'Chattogram',
      area: 'GEC Circle',
      address: 'Plot 5, Nasirabad Housing, GEC',
    },
    items: [
      {
        id: 'oi-2',
        productId: 'prod-005',
        productSlug: 'womens-high-waisted-wide-leg-ocean-blue',
        name: "Women's High-Rise Wide Leg Jeans",
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
        size: '28',
        color: 'Ocean Blue',
        price: 2090,
        quantity: 1,
        subtotal: 2090,
      },
    ],
    subtotal: 2090,
    discount: 200,
    deliveryCharge: 150,
    totalAmount: 2040,
    couponCode: 'DENIM200',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'Confirmed',
    delivery: {
      courierCompany: 'Pathao',
      deliveryCharge: 150,
      deliveryStatus: 'Pending Dispatch',
    },
    statusHistory: [
      { status: 'Pending', timestamp: '2026-09-28T09:00:00Z', note: 'Order placed with Cash on Delivery' },
      { status: 'Confirmed', timestamp: '2026-09-28T09:30:00Z', note: 'Customer confirmed via phone call' },
    ],
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-09-28T09:30:00Z',
  },
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }, [orders, isLoaded]);

  const createOrder = (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>
  ): Order => {
    const newOrderNumber = generateOrderNumber();
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: orderData.orderStatus,
          timestamp: now,
          note: `Order placed via ${orderData.paymentMethod.toUpperCase()}`,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (id: string) => {
    return orders.find((o) => o.id === id);
  };

  const getOrderByOrderNumber = (orderNumber: string) => {
    const clean = orderNumber.trim().toUpperCase();
    return orders.find((o) => o.orderNumber.toUpperCase() === clean);
  };

  const findOrderForTracking = (orderNumber: string, phone: string) => {
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    return orders.find((o) => {
      const matchNum = o.orderNumber.toUpperCase() === cleanNum;
      const orderPhoneClean = o.customer.phone.replace(/[^0-9]/g, '');
      const matchPhone = orderPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhoneClean);
      return matchNum && matchPhone;
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          orderStatus: status,
          updatedAt: now,
          statusHistory: [
            ...o.statusHistory,
            {
              status,
              timestamp: now,
              note: note || `Status updated to ${status}`,
            },
          ],
        };
      })
    );
  };

  const updateOrderDelivery = (orderId: string, delivery: Partial<OrderDelivery>) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          delivery: {
            ...o.delivery,
            ...delivery,
          },
          updatedAt: now,
        };
      })
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        getOrderById,
        getOrderByOrderNumber,
        findOrderForTracking,
        updateOrderStatus,
        updateOrderDelivery,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
