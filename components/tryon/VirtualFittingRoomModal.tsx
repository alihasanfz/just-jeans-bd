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
  Maximize2,
  Minimize2,
  Eye,
  Loader2,
  Info,
  Upload,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/store/cartContext';
import {
  startCameraStream,
  stopCameraStream,
  VirtualFittingPoseTracker,
  renderGarmentOverlay,
  captureFittingSnapshot,
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

export default function VirtualFittingRoomModal({
  product,
  initialSize,
  initialColor,
  isOpen,
  onClose,
}: VirtualFittingRoomModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Mode: Real-time AR Camera vs AI Photo Try-On
  const [activeMode, setActiveMode] = useState<'realtime' | 'ai'>('realtime');

  // Camera & Video Elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const garmentImgRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const trackerRef = useRef<VirtualFittingPoseTracker | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const userUploadedImgRef = useRef<HTMLImageElement | null>(null);

  // Camera Settings
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);

  // Tracking state
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('searching');
  const [guidanceMsg, setGuidanceMsg] = useState<string>('Stand in front of the camera');
  const [guidanceMsgBn, setGuidanceMsgBn] = useState<string>('ক্যামেরার সামনে দাঁড়ান');
  const [poseDetected, setPoseDetected] = useState<boolean>(false);

  // Selected Variant & Fit Tuning
  const defaultSize = initialSize || (product.variants[0]?.size ?? '32');
  const defaultColor = initialColor || (product.variants[0]?.color ?? 'Raw Deep Indigo');
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [scaleAdjust, setScaleAdjust] = useState<number>(1.0);
  const [verticalOffsetAdjust, setVerticalOffsetAdjust] = useState<number>(0);
  const [showTuning, setShowTuning] = useState<boolean>(false);

  // Captured snapshot
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Cart feedback
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
  const garmentType = product.garmentType || (product.fit === 'Denim Jacket' ? 'jacket' : 'jeans');

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

  // Initialize Camera & Pose Tracker when modal opens
  const initSession = useCallback(async () => {
    if (!isOpen) return;

    setCameraError(null);
    setIsLoadingModel(false);
    setTrackingStatus('initializing');

    try {
      // 1. Immediately request camera stream FIRST so user gets live video without waiting
      if (videoRef.current) {
        const stream = await startCameraStream(videoRef.current, facingMode);
        streamRef.current = stream;
        setIsCameraActive(true);
        setTrackingStatus('searching');
      }

      // 2. Initialize tracker in parallel (non-blocking)
      if (!trackerRef.current) {
        trackerRef.current = new VirtualFittingPoseTracker();
      }
      trackerRef.current
        .init()
        .then(() => {
          setIsLoadingModel(false);
        })
        .catch((e) => {
          console.warn('Tracker init notice:', e);
          setIsLoadingModel(false);
        });
    } catch (err: any) {
      console.error('Camera/Tracker init error:', err);
      setIsLoadingModel(false);
      setIsCameraActive(false);
      setCameraError(err?.message || 'Camera permission denied or camera unavailable.');
      setTrackingStatus('error');
    }
  }, [isOpen, facingMode]);

  useEffect(() => {
    if (isOpen) {
      initSession();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, initSession]);

  // Cleanup Camera Stream & Tracker
  const cleanup = () => {
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
    setCapturedImage(null);
  };

  // Main Real-time Animation Loop (60 FPS)
  useEffect(() => {
    if (!isOpen || !isCameraActive || activeMode !== 'realtime' || capturedImage) return;

    let isMounted = true;

    const renderLoop = async () => {
      if (!isMounted) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const tracker = trackerRef.current;

      if (video && canvas && tracker && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }

        // Get AI body landmarks
        const poseResults: PoseResults | null = await tracker.sendFrame(video);

        if (poseResults && poseResults.detected) {
          if (!poseDetected) {
            setPoseDetected(true);
            updateTryOnSession(sessionId, { bodyDetected: true });
          }
          setTrackingStatus('detected');
          setGuidanceMsg(poseResults.guidance);
          setGuidanceMsgBn(poseResults.guidanceBn);

          // Render Garment overlay
          renderGarmentOverlay(canvas, video, garmentImgRef.current, poseResults, {
            garmentType,
            selectedSize,
            selectedColorHex,
            isMirrored: facingMode === 'user',
            scaleAdjust,
            verticalOffsetAdjust,
          });
        } else {
          setPoseDetected(false);
          setTrackingStatus('searching');
          setGuidanceMsg('Stand in front of the camera');
          setGuidanceMsgBn('ক্যামেরার সামনে দাঁড়ান');

          // Clear canvas when no pose detected
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
        animationFrameRef.current = null;
      }
    };
  }, [
    isOpen,
    isCameraActive,
    activeMode,
    capturedImage,
    garmentType,
    selectedSize,
    selectedColorHex,
    facingMode,
    scaleAdjust,
    verticalOffsetAdjust,
    poseDetected,
    sessionId,
  ]);

  // Flip Camera Front / Back
  const handleToggleCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
    }
    if (videoRef.current) {
      try {
        const stream = await startCameraStream(videoRef.current, nextMode);
        streamRef.current = stream;
      } catch (e: any) {
        setCameraError(e?.message || 'Could not switch camera');
      }
    }
  };

  // Capture Snapshot
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const snapshot = captureFittingSnapshot(videoRef.current, canvasRef.current, {
      name: product.name,
      price: effectivePrice,
      brand: 'Just Jeans BD',
    });

    if (snapshot) {
      setCapturedImage(snapshot);
      updateTryOnSession(sessionId, { capturedCount: 1 });
    }
  };

  // Download Snapshot
  const handleDownloadSnapshot = () => {
    if (!capturedImage) return;
    const link = document.createElement('a');
    link.download = `jeansbd-tryon-${product.slug}-${Date.now()}.jpg`;
    link.href = capturedImage;
    link.click();
  };

  // Handle customer photo upload or native mobile camera capture
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = async () => {
        userUploadedImgRef.current = img;
        setCameraError(null);
        setIsCameraActive(true);

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth || 1080;
          canvas.height = img.naturalHeight || 1440;

          if (!trackerRef.current) {
            trackerRef.current = new VirtualFittingPoseTracker();
            await trackerRef.current.init();
          }

          const pose = await trackerRef.current.sendFrame(img);
          if (pose && garmentImgRef.current) {
            renderGarmentOverlay(canvas, img as any, garmentImgRef.current, pose, {
              garmentType,
              selectedSize,
              selectedColorHex,
              isMirrored: false,
              scaleAdjust,
              verticalOffsetAdjust,
            });

            // Composite user photo with garment
            const mergedCanvas = document.createElement('canvas');
            mergedCanvas.width = canvas.width;
            mergedCanvas.height = canvas.height;
            const mCtx = mergedCanvas.getContext('2d');
            if (mCtx) {
              mCtx.drawImage(img, 0, 0);
              mCtx.drawImage(canvas, 0, 0);
              setCapturedImage(mergedCanvas.toDataURL('image/jpeg', 0.92));
            }
          } else {
            setCapturedImage(dataUrl);
          }
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Trigger AI Photo Try-On Request (Mode B)
  const handleTriggerAITryOn = async () => {
    if (!capturedImage && videoRef.current && canvasRef.current) {
      // Capture live photo first
      handleCapture();
    }

    setIsGeneratingAI(true);
    try {
      const snap = capturedImage || (videoRef.current && canvasRef.current ? captureFittingSnapshot(videoRef.current, canvasRef.current, { name: product.name, price: effectivePrice }) : '');

      const res = await fetch('/api/try-on/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerImage: snap,
          garmentImage: garmentAssetUrl,
          garmentType,
          size: selectedSize,
          color: selectedColor,
        }),
      });

      const data = await res.json();
      if (data.resultImageUrl) {
        setCapturedImage(data.resultImageUrl);
      }
    } catch (err) {
      console.warn('AI Try-on request error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in overflow-hidden select-none">
      {/* Container: Fullscreen on mobile, Elegant Studio Viewport on Desktop */}
      <div className="relative w-full h-full max-w-6xl md:h-[90vh] md:rounded-3xl bg-[#090d16] border border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT / CENTER VIEWPORT: CAMERA STREAM & GARMENT CANVAS   */}
        {/* ======================================================== */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Camera Video Stream (hidden visually behind canvas) */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
            playsInline
            muted
          />

          {/* Real-time AR Garment Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          />

          {/* Frozen / Captured Photo Preview */}
          {capturedImage && (
            <div className="absolute inset-0 z-20 bg-black flex items-center justify-center animate-fade-in">
              <img
                src={capturedImage}
                alt="Virtual Try-On Snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Captured Snapshot</span>
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

            {/* Right: Actions (Flip Camera, Close) */}
            <div className="flex items-center gap-2">
              {isCameraActive && !capturedImage && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow"
                  title="Flip camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-700/80 text-amber-400 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow flex items-center gap-1.5 text-xs font-bold"
                title="Take photo with phone or upload picture"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">ছবি আপলোড</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  cleanup();
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white hover:bg-red-600/80 transition active:scale-95 shadow"
                title="Close Virtual Fitting Room"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Camera Loading Overlay */}
          {isLoadingModel && (
            <div className="absolute inset-0 z-30 bg-[#090d16]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Preparing Virtual Fitting Room
                </h3>
                <p className="text-xs text-slate-400">
                  Loading MediaPipe AI Body Tracking & Canvas Compositor...
                </p>
              </div>
            </div>
          )}

          {/* Hidden File Input for Native Phone Camera & Photo Upload */}
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            capture="user"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Camera Error Fallback Message */}
          {cameraError && !capturedImage && (
            <div className="absolute inset-0 z-30 bg-[#090d16]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white">
                  Camera Access Required
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cameraError}
                </p>
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 text-left space-y-1.5 mt-2 text-[11px] text-slate-300">
                  <p className="font-bold text-amber-400">💡 সমাধান পদ্ধতি:</p>
                  <p>• <b>মোবাইলে:</b> নিচের <span className="text-amber-300 font-bold">"📸 ছবি তুলুন (Native Camera)"</span> চাপুন — ফোনের ক্যামেরা সরাসরি অন হবে।</p>
                  <p>• <b>উইন্ডোজ ল্যাপটপে:</b> Start Menu &gt; Settings &gt; Privacy &amp; security &gt; Camera &gt; <span className="text-emerald-400 font-bold">"Let desktop apps access your camera"</span> অন (ON) করুন।</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>📸 ছবি তুলুন বা আপলোড করুন</span>
                </button>

                <button
                  type="button"
                  onClick={initSession}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* Center Dynamic Body Tracking Guidance Pill */}
          {!isLoadingModel && !cameraError && !capturedImage && (
            <div className="absolute top-16 inset-x-0 flex justify-center z-20 pointer-events-none px-4">
              <div
                className={`px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                  poseDetected
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900/80 border border-amber-500/40 text-amber-300 animate-pulse'
                }`}
              >
                {poseDetected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{guidanceMsg} ({guidanceMsgBn})</span>
              </div>
            </div>
          )}

          {/* Bottom Floating Bar on Mobile */}
          <div className="md:hidden absolute bottom-0 inset-x-0 p-4 z-30 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-3">
            {/* Quick Size pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {uniqueSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                    selectedSize === size
                      ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-900/80 text-white border border-slate-700/80'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Mobile Actions: Capture, Add to Cart, Buy Now */}
            <div className="grid grid-cols-3 gap-2">
              {capturedImage ? (
                <button
                  onClick={() => setCapturedImage(null)}
                  className="bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              ) : (
                <button
                  onClick={handleCapture}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture</span>
                </button>
              )}

              <button
                onClick={handleAddToCart}
                className="bg-slate-900 text-white border border-slate-700 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{addedSuccess ? '✓ Added' : 'Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-md"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: INTERACTIVE STUDIO RACK & CONSOLE (DESKTOP) */}
        {/* ======================================================== */}
        <div className="hidden md:flex w-96 bg-[#0d1322] border-l border-slate-800/80 p-6 flex-col justify-between overflow-y-auto">
          {/* Top: Product Meta & Studio Controls */}
          <div className="space-y-5">
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

            {/* Mode Switcher: Live AR vs AI Photo Fit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                FITTING ROOM ENGINE
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('realtime');
                    setCapturedImage(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeMode === 'realtime' && !capturedImage
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live AR Cam</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('ai');
                    handleTriggerAITryOn();
                  }}
                  disabled={isGeneratingAI}
                  className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeMode === 'ai' || capturedImage
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>AI Photo Fit</span>
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Select Size
                </span>
                <span className="text-[11px] font-black text-amber-400 font-mono">
                  Scale: {SIZE_FIT_FACTORS[selectedSize] || 1.0}x
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-10 h-10 px-3 rounded-xl font-black text-xs border transition flex items-center justify-center ${
                      selectedSize === size
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            {uniqueColors.length > 1 && (
              <div className="space-y-2">
                <span className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Color Shade: <span className="text-amber-400">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((c: any) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setSelectedColor(c.color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        selectedColor === c.color
                          ? 'border-amber-400 bg-slate-900 text-white shadow ring-2 ring-amber-400/20'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/30 inline-block shadow-inner"
                        style={{ backgroundColor: c.hex || '#1e3a8a' }}
                      />
                      <span>{c.color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fine-Tuning Drawer Toggle */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowTuning(!showTuning)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-slate-200 py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Garment Fit Adjustments</span>
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showTuning ? 'rotate-90' : ''}`} />
              </button>

              {showTuning && (
                <div className="mt-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 animate-fade-in text-xs">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Scale Multiplier:</span>
                      <span className="font-mono text-amber-400">{scaleAdjust.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.7}
                      max={1.4}
                      step={0.02}
                      value={scaleAdjust}
                      onChange={(e) => setScaleAdjust(parseFloat(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Vertical Offset:</span>
                      <span className="font-mono text-amber-400">{(verticalOffsetAdjust * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min={-0.15}
                      max={0.15}
                      step={0.01}
                      value={verticalOffsetAdjust}
                      onChange={(e) => setVerticalOffsetAdjust(parseFloat(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setScaleAdjust(1.0);
                      setVerticalOffsetAdjust(0);
                    }}
                    className="text-[10px] text-slate-400 hover:text-amber-400 underline"
                  >
                    Reset fit to default
                  </button>
                </div>
              )}
            </div>

            {/* Privacy notice badge */}
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guaranteed:</strong> Camera frame processing occurs locally inside your browser. No video feed is recorded or transmitted to our servers.
              </span>
            </div>
          </div>

          {/* Bottom Conversion Actions */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            {/* Snapshot Actions */}
            <div className="grid grid-cols-2 gap-2">
              {capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSnapshot}
                    className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCapture}
                  className="col-span-2 py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Capture Fit Photo</span>
                </button>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-[#1e293b] hover:bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700/80 shadow-md transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{addedSuccess ? '✓ Added to Cart!' : 'Add to Cart from Fitting Room'}</span>
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now (অর্ডার করুন)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
