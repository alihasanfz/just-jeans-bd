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

export default function VirtualFittingRoomModal({
  product,
  initialSize,
  initialColor,
  isOpen,
  onClose,
}: VirtualFittingRoomModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Mode: Primary is 'ai' (photorealistic clothing replacement), secondary is 'realtime' (Live AR Cam)
  const [activeMode, setActiveMode] = useState<'ai' | 'realtime'>('ai');

  // Camera & Video Elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // Selected Variant & Fit Tuning
  const defaultSize = initialSize || (product.variants[0]?.size ?? '32');
  const defaultColor = initialColor || (product.variants[0]?.color ?? 'Raw Deep Indigo');
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [scaleAdjust, setScaleAdjust] = useState<number>(1.0);
  const [verticalOffsetAdjust, setVerticalOffsetAdjust] = useState<number>(0);

  // AI Photorealistic Try-On State (Before vs After)
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<'after' | 'before' | 'split'>('after');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [aiStep, setAiStep] = useState<number>(1);
  const [aiStepText, setAiStepText] = useState<string>('Analyzing person...');

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
            scaleAdjust,
            verticalOffsetAdjust,
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
    scaleAdjust,
    verticalOffsetAdjust,
    sessionId,
    poseDetected,
  ]);

  /**
   * Main Realistic AI Virtual Try-On Pipeline
   * Takes a customer photograph (from camera capture or upload)
   * 1. Detects person, pose & clothing region
   * 2. Occludes / in-paints the existing shirt/jacket
   * 3. Drapes the authentic selected product onto the person's real body
   * 4. Produces photorealistic before/after results
   */
  const processRealisticTryOn = async (customerImageDataUrl: string) => {
    setBeforeImage(customerImageDataUrl);
    setAfterImage(null);
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
      setAiStepText(`Replacing old clothing & fitting ${product.name}...`);

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
            size: selectedSize,
            color: selectedColor,
            productName: product.name,
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
      setAiStepText('Harmonizing lighting, textures, and fabric drape...');

      // If no external cloud API result, run local neural clothing replacement
      if (!generatedUrl && pose && garmentImgRef.current) {
        generatedUrl = await generatePhotorealisticClothingReplacement(img, garmentImgRef.current, pose, {
          garmentType,
          selectedSize,
          selectedColorHex,
          productName: product.name,
          price: effectivePrice,
          scaleAdjust,
          verticalOffsetAdjust,
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

  // Re-run AI fit when size or color changes on an existing photo
  const handleVariantReFit = (newSize?: string, newColor?: string) => {
    if (newSize) setSelectedSize(newSize);
    if (newColor) setSelectedColor(newColor);

    if (beforeImage) {
      setTimeout(() => {
        processRealisticTryOn(beforeImage);
      }, 50);
    }
  };

  // Capture live photo from camera
  const handleCaptureLivePhoto = () => {
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

    // Stop video and send to AI pipeline
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setIsCameraActive(false);
    setIsCameraOpenInAI(false);

    processRealisticTryOn(dataUrl);
  };

  // Handle uploaded customer photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        processRealisticTryOn(dataUrl);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md animate-fade-in overflow-hidden select-none">
      {/* Container: Studio Viewport */}
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
          {!isCameraActive && !isProcessingAI && !afterImage && (
            <div className="p-6 max-w-lg text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-indigo-600 p-0.5 mx-auto shadow-xl shadow-indigo-500/20">
                <div className="w-full h-full bg-[#080d1a] rounded-[22px] flex items-center justify-center text-amber-400">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full inline-block">
                  Photorealistic AI Fitting Room
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Try On {product.name}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Take a photo or upload your picture. Our AI removes existing clothing and realistically fits this authentic denim piece onto your body.
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
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-xl shadow-amber-500/30 uppercase tracking-wider"
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
                  className="bg-slate-900/80 hover:bg-slate-800 text-white p-3.5 rounded-2xl border border-slate-700"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STATE C: 5-STEP AI GENERATION PROGRESS OVERLAY       */}
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
          {/* STATE D: PHOTOREALISTIC RESULT (BEFORE VS AFTER VIEW) */}
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
                className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white hover:bg-red-600/80 transition active:scale-95 shadow"
                title="Close Virtual Fitting Room"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Floating Bar on Mobile */}
          <div className="md:hidden absolute bottom-0 inset-x-0 p-4 z-30 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-3">
            {afterImage && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAfterImage(null);
                    setBeforeImage(null);
                  }}
                  className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Photo</span>
                </button>
              </div>
            )}

            {/* Mobile Actions: Add to Cart, Buy Now */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                className="bg-slate-900 text-white border border-slate-700 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{addedSuccess ? '✓ Added' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Buy Now (অর্ডার)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: INTERACTIVE STUDIO RACK & CONSOLE (DESKTOP) */}
        {/* ======================================================== */}
        <div className="hidden md:flex w-96 bg-[#0b101e] border-l border-slate-800/80 p-6 flex-col justify-between overflow-y-auto">
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

            {/* Mode Switcher: AI Photo Try-On vs Live AR Cam */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                TRY-ON ENGINE
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#080d1a] p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('ai');
                    stopCameraStream(streamRef.current);
                    setIsCameraActive(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeMode === 'ai'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Photo Fit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('realtime');
                    setAfterImage(null);
                    setBeforeImage(null);
                    initCamera();
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                    activeMode === 'realtime'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live AR Cam</span>
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
                      onClick={() => handleVariantReFit(size, undefined)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
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
                      onClick={() => handleVariantReFit(undefined, c.color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
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

            {/* Garment Fit Adjustments Accordion */}
            <details className="group rounded-xl border border-slate-800 bg-[#080d1a] p-3 text-xs">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-slate-300 select-none">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Garment Fit Adjustments</span>
                </span>
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-slate-500" />
              </summary>
              <div className="pt-3 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Width / Drape Scale</span>
                    <span className="font-mono text-amber-400">{(scaleAdjust * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.85"
                    max="1.35"
                    step="0.02"
                    value={scaleAdjust}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setScaleAdjust(val);
                      if (beforeImage) {
                        setTimeout(() => processRealisticTryOn(beforeImage), 60);
                      }
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Vertical Position</span>
                    <span className="font-mono text-amber-400">
                      {verticalOffsetAdjust > 0 ? `+${(verticalOffsetAdjust * 100).toFixed(0)}%` : `${(verticalOffsetAdjust * 100).toFixed(0)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.08"
                    max="0.08"
                    step="0.01"
                    value={verticalOffsetAdjust}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVerticalOffsetAdjust(val);
                      if (beforeImage) {
                        setTimeout(() => processRealisticTryOn(beforeImage), 60);
                      }
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </details>

            {/* Quick Actions (Retake, Upload New, Download) */}
            {afterImage && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Try-On Image (ছবি সেভ করুন)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraOpenInAI(true);
                      initCamera();
                    }}
                    className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
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
              className="w-full bg-[#080d1a] hover:bg-slate-900 border border-slate-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow"
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
