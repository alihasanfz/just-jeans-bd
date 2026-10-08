# Jeans BD — Virtual Fitting Room & AI Try-On Architecture

## 1. System Overview
The Jeans BD Virtual Try-On system provides a dual-mode fitting room directly in the browser:
1. **Mode A (Live AR Real-Time Tracking)**: Client-side computer vision tracking using MediaPipe Pose 33-landmark estimation combined with an adaptive optical contour fallback engine. Garments dynamically scale, rotate, and follow shoulder/hip anatomical keypoints at 30–60 FPS.
2. **Mode B (AI Photo Studio)**: High-resolution generative neural try-on via server-side API (`/api/try-on/ai`), supporting providers like Fashn.ai, Replicate IDM-VTON, Kolors Virtual Try-On, or an integrated high-fidelity studio compositor.

---

## 2. Architecture Diagram

```
[ Customer Browser / Mobile Safari / Chrome ]
     │
     ├─► Camera Video Stream (HTMLMediaElement)
     │        │
     │        ▼
     ├─► Computer Vision Engine (`lib/utils/tryonEngine.ts`)
     │        ├─► MediaPipe Pose Landmark Detection (Client-side WASM/WebGL)
     │        ├─► Optical Keypoint Fallback Estimator
     │        └─► Exponential Moving Average (EMA) Landmark Smoother
     │        │
     │        ▼
     ├─► Real-Time Canvas Compositor (requestAnimationFrame)
     │        ├─► Garment Affine Scaling (XS–XXXL)
     │        ├─► Color Multiply Tinting (Selected Wash/Color)
     │        └─► Watermarked High-Res Snapshot Capture
     │
     ├─► Mode B: AI Photo Studio
     │        │
     │        ▼ (Secure Backend Relay)
     └─► Next.js Route (`POST /api/try-on/ai`)
              │
              ▼
         External AI Provider (Fashn.ai / Replicate / IDM-VTON)
              │ (API Key protected server-side: `VIRTUAL_TRYON_API_KEY`)
              ▼
         Synthesized Try-On Photorealistic Render
```

---

## 3. Core Components & Responsibilities

| Component / File | Responsibility |
|---|---|
| `components/tryon/VirtualFittingRoomModal.tsx` | Mobile-first & desktop responsive studio modal. Manages camera permission, tracking guidance pill, size/color variant synchronization, Add to Cart, Buy Now, and snapshot downloads. |
| `lib/utils/tryonEngine.ts` | Complete WebRTC camera lifecycle, MediaPipe Pose loader, optical contour fallback, landmark smoothing, canvas garment fitting, and watermark generator. |
| `lib/utils/tryonAnalytics.ts` | Privacy-first local IndexedDB analytics recorder and KPI metrics aggregator for the admin dashboard. |
| `app/api/try-on/ai/route.ts` | Server-side API endpoint for neural photorealistic try-on. Safeguards API keys and shields client bundles from secrets. |
| `app/admin/try-on/page.tsx` | Virtual Try-On admin management dashboard. Real-time metrics (Sessions, Detections, Cart Additions, Conversion Rate), catalog toggles, and live AR test launch. |
| `app/admin/products/page.tsx` | Add/Edit product modal integration. Allows admins to enable/disable try-on, configure garment cut type, and specify transparent asset cutouts. |
| `lib/store/productsContext.tsx` | Metadata serialization (`__TRYON__:{...}`) inside product details to maintain 100% backward compatibility with Supabase without altering PostgreSQL table structure. |
| `app/product/[slug]/page.tsx` | Product detail page integration featuring the `[ 🪄 TRY IT ON (ভার্চুয়াল ফিটিং রুম) ]` button and floating gallery badge. |

---

## 4. Privacy & Security Model
- **Zero Video Transmission**: The real-time camera stream (`MediaStreamTrack`) is processed strictly in local browser memory via HTML5 Canvas. No raw camera frames or biometric landmark coordinates are transmitted to any server.
- **Explicit User Action Only**: Camera access is requested only when the customer clicks "TRY IT ON". When closing the modal, all camera tracks (`track.stop()`) and animation frames are instantly terminated to prevent memory leaks and camera indicator persistence.
- **Server-Side API Key Protection**: Third-party AI model keys (`VIRTUAL_TRYON_API_KEY`) reside exclusively in server-side environment variables and are never sent to client bundles.

---

## 5. Database Schema & Compatibility
To ensure compatibility with existing Supabase setups without triggering schema errors (`PGRST204` column not found):
- Try-On settings (`virtualTryOnEnabled`, `garmentCategory`, `garmentType`, `tryOnAssetUrl`, `tryOnFitConfig`) are encoded into the product `details` array as a JSON prefix string:
  ```json
  "__TRYON__:{\"enabled\":true,\"garmentType\":\"jacket\",\"assetUrl\":\"...\"}"
  ```
- The frontend `mapDbProduct` parser deserializes this metadata into first-class `Product` fields while stripping internal tags from customer-facing specifications.

---

## 6. Environment Variables

Add these variables to your `.env.local` or Vercel dashboard:

```env
# Optional external AI Photo Try-On provider (Fashn.ai / Replicate / IDM-VTON)
VIRTUAL_TRYON_PROVIDER=fashn
VIRTUAL_TRYON_API_KEY=your_secure_api_key_here
VIRTUAL_TRYON_API_URL=https://api.fashn.ai/v1/run
```

*Note: If no external key is provided, the system seamlessly uses its built-in high-resolution neural photo canvas compositor.*

---

## 7. Supported Garment Categories & Placement Anchors

| Garment Type | Landmark Anchors Used | Fit Adjustment |
|---|---|---|
| `jacket` | Left & Right Shoulders (11, 12), Hips (23, 24) | Over-torso draping with slight shoulder overhang |
| `jeans` | Left & Right Hips (23, 24), Knees (25, 26), Ankles (27, 28) | Leg-length aligned draped cut |
| `shirt` | Shoulders (11, 12), Hips (23, 24) | Slim / Regular torso fitting |
| `tshirt` | Shoulders (11, 12), Mid-spine | Relaxed neck and chest overlay |
| `hoodie` | Shoulders (11, 12), Hips (23, 24) | Oversized chest and sleeve contour |
| `dress` | Shoulders (11, 12), Knees (25, 26) | Full-length draping down to knee/calf |
| `panjabi` | Shoulders (11, 12), Knees (25, 26) | Traditional knee-length silhouette |

---

## 8. Browser & Device Compatibility
- **Desktop**: Google Chrome 90+, Microsoft Edge 90+, Mozilla Firefox 88+, Apple Safari 14+.
- **Mobile iOS**: Safari on iOS 14.3+ (WebRTC HTTPS secure context required).
- **Mobile Android**: Google Chrome, Samsung Internet, Firefox Mobile.
- **Hardware Requirement**: Any device with a front/rear camera and WebGL support.

---

## 9. Future Roadmap
- **V2**: 3D GLTF/GLB garment model draping using Three.js / WebGPU.
- **V3**: AI body measurement and automatic size prediction based on height/shoulder width.
- **V4**: Multi-person fitting room for couple and family shopping.
