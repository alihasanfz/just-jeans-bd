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
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
}

const INITIAL_DEMO_ORDERS: Order[] = [];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clean out legacy demo orders ord-101, ord-102
          const cleanOrders = parsed.filter(
            (o) =>
              o &&
              o.id !== 'ord-101' &&
              o.id !== 'ord-102' &&
              o.orderNumber !== 'JBD-84920' &&
              o.orderNumber !== 'JBD-65123'
          );
          setOrders(cleanOrders);
          localStorage.setItem('jeansbd_orders', JSON.stringify(cleanOrders));
        }
      } else {
        setOrders([]);
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
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
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
