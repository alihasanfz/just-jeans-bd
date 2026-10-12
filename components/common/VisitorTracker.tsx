'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function generateSessionId(): string {
  const hexPart = Math.random().toString(16).substring(2, 16);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `vis_${hexPart}.${suffix}`;
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Avoid tracking in admin pages if preferred or track everything
    if (typeof window === 'undefined') return;

    // Retrieve or create persistent session id for this browser tab
    let sessionId = sessionStorage.getItem('jb_visitor_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('jb_visitor_session_id', sessionId);
    }

    // Skip duplicate tracking of exact same path on re-render
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Non-blocking ping to record visit
    try {
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          path: pathname,
          title: typeof document !== 'undefined' ? document.title : pathname,
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        }),
      }).catch(() => {});
    } catch (e) {
      // Ignore network ping errors
    }
  }, [pathname]);

  return null;
}
