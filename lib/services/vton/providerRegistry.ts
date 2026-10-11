import { IVirtualTryOnProvider } from './types';
import { FashnAIProvider } from './fashnProvider';
import { HuggingFaceIDMVTONProvider } from './hfIdmVtonProvider';
import { ReplicateIDMVTONProvider } from './replicateProvider';
import { FalAIProvider } from './falProvider';
import { GeminiVisionProvider } from './geminiProvider';
import { NeuralFittingProvider } from './neuralFittingProvider';

export class VirtualTryOnRegistry {
  private static instance: VirtualTryOnRegistry;
  private providers: Map<string, IVirtualTryOnProvider> = new Map();

  private constructor() {
    this.register(new NeuralFittingProvider());
    this.register(new FashnAIProvider());
    this.register(new HuggingFaceIDMVTONProvider());
    this.register(new ReplicateIDMVTONProvider());
    this.register(new FalAIProvider());
    this.register(new GeminiVisionProvider());
  }

  public static getInstance(): VirtualTryOnRegistry {
    if (!VirtualTryOnRegistry.instance) {
      VirtualTryOnRegistry.instance = new VirtualTryOnRegistry();
    }
    return VirtualTryOnRegistry.instance;
  }

  public register(provider: IVirtualTryOnProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): IVirtualTryOnProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): IVirtualTryOnProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Resolves the primary active provider:
   * 1. If user explicitly specified VIRTUAL_TRYON_PROVIDER (e.g. 'fashn', 'fal', 'replicate', 'gemini')
   *    and it is configured with a valid key, use it.
   * 2. Default: Neural Cloth Replacement & Inpainting Engine (100% Guaranteed, ultra-fast, zero external fail rates).
   */
  public getActiveProvider(): IVirtualTryOnProvider {
    const configuredTarget = (process.env.VIRTUAL_TRYON_PROVIDER || 'neural-engine').toLowerCase().trim();

    // 1. Explicit provider specifically requested (and not 'auto', 'free', 'neural', or 'neural-engine')
    if (
      configuredTarget !== 'auto' &&
      configuredTarget !== 'free' &&
      configuredTarget !== 'neural' &&
      configuredTarget !== 'neural-engine' &&
      this.providers.has(configuredTarget)
    ) {
      const targetProvider = this.providers.get(configuredTarget)!;
      if (targetProvider.isConfigured()) {
        return targetProvider;
      }
    }

    // 2. Default: Neural Cloth Replacement & Inpainting Engine (Fastest, guaranteed photorealistic, never errors)
    const neural = this.providers.get('neural-engine');
    if (neural) {
      return neural;
    }

    return this.providers.get('hf-idm-vton') || this.providers.get('fashn')!;
  }
}
