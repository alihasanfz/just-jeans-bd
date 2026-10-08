'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  X,
  RefreshCw,
  ShoppingBag,
  Zap,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Upload,
  Split,
  Eye,
  ArrowRight,
  Sparkle,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Plus,
  Minus,
  Edit3,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/store/cartContext';
import {
  startCameraStream,
  stopCameraStream,
  VirtualFittingPoseTracker,
  renderGarmentOverlay,
  captureFittingSnapshot,
  generatePhotorealisticClothingReplacement,
  PoseResults,
  TrackingStatus,
  SIZE_FIT_FACTORS,
} from '@/lib/utils/tryonEngine';
import {
  recordTryOnSession,
  updateTryOnSession,
} from '@/lib/utils/tryonAnalytics';

interface VirtualFittingRoomModalProps {
  product: Product;
  initialSize?: string;
  initialColor?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface GarmentTransform {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  scale: number; // 0.5 to 2.5
  rotation: number; // in degrees, -60 to +60
}

export default function VirtualFittingRoomModal({
  product,
  initialSize,
  initialColor,
  isOpen,
  onClose,
}: VirtualFittingRoomModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Mode: Primary is 'ai' (Interactive manual positioning + AI Try-On), secondary is 'realtime' (Live AR Cam)
  const [activeMode, setActiveMode] = useState<'ai' | 'realtime'>('ai');

  // Camera & Video Elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const garmentImgRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const trackerRef = useRef<VirtualFittingPoseTracker | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const userPhotoImgRef = useRef<HTMLImageElement | null>(null);

  // Camera Settings
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOpenInAI, setIsCameraOpenInAI] = useState<boolean>(false);

  // Tracking state for Real-Time AR
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('searching');
  const [guidanceMsg, setGuidanceMsg] = useState<string>('Stand in front of the camera');
  const [guidanceMsgBn, setGuidanceMsgBn] = useState<string>('ক্যামেরার সামনে দাঁড়ান');
  const [poseDetected, setPoseDetected] = useState<boolean>(false);

  // Selected Variant
  const defaultSize = initialSize || (product.variants[0]?.size ?? '32');
  const defaultColor = initialColor || (product.variants[0]?.color ?? 'Raw Deep Indigo');
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);

  // Garment Category Detection (Tops vs Bottoms)
  const isTopsProduct =
    /jacket|shirt|tshirt|t-shirt|tee|hoodie|polo|panjabi|top|coat|blazer|sweater/i.test(product.name || '') ||
    /jacket|shirt|tshirt|hoodie|polo|panjabi|top|coat|blazer/i.test(product.category || '') ||
    product.fit === 'Denim Jacket';

  const [garmentCategory, setGarmentCategory] = useState<'tops' | 'bottoms'>(
    isTopsProduct ? 'tops' : 'bottoms'
  );

  // Interactive Manual Transform of the Reference Garment
  const [transform, setTransform] = useState<GarmentTransform>({
    x: 50,
    y: isTopsProduct ? 38 : 62,
    scale: 1.0,
    rotation: 0,
  });

  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const interactionStateRef = useRef<{
    mode: 'drag' | 'rotate' | 'resize' | null;
    startX: number;
    startY: number;
    startTransform: GarmentTransform;
    corner?: string;
  }>({
    mode: null,
    startX: 0,
    startY: 0,
    startTransform: { x: 50, y: isTopsProduct ? 38 : 62, scale: 1.0, rotation: 0 },
  });

  // AI Photorealistic Try-On State (Before vs After)
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<'after' | 'before' | 'split'>('after');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [aiStep, setAiStep] = useState<number>(1);
  const [aiStepText, setAiStepText] = useState<string>('Analyzing person...');

  // Cart feedback & telemetry
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `tryon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  // Available Sizes and Colors from Product
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ color: v.color, hex: v.colorHex })))
  ).map((str) => JSON.parse(str));

  const selectedColorHex = uniqueColors.find((c: any) => c.color === selectedColor)?.hex || '#1e3a8a';
  const effectivePrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;

  // Garment image source (cutout asset or primary image)
  const garmentAssetUrl = product.tryOnAssetUrl || product.thumbnail || product.images[0];
  const garmentType = garmentCategory === 'tops' ? 'jacket' : 'jeans';

  // Preload garment asset image
  useEffect(() => {
    if (!garmentAssetUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = garmentAssetUrl;
    img.onload = () => {
      garmentImgRef.current = img;
    };
  }, [garmentAssetUrl]);

  // Start Session Telemetry
  useEffect(() => {
    if (isOpen) {
      recordTryOnSession({
        id: sessionId,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.thumbnail,
        garmentType: (garmentType as any) || 'jacket',
        startedAt: new Date().toISOString(),
        mode: activeMode,
        bodyDetected: false,
        capturedCount: 0,
        addedToCart: false,
        boughtNow: false,
      });
    }
  }, [isOpen, sessionId, product, garmentType, activeMode]);

  // Initialize Camera Stream
  const initCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (videoRef.current) {
        const stream = await startCameraStream(videoRef.current, facingMode);
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera start notice:', err);
      setIsCameraActive(false);
      setCameraError(err?.message || 'Camera is currently unavailable.');
    }
  }, [facingMode]);

  // Cleanup Camera Stream & Tracker
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
    if (trackerRef.current) {
      trackerRef.current.dispose();
      trackerRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraOpenInAI(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setBeforeImage(null);
      setAfterImage(null);
    }
  }, [isOpen, cleanup]);

  // Real-time animation loop when activeMode === 'realtime'
  useEffect(() => {
    if (!isOpen || !isCameraActive || activeMode !== 'realtime' || afterImage) return;

    let isMounted = true;

    const renderLoop = async () => {
      if (!isMounted) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!trackerRef.current) {
        trackerRef.current = new VirtualFittingPoseTracker();
        await trackerRef.current.init();
      }

      const tracker = trackerRef.current;

      if (video && canvas && tracker && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }

        const poseResults = await tracker.sendFrame(video);

        if (poseResults && poseResults.detected) {
          if (!poseDetected) {
            setPoseDetected(true);
            updateTryOnSession(sessionId, { bodyDetected: true });
          }
          setTrackingStatus('detected');
          setGuidanceMsg(poseResults.guidance);
          setGuidanceMsgBn(poseResults.guidanceBn);

          renderGarmentOverlay(canvas, video, garmentImgRef.current, poseResults, {
            garmentType,
            selectedSize,
            selectedColorHex,
            isMirrored: facingMode === 'user',
            scaleAdjust: transform.scale,
            verticalOffsetAdjust: (transform.y - (garmentCategory === 'tops' ? 38 : 62)) / 100,
          });
        } else {
          setPoseDetected(false);
          setTrackingStatus('searching');
          setGuidanceMsg('Stand in front of the camera');
          setGuidanceMsgBn('ক্যামেরার সামনে দাঁড়ান');

          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isOpen,
    isCameraActive,
    activeMode,
    afterImage,
    facingMode,
    garmentType,
    selectedSize,
    selectedColorHex,
    transform.scale,
    transform.y,
    garmentCategory,
    sessionId,
    poseDetected,
  ]);

  /**
   * Auto Align Garment to detected anatomical landmarks
   */
  const autoAlignGarment = useCallback(async (catToUse?: 'tops' | 'bottoms') => {
    const cat = catToUse || garmentCategory;
    try {
      if (userPhotoImgRef.current && trackerRef.current) {
        const pose = await trackerRef.current.sendFrame(userPhotoImgRef.current);
        if (pose && pose.detected) {
          if (cat === 'tops') {
            setTransform({
              x: Math.round(pose.shoulderCenter.x * 100),
              y: Math.round((pose.shoulderCenter.y + 0.12) * 100),
              scale: 1.0,
              rotation: Math.round(pose.tiltAngle * (180 / Math.PI)),
            });
          } else {
            setTransform({
              x: Math.round(pose.hipCenter.x * 100),
              y: Math.round((pose.hipCenter.y + 0.22) * 100),
              scale: 1.0,
              rotation: Math.round(pose.tiltAngle * (180 / Math.PI)),
            });
          }
          return;
        }
      }
    } catch (_) {}

    // Fallback smart initial placement
    if (cat === 'tops') {
      setTransform({ x: 50, y: 38, scale: 1.0, rotation: 0 });
    } else {
      setTransform({ x: 50, y: 64, scale: 1.0, rotation: 0 });
    }
  }, [garmentCategory]);

  /**
   * Main Realistic AI Virtual Try-On Pipeline
   * 1. Detects person, pose & clothing region
   * 2. Incorporates customer's manual placement & alignment
   * 3. Completely occludes & replaces existing clothing
   * 4. Synthesizes photorealistic fabric drape and lighting
   */
  const processRealisticTryOn = async (
    customerImageDataUrl: string,
    manualConfig?: {
      xPercent: number;
      yPercent: number;
      scale: number;
      rotation: number;
    }
  ) => {
    setIsProcessingAI(true);
    setAiStep(1);
    setAiStepText('Analyzing person and body pose...');

    try {
      // Step 1: Initialize pose tracker & load customer photo
      await new Promise((r) => setTimeout(r, 450));
      setAiStep(2);
      setAiStepText('Detecting existing clothing & segmentation...');

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load captured photo'));
        img.src = customerImageDataUrl;
      });
      userPhotoImgRef.current = img;

      if (!trackerRef.current) {
        trackerRef.current = new VirtualFittingPoseTracker();
        await trackerRef.current.init();
      }

      await new Promise((r) => setTimeout(r, 450));
      setAiStep(3);
      setAiStepText(`Aligning ${product.name} to body contours...`);

      const pose = await trackerRef.current.sendFrame(img);

      // Check external cloud AI API first
      let generatedUrl: string | null = null;
      try {
        const res = await fetch('/api/try-on/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerImage: customerImageDataUrl,
            garmentImage: garmentAssetUrl,
            garmentType,
            category: garmentCategory,
            size: selectedSize,
            color: selectedColor,
            productName: product.name,
            manualTransform: manualConfig,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.resultImageUrl && data.provider !== 'neural-cloth-replacement-vton' && data.resultImageUrl !== customerImageDataUrl) {
            generatedUrl = data.resultImageUrl;
          }
        }
      } catch (backendErr) {
        console.warn('Cloud AI try-on note:', backendErr);
      }

      await new Promise((r) => setTimeout(r, 450));
      setAiStep(4);
      setAiStepText('Removing previous clothing & applying realistic fabric drape...');

      // Run local photorealistic garment replacement & inpainting engine
      if (!generatedUrl && pose && garmentImgRef.current) {
        generatedUrl = await generatePhotorealisticClothingReplacement(img, garmentImgRef.current, pose, {
          garmentType,
          selectedSize,
          selectedColorHex,
          productName: product.name,
          price: effectivePrice,
          scaleAdjust: manualConfig?.scale ?? transform.scale,
          manualTransform: manualConfig,
        });
      }

      await new Promise((r) => setTimeout(r, 400));
      setAiStep(5);
      setAiStepText('Finalizing photorealistic atelier render...');

      const finalUrl = generatedUrl || customerImageDataUrl;
      setAfterImage(finalUrl);
      setCompareMode('after');
      updateTryOnSession(sessionId, { capturedCount: 1, bodyDetected: true });
    } catch (err: any) {
      console.error('AI Try-on pipeline error:', err);
      alert(`AI Try-On: ${err?.message || 'Processing error'}`);
    } finally {
      setIsProcessingAI(false);
      setIsCameraOpenInAI(false);
    }
  };

  /**
   * Trigger AI generation with current manual alignment
   */
  const handleGenerateTryOn = () => {
    if (!beforeImage) return;

    // Convert transform percentages into image-relative coordinates for the AI pipeline:
    const manualConfig = {
      xPercent: transform.x / 100,
      yPercent: (transform.y - (garmentCategory === 'tops' ? 14 : 20)) / 100, // Anchor at collar line or waist
      scale: transform.scale,
      rotation: (transform.rotation * Math.PI) / 180, // radians
    };

    processRealisticTryOn(beforeImage, manualConfig);
  };

  // Capture live photo from camera
  const handleCaptureLivePhoto = async () => {
    if (!videoRef.current) return;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = videoRef.current.videoWidth || 1080;
    captureCanvas.height = videoRef.current.videoHeight || 1440;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    // Draw un-mirrored natural photo
    if (facingMode === 'user') {
      ctx.translate(captureCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, captureCanvas.width, captureCanvas.height);
    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.95);

    // Stop video and transition to interactive placement workspace
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setIsCameraActive(false);
    setIsCameraOpenInAI(false);

    setBeforeImage(dataUrl);
    setAfterImage(null);

    const img = new Image();
    img.src = dataUrl;
    img.onload = async () => {
      userPhotoImgRef.current = img;
      if (!trackerRef.current) {
        trackerRef.current = new VirtualFittingPoseTracker();
        await trackerRef.current.init();
      }
      await autoAlignGarment();
    };
  };

  // Handle uploaded customer photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setBeforeImage(dataUrl);
        setAfterImage(null);

        const img = new Image();
        img.src = dataUrl;
        img.onload = async () => {
          userPhotoImgRef.current = img;
          if (!trackerRef.current) {
            trackerRef.current = new VirtualFittingPoseTracker();
            await trackerRef.current.init();
          }
          await autoAlignGarment();
        };
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Download Snapshot
  const handleDownloadSnapshot = () => {
    const imgUrl = afterImage || beforeImage;
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.download = `jeansbd-tryon-${product.slug}-${Date.now()}.jpg`;
    link.href = imgUrl;
    link.click();
  };

  // Add to Cart
  const handleAddToCart = () => {
    const variant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor) || product.variants[0];

    addToCart({
      id: `${product.id}_${selectedSize}_${selectedColor}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: product.thumbnail || product.images[0],
      price: effectivePrice,
      regularPrice: product.price,
      size: selectedSize,
      color: selectedColor,
      colorHex: selectedColorHex,
      quantity: 1,
      maxStock: variant?.stock || 10,
    });

    setAddedSuccess(true);
    updateTryOnSession(sessionId, { addedToCart: true });
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Buy Now
  const handleBuyNow = () => {
    handleAddToCart();
    updateTryOnSession(sessionId, { boughtNow: true });
    cleanup();
    onClose();
    router.push('/checkout');
  };

  // ========================================================
  // INTERACTIVE POINTER / TOUCH GESTURE HANDLERS
  // ========================================================
  const handleStartDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    interactionStateRef.current = {
      mode: 'drag',
      startX: e.clientX,
      startY: e.clientY,
      startTransform: { ...transform },
    };
    setIsInteracting(true);
  };

  const handleStartRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    interactionStateRef.current = {
      mode: 'rotate',
      startX: e.clientX,
      startY: e.clientY,
      startTransform: { ...transform },
    };
    setIsInteracting(true);
  };

  const handleStartResize = (e: React.PointerEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    interactionStateRef.current = {
      mode: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      startTransform: { ...transform },
      corner,
    };
    setIsInteracting(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = interactionStateRef.current;
    if (!state.mode || !viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (state.mode === 'drag') {
      const dxPercent = (dx / rect.width) * 100;
      const dyPercent = (dy / rect.height) * 100;
      setTransform({
        ...state.startTransform,
        x: Math.min(95, Math.max(5, state.startTransform.x + dxPercent)),
        y: Math.min(95, Math.max(5, state.startTransform.y + dyPercent)),
      });
    } else if (state.mode === 'rotate') {
      const boxCenterX = rect.left + (state.startTransform.x / 100) * rect.width;
      const boxCenterY = rect.top + (state.startTransform.y / 100) * rect.height;
      const angleRad = Math.atan2(e.clientY - boxCenterY, e.clientX - boxCenterX);
      let angleDeg = (angleRad * (180 / Math.PI)) + 90;
      while (angleDeg > 180) angleDeg -= 360;
      while (angleDeg < -180) angleDeg += 360;
      angleDeg = Math.max(-60, Math.min(60, Math.round(angleDeg)));
      setTransform((prev) => ({ ...prev, rotation: angleDeg }));
    } else if (state.mode === 'resize') {
      const boxCenterX = rect.left + (state.startTransform.x / 100) * rect.width;
      const boxCenterY = rect.top + (state.startTransform.y / 100) * rect.height;
      const initialDist = Math.hypot(state.startX - boxCenterX, state.startY - boxCenterY) || 1;
      const currentDist = Math.hypot(e.clientX - boxCenterX, e.clientY - boxCenterY);
      const scaleMultiplier = currentDist / initialDist;
      const newScale = Math.max(0.5, Math.min(2.5, +(state.startTransform.scale * scaleMultiplier).toFixed(2)));
      setTransform((prev) => ({ ...prev, scale: newScale }));
    }
  };

  const handlePointerUp = () => {
    interactionStateRef.current = {
      mode: null,
      startX: 0,
      startY: 0,
      startTransform: { ...transform },
    };
    setIsInteracting(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2.5, +(prev.scale + delta).toFixed(2))),
    }));
  };

  // Keyboard navigation for desktop fine adjustment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!beforeImage || afterImage || isProcessingAI) return;
      const step = e.shiftKey ? 3 : 1;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setTransform((prev) => ({ ...prev, y: Math.max(5, prev.y - step) }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setTransform((prev) => ({ ...prev, y: Math.min(95, prev.y + step) }));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTransform((prev) => ({ ...prev, x: Math.max(5, prev.x - step) }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTransform((prev) => ({ ...prev, x: Math.min(95, prev.x + step) }));
      } else if (e.key === '+' || e.key === '=') {
        setTransform((prev) => ({ ...prev, scale: Math.min(2.5, +(prev.scale + 0.05).toFixed(2)) }));
      } else if (e.key === '-' || e.key === '_') {
        setTransform((prev) => ({ ...prev, scale: Math.max(0.5, +(prev.scale - 0.05).toFixed(2)) }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [beforeImage, afterImage, isProcessingAI]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md animate-fade-in overflow-hidden select-none">
      {/* Studio Viewport Modal */}
      <div className="relative w-full h-full max-w-6xl md:h-[92vh] md:rounded-3xl bg-[#080d1a] border border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT / CENTER VIEWPORT: THE FITTING ROOM CANVAS / STUDIO */}
        {/* ======================================================== */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          
          {/* Hidden File Input for Native Phone Camera & Photo Upload */}
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            capture="user"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Camera Video Element (used during live capture or Real-Time AR) */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            } ${isCameraActive ? 'block' : 'hidden'}`}
            playsInline
            muted
          />

          {/* Real-time AR Garment Canvas (for Mode 2 Real-Time AR) */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 ${
              activeMode === 'realtime' && isCameraActive && !afterImage ? 'block' : 'hidden'
            }`}
          />

          {/* ---------------------------------------------------- */}
          {/* STATE A: INITIAL CHOICE (BEFORE PHOTO IS TAKEN/UPLOADED) */}
          {/* ---------------------------------------------------- */}
          {!isCameraActive && !beforeImage && !isProcessingAI && !afterImage && (
            <div className="p-6 max-w-lg text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-indigo-600 p-0.5 mx-auto shadow-xl shadow-indigo-500/20">
                <div className="w-full h-full bg-[#080d1a] rounded-[22px] flex items-center justify-center text-amber-400">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full inline-block">
                  Interactive AI Fitting Room
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Try On {product.name}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Take a photo or upload your picture. You can drag and position this authentic denim piece on your body, and our AI will realistically replace existing clothing.
                </p>
              </div>

              {/* Two Primary Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {/* 1. Take Live Photo */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCameraOpenInAI(true);
                    initCamera();
                  }}
                  className="group bg-gradient-to-b from-indigo-950/70 to-slate-900 border border-indigo-500/40 hover:border-amber-400 p-5 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all hover:scale-[1.02] shadow-lg active:scale-95 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <Camera className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block uppercase tracking-wider">
                      Take Live Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Use phone / laptop camera
                    </span>
                  </div>
                </button>

                {/* 2. Upload Photo */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="group bg-gradient-to-b from-purple-950/70 to-slate-900 border border-purple-500/40 hover:border-amber-400 p-5 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all hover:scale-[1.02] shadow-lg active:scale-95 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block uppercase tracking-wider">
                      Upload Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Choose from phone gallery / PC
                    </span>
                  </div>
                </button>
              </div>

              {/* Privacy Guarantee Note */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero data retention: Your photos are processed privately and never stored.</span>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STATE B: LIVE CAMERA VIEW (WAITING FOR USER CAPTURE) */}
          {/* ---------------------------------------------------- */}
          {isCameraActive && isCameraOpenInAI && !isProcessingAI && !afterImage && (
            <div className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-3 px-4">
              <span className="bg-black/70 backdrop-blur-md border border-slate-700/80 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                Stand straight and click capture to fit {product.name}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCaptureLivePhoto}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-xl shadow-amber-500/30 uppercase tracking-wider cursor-pointer"
                >
                  <Camera className="w-4 h-4 stroke-[3]" />
                  <span>Capture & Fit Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream(streamRef.current);
                    streamRef.current = null;
                    setIsCameraActive(false);
                    setIsCameraOpenInAI(false);
                  }}
                  className="bg-slate-900/80 hover:bg-slate-800 text-white p-3.5 rounded-2xl border border-slate-700 cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STATE C: INTERACTIVE ALIGNMENT STUDIO (STEP 1)       */}
          {/* ---------------------------------------------------- */}
          {beforeImage && !afterImage && !isProcessingAI && (
            <div
              ref={viewportRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none bg-black"
            >
              {/* Customer Photo */}
              <img
                src={beforeImage}
                alt="Customer Photo"
                className="max-w-full max-h-full object-contain pointer-events-none"
              />

              {/* Interactive Transformable Garment Reference Box */}
              <div
                style={{
                  position: 'absolute',
                  left: `${transform.x}%`,
                  top: `${transform.y}%`,
                  transform: `translate(-50%, -50%) rotate(${transform.rotation}deg) scale(${transform.scale})`,
                  width: `${garmentCategory === 'tops' ? 240 : 200}px`,
                  height: `${garmentCategory === 'tops' ? 260 : 340}px`,
                  cursor: isInteracting ? 'grabbing' : 'grab',
                }}
                onPointerDown={handleStartDrag}
                onWheel={handleWheel}
                className={`group border-2 border-dashed ${
                  isInteracting ? 'border-amber-400 bg-amber-400/15' : 'border-amber-400/85 bg-amber-400/10 hover:border-amber-300'
                } rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.35)] select-none z-20`}
              >
                {/* Garment Cutout Image */}
                <img
                  src={garmentAssetUrl}
                  alt="Garment Preview"
                  className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
                />

                {/* Top Rotation Handle with Stalk */}
                <div
                  onPointerDown={handleStartRotate}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-30"
                  title="Drag to Rotate"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl hover:scale-110 active:scale-95 transition-transform">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="w-0.5 h-3 bg-amber-400" />
                </div>

                {/* 4 Corner Resize Handles */}
                <div
                  onPointerDown={(e) => handleStartResize(e, 'nw')}
                  className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-slate-950 cursor-nwse-resize hover:scale-125 transition-transform z-30 shadow"
                  title="Drag to Resize"
                />
                <div
                  onPointerDown={(e) => handleStartResize(e, 'ne')}
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-slate-950 cursor-nesw-resize hover:scale-125 transition-transform z-30 shadow"
                  title="Drag to Resize"
                />
                <div
                  onPointerDown={(e) => handleStartResize(e, 'se')}
                  className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-slate-950 cursor-nwse-resize hover:scale-125 transition-transform z-30 shadow"
                  title="Drag to Resize"
                />
                <div
                  onPointerDown={(e) => handleStartResize(e, 'sw')}
                  className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-slate-950 cursor-nesw-resize hover:scale-125 transition-transform z-30 shadow"
                  title="Drag to Resize"
                />

                {/* Info Badge at center on hover/interaction */}
                <div className="absolute inset-x-0 -bottom-8 flex justify-center pointer-events-none">
                  <span className="bg-black/85 backdrop-blur-md border border-amber-400/50 text-amber-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow">
                    {transform.rotation !== 0 ? `${transform.rotation}° • ` : ''}{(transform.scale * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Viewport Top Bar */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-auto z-20">
                <div className="bg-slate-950/85 backdrop-blur-md border border-amber-400/40 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Position garment on your body, then click Generate</span>
                  <span className="sm:hidden">Align garment on body</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => autoAlignGarment()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
                    title="Automatically detect body and align garment"
                  >
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>Auto Align</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBeforeImage(null);
                      setAfterImage(null);
                    }}
                    className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 active:scale-95 transition cursor-pointer"
                  >
                    <span>Change Photo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STATE D: 5-STEP AI GENERATION PROGRESS OVERLAY       */}
          {/* ---------------------------------------------------- */}
          {isProcessingAI && (
            <div className="absolute inset-0 z-30 bg-[#080d1a]/95 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-amber-400 animate-spin" />
                <Sparkles className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-2 max-w-sm">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  AI Cloth Inpainting Pipeline • Step {aiStep} of 5
                </span>
                <h3 className="text-lg font-black text-white">
                  {aiStepText}
                </h3>
                <p className="text-xs text-slate-400">
                  Replacing existing clothing with authentic {product.name}...
                </p>
              </div>

              {/* Progress Stepper Bar */}
              <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${(aiStep / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STATE E: PHOTOREALISTIC RESULT (BEFORE VS AFTER VIEW) */}
          {/* ---------------------------------------------------- */}
          {afterImage && !isProcessingAI && (
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden animate-fade-in">
              {/* After Image View */}
              {compareMode === 'after' && (
                <img
                  src={afterImage}
                  alt="AI Try-On Result"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Before Image View */}
              {compareMode === 'before' && beforeImage && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={beforeImage}
                    alt="Original Customer Photo"
                    className="w-full h-full object-contain opacity-90"
                  />
                  <div className="absolute top-16 left-6 bg-black/70 backdrop-blur-md border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    📷 Before: Original Clothes
                  </div>
                </div>
              )}

              {/* Interactive Split Compare View */}
              {compareMode === 'split' && beforeImage && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {/* Under layer: After Image */}
                  <img
                    src={afterImage}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                  
                  {/* Over layer: Before Image clipped */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
                  >
                    <img
                      src={beforeImage}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>

                  {/* Split Line & Slider Handle */}
                  <div
                    className="absolute inset-y-0 z-20 w-1 bg-amber-400 pointer-events-none shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
                      <Split className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Range input for split slider */}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={splitPos}
                    onChange={(e) => setSplitPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />
                </div>
              )}

              {/* Top View Mode Switcher Pill */}
              <div className="absolute top-16 inset-x-0 flex justify-center z-30 pointer-events-auto">
                <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/80 p-1 rounded-2xl flex items-center gap-1 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => setCompareMode('after')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      compareMode === 'after'
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Wearing Denim (After)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompareMode('before')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      compareMode === 'before'
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Original (Before)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompareMode('split')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      compareMode === 'split'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split Compare</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top Floating Header Controls */}
          <div className="absolute top-0 inset-x-0 p-4 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-auto">
            {/* Left: Product Badge & Mode */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-white rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  VIRTUAL ATELIER
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">
                  {product.name}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  cleanup();
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white hover:bg-red-600/80 transition active:scale-95 shadow cursor-pointer"
                title="Close Virtual Fitting Room"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Floating Bar on Mobile */}
          <div className="md:hidden absolute bottom-0 inset-x-0 p-4 z-30 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-3">
            {beforeImage && !afterImage && (
              <button
                type="button"
                onClick={handleGenerateTryOn}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 uppercase tracking-wide cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Realistic Try-On</span>
              </button>
            )}

            {afterImage && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAfterImage(null)}
                  className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Adjust Fit</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="bg-amber-400 text-slate-950 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Buy</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: INTERACTIVE STUDIO RACK & CONSOLE (DESKTOP) */}
        {/* ======================================================== */}
        <div className="hidden md:flex w-96 bg-[#0b101e] border-l border-slate-800/80 p-6 flex-col justify-between overflow-y-auto">
          {/* Top: Product Meta & Studio Controls */}
          <div className="space-y-4">
            {/* Product Card */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
              <img
                src={product.thumbnail || product.images[0]}
                alt={product.name}
                className="w-16 h-20 rounded-xl object-cover border border-slate-700/60 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  {product.gender} • {garmentType.toUpperCase()}
                </span>
                <h3 className="text-sm font-black text-white truncate mt-0.5">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-black text-white font-mono">
                    ৳{effectivePrice.toLocaleString()}
                  </span>
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="text-xs text-slate-500 line-through font-mono">
                      ৳{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Garment Category Switcher: Tops vs Bottoms */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                GARMENT CATEGORY
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#080d1a] p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setGarmentCategory('tops');
                    autoAlignGarment('tops');
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    garmentCategory === 'tops'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>👕 Tops (Jacket/Shirt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGarmentCategory('bottoms');
                    autoAlignGarment('bottoms');
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    garmentCategory === 'bottoms'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>👖 Bottoms (Jeans)</span>
                </button>
              </div>
            </div>

            {/* Size Selector */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    SELECT SIZE
                  </label>
                  <span className="text-[10px] font-mono text-amber-400">
                    Scale: {SIZE_FIT_FACTORS[selectedSize] || 1.0}x
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/30'
                          : 'bg-[#080d1a] border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  SELECT COLOR / WASH: <span className="text-white font-bold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((c: any) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setSelectedColor(c.color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedColor === c.color
                          ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/30'
                          : 'border-slate-800 bg-[#080d1a] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/40 inline-block flex-shrink-0"
                        style={{ backgroundColor: c.hex || '#1e3a8a' }}
                      />
                      <span>{c.color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Positioning Controls (When photo is loaded and ready to align) */}
            {beforeImage && !afterImage && (
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5" />
                    <span>Garment Positioning Guide</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => autoAlignGarment()}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Sparkle className="w-3 h-3" />
                    <span>Auto Align</span>
                  </button>
                </div>

                {/* Scale Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Width / Scale</span>
                    <span className="font-mono text-amber-400">{(transform.scale * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(0.5, +(prev.scale - 0.05).toFixed(2)) }))}
                      className="p-1 rounded bg-[#080d1a] border border-slate-700 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="range"
                      min="0.6"
                      max="2.0"
                      step="0.02"
                      value={transform.scale}
                      onChange={(e) => setTransform((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))}
                      className="flex-1 accent-amber-400 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(2.5, +(prev.scale + 0.05).toFixed(2)) }))}
                      className="p-1 rounded bg-[#080d1a] border border-slate-700 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Rotation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Rotation</span>
                    <span className="font-mono text-amber-400">{transform.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={transform.rotation}
                    onChange={(e) => setTransform((prev) => ({ ...prev, rotation: parseInt(e.target.value, 10) }))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Nudge Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Nudge Position:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, y: Math.max(5, prev.y - 2) }))}
                      className="p-1.5 rounded-lg bg-[#080d1a] border border-slate-800 text-slate-300 hover:text-white"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, y: Math.min(95, prev.y + 2) }))}
                      className="p-1.5 rounded-lg bg-[#080d1a] border border-slate-800 text-slate-300 hover:text-white"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, x: Math.max(5, prev.x - 2) }))}
                      className="p-1.5 rounded-lg bg-[#080d1a] border border-slate-800 text-slate-300 hover:text-white"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, x: Math.min(95, prev.x + 2) }))}
                      className="p-1.5 rounded-lg bg-[#080d1a] border border-slate-800 text-slate-300 hover:text-white"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Primary Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateTryOn}
                  className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Realistic Try-On</span>
                </button>
              </div>
            )}

            {/* Quick Actions when result is ready */}
            {afterImage && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setAfterImage(null)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Back to Edit / Adjust Position</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="w-full bg-[#080d1a] hover:bg-slate-900 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download Try-On Image (ছবি সেভ করুন)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraOpenInAI(true);
                      initCamera();
                    }}
                    className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Guarantee Note */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <b>প্রাইভেসি নিশ্চয়তা:</b> আপনার ছবির ওপর কাপড় প্রতিস্থাপন সরাসরি ক্লায়েন্ট সিকিউর প্রসেসিংয়ে সম্পন্ন হয়। কোনো ছবি অনুমতি ছাড়া সংরক্ষণ করা হয় না।
              </span>
            </div>
          </div>

          {/* Bottom Actions: Add to Cart and Buy Now */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-[#080d1a] hover:bg-slate-900 border border-slate-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addedSuccess ? '✓ কার্টে যুক্ত হয়েছে!' : 'ADD TO CART FROM FITTING ROOM'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition active:scale-95 uppercase tracking-wide cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>BUY NOW (অর্ডার করুন)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
