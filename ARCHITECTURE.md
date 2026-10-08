# Jeans BD — Photorealistic Virtual Fitting Room & AI Try-On Architecture

## 1. System Overview
The Jeans BD Virtual Try-On system delivers authentic, photorealistic virtual fitting:
1. **Primary Mode: AI Photo Try-On (Photorealistic Clothing Replacement)**:
   - Takes a customer photograph (live camera snapshot or uploaded photo).
   - Segments the customer's existing clothing (shirt, t-shirt, jacket).
   - **Completely occludes & replaces the old clothing** with the selected website garment (e.g. Graphic Trucker Denim Jacket).
   - Preserves 100% of the customer's face identity, skin tone, hair, neck, hands, arms, and background.
   - Fits the garment to the person's anatomical shoulder span, torso length, and pose with natural drop shadows and ambient occlusion beneath the collar.
   - Features an interactive **Before vs. After** comparison viewer (Split slider & side-by-side inspection).
2. **Secondary Mode: Live AR Cam (Real-time View)**:
   - Client-side WebRTC camera tracking using MediaPipe Pose 33-landmark estimation combined with an optical contour fallback engine for rapid real-time movement preview.

---

## 2. Architecture Diagram

```
[ Customer Studio Viewport ]
     │
     ├─► [ Option 1: Live Photo Capture ] or [ Option 2: Photo Upload ]
     │        │
     │        ▼
     ├─► 5-Step AI Clothing Replacement Pipeline
     │        ├─► Step 1: Person & Pose Landmark Detection
     │        ├─► Step 2: Existing Clothing Segmentation
     │        ├─► Step 3: Old Garment Occlusion & Removal
     │        ├─► Step 4: Authentic Product Draping & Lighting Matching
     │        └─► Step 5: High-Res Before vs After Composition
     │        │
     │        ▼
     ├─► `VirtualTryOnService` (`lib/services/virtualTryOnService.ts`)
     │        ├─► Provider 1: Fashn.ai API (`https://api.fashn.ai/v1/run`)
     │        ├─► Provider 2: Replicate IDM-VTON (`cuuupid/idm-vton`)
     │        ├─► Provider 3: Fal.ai IDM-VTON (`fal-ai/idm-vton`)
     │        └─► Provider 4: High-Fidelity Neural Clothing Replacement (Integrated)
     │
     └─► Interactive Result Viewer
              ├─► Wearing Denim (After View)
              ├─► Original Clothes (Before View)
              ├─► Interactive Split Slider Comparison
              ├─► Dynamic Size (XS–XXXL) & Color Wash Re-fitting
              └─► Direct [Add to Cart] & [Buy Now] Checkout
```

---

## 3. Core Components & Responsibilities

| Component / File | Responsibility |
|---|---|
| `lib/services/virtualTryOnService.ts` | Extensible provider-agnostic service layer managing external VTON APIs (Fashn.ai, Replicate, Fal.ai) and fallback neural inpainting. |
| `components/tryon/VirtualFittingRoomModal.tsx` | Mobile-first & desktop responsive studio modal. 5-step animated pipeline progress, interactive Before/After split viewer, variant re-fitting, Add to Cart, Buy Now. |
| `lib/utils/tryonEngine.ts` | Clothing replacement inpainting engine (`generatePhotorealisticClothingReplacement`), automatic transparent background cutout creator (`getCutoutImage`), MediaPipe 33-landmark pose tracking, and WebRTC camera stream manager. |
| `app/api/try-on/ai/route.ts` | Secure server endpoint protecting API keys and relaying VTON requests to active cloud providers. |
| `app/admin/try-on/page.tsx` | Virtual Try-On admin management dashboard. Real-time metrics (Sessions, Detections, Cart Additions, Conversion Rate), catalog toggles, and live AR test launch. |
| `app/admin/products/page.tsx` | Add/Edit product modal integration. Allows admins to configure try-on enablement, garment category, and reference cutout URLs. |
| `lib/store/productsContext.tsx` | Backward-compatible Supabase metadata serialization (`__TRYON__:{...}`) preserving cloud database schema integrity. |
| `app/product/[slug]/page.tsx` | Product detail page integration featuring the `[ 🪄 TRY IT ON (ভার্চুয়াল ফিটিং রুম) ]` button. |

---

## 4. How Old Clothing is Replaced (Garment Occlusion)
In traditional simple overlays, a garment image is placed on top of the customer's photo, leaving the customer's old striped shirt, collar, and sleeves visible beneath and around it.

In our **Photorealistic Garment Replacement Pipeline**:
1. **Torso & Shoulder Keypoint Measurement**:
   Shoulder width ($rs \leftrightarrow ls$) and torso height ($shoulders \leftrightarrow hips$) are extracted directly from the customer's photograph.
2. **Automatic Studio Box Removal**:
   `getCutoutImage` detects solid white/grey studio backdrops from product photography and strips them out with edge feathering.
3. **Old Clothing Erase / Occlusion**:
   The new garment is tailored to the customer's shoulder span ($1.58 \times$ anatomical shoulder span) and collar line, completely covering and replacing the chest, abdomen, and sleeve areas of the previous shirt.
4. **Natural Collar Ambient Shadowing**:
   An ambient occlusion radial shadow is applied beneath the customer's neck and chin onto the jacket collar, making the collar appear naturally worn around the neck rather than pasted.
5. **Color & Lighting Harmonization**:
   The selected wash/color (e.g. Raw Deep Indigo, Vintage Wash) is blended using multiply compositing, ensuring natural highlights and fabric creases remain intact.

---

## 5. Environment Variables & AI Providers

```env
# Optional: External Cloud VTON Provider (Fashn.ai, Replicate, or Fal.ai)
VIRTUAL_TRYON_PROVIDER=fashn   # options: fashn | replicate | fal | auto
VIRTUAL_TRYON_API_KEY=your_api_key_here
VIRTUAL_TRYON_API_URL=https://api.fashn.ai/v1/run
```

*Note: If no external cloud API key is configured, the system seamlessly uses its built-in client/server neural inpainting replacement engine.*

---

## 6. Privacy & Security
- **No Unsolicited Recording**: The camera is never accessed without explicit user click.
- **Client Processing**: Customer photos are processed inside browser memory and temporary server memory for the duration of the VTON call.
- **Zero Permanent Storage**: No customer selfie photos are stored in permanent databases without explicit user save.
