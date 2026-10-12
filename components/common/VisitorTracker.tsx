'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function generateSessionId(): string {
  const hexPart = Math.random().toString(16).substring(2, 16);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `vis_${hexPart}.${suffix}`;
}

// Sophisticated Device & OS detection
function detectClientHardware() {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent || '';
  let device = 'Desktop';
  let deviceModel = 'Windows PC';
  let os = 'Windows 11';
  let browser = 'Chrome';

  // Device & OS detection
  if (/iPad|tablet/i.test(ua)) {
    device = 'Tablet';
    deviceModel = 'Apple iPad';
    os = 'iPadOS';
  } else if (/iPhone/i.test(ua)) {
    device = 'Mobile';
    // Attempt approximate iPhone model via screen height
    const h = Math.max(window.screen.height, window.screen.width);
    if (h >= 932) deviceModel = 'iPhone 15 Pro Max / 16';
    else if (h >= 852) deviceModel = 'iPhone 15 / 14 Pro';
    else if (h >= 844) deviceModel = 'iPhone 14 / 13 / 12';
    else if (h >= 812) deviceModel = 'iPhone X / XS / 11 Pro';
    else deviceModel = 'Apple iPhone';
    os = 'iOS ' + ((ua.match(/OS (\d+_\d+)/) || [])[1]?.replace('_', '.') || '17');
  } else if (/Android/i.test(ua)) {
    device = 'Mobile';
    os = 'Android ' + ((ua.match(/Android\s([0-9\.]+)/) || [])[1] || '14');
    if (/SM-|Samsung/i.test(ua)) deviceModel = 'Samsung Galaxy ' + ((ua.match(/SM-([A-Z0-9]+)/i) || [])[1] || 'Phone');
    else if (/Pixel/i.test(ua)) deviceModel = 'Google Pixel';
    else if (/Redmi|POCO|Xiaomi/i.test(ua)) deviceModel = 'Xiaomi Redmi';
    else if (/Vivo/i.test(ua)) deviceModel = 'Vivo Smartphone';
    else if (/OPPO/i.test(ua)) deviceModel = 'Oppo Smartphone';
    else if (/OnePlus/i.test(ua)) deviceModel = 'OnePlus Device';
    else deviceModel = 'Android Smartphone';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    device = 'Desktop';
    deviceModel = 'Apple Mac / MacBook';
    os = 'macOS ' + ((ua.match(/Mac OS X (\d+[_\.]\d+)/) || [])[1]?.replace('_', '.') || 'Sonoma');
  } else if (/Windows NT/i.test(ua)) {
    device = 'Desktop';
    deviceModel = 'Windows PC / Laptop';
    if (/Windows NT 10.0/i.test(ua)) os = 'Windows 11 / 10';
    else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
    else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
    else os = 'Windows';
  } else if (/Linux/i.test(ua)) {
    device = 'Desktop';
    deviceModel = 'Linux Workstation';
    os = 'Linux';
  }

  // Browser detection
  if (/Edg\//i.test(ua)) browser = 'Edge ' + ((ua.match(/Edg\/(\d+)/) || [])[1] || '');
  else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome ' + ((ua.match(/Chrome\/(\d+)/) || [])[1] || '');
  else if (/Firefox\//i.test(ua)) browser = 'Firefox ' + ((ua.match(/Firefox\/(\d+)/) || [])[1] || '');
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari ' + ((ua.match(/Version\/(\d+)/) || [])[1] || '');
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // Screen resolution
  const screenResolution = `${window.screen.width} × ${window.screen.height}`;
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const language = navigator.language || 'en-US';
  const connectionType = (navigator as any).connection?.effectiveType
    ? (navigator as any).connection.effectiveType.toUpperCase()
    : '4G / WiFi';

  // Bot detection signals
  const isWebdriver = Boolean((navigator as any).webdriver);
  const isHeadless = /HeadlessChrome|bot|crawler|spider|wget|python|curl/i.test(ua);

  return {
    device,
    deviceModel,
    os,
    browser,
    screenResolution,
    touchSupport,
    language,
    connectionType,
    isWebdriver,
    isHeadless,
  };
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>('');
  const hasInteractedRef = useRef<boolean>(false);
  const maxScrollRef = useRef<number>(0);

  // Listen for human interactions (scroll, click, touch, mouse movement)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onUserInteraction = () => {
      hasInteractedRef.current = true;
    };

    const onScroll = () => {
      hasInteractedRef.current = true;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.round((scrollY / docHeight) * 100));
        if (pct > maxScrollRef.current) maxScrollRef.current = pct;
      }
    };

    window.addEventListener('mousemove', onUserInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', onUserInteraction, { passive: true, once: true });
    window.addEventListener('keydown', onUserInteraction, { passive: true, once: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Send pageview on route change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Retrieve or create persistent session id for this browser tab
    let sessionId = sessionStorage.getItem('jb_visitor_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('jb_visitor_session_id', sessionId);
    }

    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Detect hardware & environment
    const hardware = detectClientHardware();

    // Determine shopping intent from route
    let shoppingIntent = 'Viewing Home';
    if (pathname.startsWith('/checkout') || pathname.startsWith('/cart')) {
      shoppingIntent = 'Cart & Checkout';
    } else if (pathname.startsWith('/product/')) {
      shoppingIntent = 'Examining Product';
    } else if (pathname.startsWith('/shop') || pathname.startsWith('/categories')) {
      shoppingIntent = 'Browsing Catalog';
    }

    // Ping tracking API
    try {
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          path: pathname,
          title: typeof document !== 'undefined' ? document.title : pathname,
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          hardware,
          shoppingIntent,
          hasInteracted: hasInteractedRef.current,
          scrollDepth: maxScrollRef.current,
        }),
      }).catch(() => {});
    } catch {
      // non-blocking
    }
  }, [pathname]);

  return null;
}
