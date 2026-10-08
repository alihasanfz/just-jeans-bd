/**
 * Virtual Try-On Provider Abstraction Layer Types
 */

export interface TryOnJobRequest {
  id: string; // Internal Job ID (e.g., VTO-172839482)
  humanImage: string; // Absolute public HTTPS URL or Base64 Data URI
  garmentImage: string; // Absolute public HTTPS URL or Base64 Data URI
  garmentType:
    | 'tshirt'
    | 'shirt'
    | 'polo'
    | 'panjabi'
    | 'kurta'
    | 'jacket'
    | 'hoodie'
    | 'blazer'
    | 'dress'
    | 'shorts'
    | 'skirt'
    | 'jeans'
    | 'pants'
    | (string & {});
  category: 'tops' | 'bottoms' | 'one-pieces';
  productName?: string;
  size?: string;
  color?: string;
  userId?: string;
  productId?: string;
}

export type VTOJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'expired';

export interface VTOStatusResult {
  status: VTOJobStatus;
  progressPercent: number;
  stepDescription: string;
  resultImageUrl?: string;
  errorMessage?: string;
}

export interface IVirtualTryOnProvider {
  readonly id: string;
  readonly name: string;
  isConfigured(): boolean;
  createTryOnJob(request: TryOnJobRequest): Promise<{
    providerJobId: string;
    status: VTOJobStatus;
    resultImageUrl?: string;
  }>;
  getTryOnJobStatus(providerJobId: string): Promise<VTOStatusResult>;
  cancelTryOnJob?(providerJobId: string): Promise<boolean>;
}

export interface StoredTryOnJob {
  id: string;
  userId?: string;
  productId?: string;
  productName: string;
  inputImageUrl: string;
  garmentImageUrl: string;
  resultImageUrl?: string;
  garmentType: string;
  category: string;
  selectedSize?: string;
  selectedColor?: string;
  provider: string;
  providerJobId?: string;
  status: VTOJobStatus;
  stepDescription: string;
  progressPercent: number;
  errorMessage?: string;
  processingTimeMs: number;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}
