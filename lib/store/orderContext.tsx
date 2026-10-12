'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch orders from Supabase via /api/orders
  const fetchOrdersFromApi = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          localStorage.setItem('jeansbd_orders', JSON.stringify(data.orders));
          return;
        }
      }
    } catch {
      // ignore
    }

    // Fallback to local storage if API is unreachable
    try {
      const saved = localStorage.getItem('jeansbd_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch {}
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrdersFromApi().finally(() => setIsLoaded(true));
  }, [fetchOrdersFromApi]);

  // Real-time polling every 6 seconds so orders placed on phone immediately show up on PC
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrdersFromApi();
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchOrdersFromApi]);

  // Keep localStorage updated
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders locally', e);
    }
  }, [orders, isLoaded]);

  // Create Order: Saves locally AND syncs to Supabase
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

    // Update local state immediately for instant UI response
    setOrders((prev) => [newOrder, ...prev]);

    // Send to Supabase via /api/orders in background
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((err) => {
      console.error('Failed to save order to Supabase:', err);
    });

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
            ...(o.statusHistory || []),
            {
              status,
              timestamp: now,
              note: note || `Status updated to ${status}`,
            },
          ],
        };
      })
    );

    // Sync to Supabase
    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, orderStatus: status }),
    }).catch(() => {});
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

    // Sync to Supabase
    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, delivery }),
    }).catch(() => {});
  };

  const updateOrder = (orderId: string, orderData: Partial<Order>) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          ...orderData,
          customer: orderData.customer ? { ...o.customer, ...orderData.customer } : o.customer,
          delivery: orderData.delivery ? { ...o.delivery, ...orderData.delivery } : o.delivery,
          updatedAt: now,
        };
      })
    );

    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...orderData }),
    }).catch(() => {});
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    }).catch(() => {});
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
        updateOrder,
        deleteOrder,
        refreshOrders: fetchOrdersFromApi,
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
