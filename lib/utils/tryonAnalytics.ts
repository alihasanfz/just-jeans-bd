/**
 * Privacy-Conscious Virtual Try-On Telemetry & Analytics
 * Records session events, conversions, and metrics for the Admin Dashboard
 */

import { TryOnSession } from '@/types';
import { idbGet, idbSet } from '@/lib/utils/db';

const STORAGE_KEY = 'jeansbd_tryon_sessions';

export async function getTryOnSessions(): Promise<TryOnSession[]> {
  if (typeof window === 'undefined') return [];

  try {
    const idbData = await idbGet<TryOnSession[]>(STORAGE_KEY);
    if (Array.isArray(idbData) && idbData.length > 0) {
      return idbData;
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (e) {
    console.warn('Failed to load try-on sessions', e);
  }

  return [];
}

export async function recordTryOnSession(session: TryOnSession): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const existing = await getTryOnSessions();
    const updated = [session, ...existing.slice(0, 99)]; // Keep last 100 sessions

    await idbSet(STORAGE_KEY, updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
    } catch (_) {}
  } catch (err) {
    console.warn('Could not record try-on session', err);
  }
}

export async function updateTryOnSession(
  sessionId: string,
  updates: Partial<TryOnSession>
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const existing = await getTryOnSessions();
    const updated = existing.map((s) => (s.id === sessionId ? { ...s, ...updates } : s));

    await idbSet(STORAGE_KEY, updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
    } catch (_) {}
  } catch (err) {
    console.warn('Could not update try-on session', err);
  }
}

export interface TryOnAggregatedMetrics {
  totalSessions: number;
  successfulDetections: number;
  detectionRate: number; // Percentage
  totalCaptures: number;
  addedToCartCount: number;
  boughtNowCount: number;
  conversionRate: number; // Percentage
  recentSessions: TryOnSession[];
}

export async function getTryOnAggregatedMetrics(): Promise<TryOnAggregatedMetrics> {
  const sessions = await getTryOnSessions();

  // If new site / no sessions yet, provide clean baseline
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      successfulDetections: 0,
      detectionRate: 100,
      totalCaptures: 0,
      addedToCartCount: 0,
      boughtNowCount: 0,
      conversionRate: 0,
      recentSessions: [],
    };
  }

  const totalSessions = sessions.length;
  const successfulDetections = sessions.filter((s) => s.bodyDetected).length;
  const detectionRate = totalSessions > 0 ? Math.round((successfulDetections / totalSessions) * 100) : 0;

  const totalCaptures = sessions.reduce((acc, s) => acc + (s.capturedCount || 0), 0);
  const addedToCartCount = sessions.filter((s) => s.addedToCart).length;
  const boughtNowCount = sessions.filter((s) => s.boughtNow).length;
  const totalConversions = sessions.filter((s) => s.addedToCart || s.boughtNow).length;
  const conversionRate = totalSessions > 0 ? Math.round((totalConversions / totalSessions) * 100) : 0;

  return {
    totalSessions,
    successfulDetections,
    detectionRate,
    totalCaptures,
    addedToCartCount,
    boughtNowCount,
    conversionRate,
    recentSessions: sessions.slice(0, 10),
  };
}
