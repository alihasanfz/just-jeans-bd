import { IVirtualTryOnProvider } from './types';
import { FashnAIProvider } from './fashnProvider';
import { HuggingFaceIDMVTONProvider } from './hfIdmVtonProvider';
import { ReplicateIDMVTONProvider } from './replicateProvider';
import { FalAIProvider } from './falProvider';
import { GeminiVisionProvider } from './geminiProvider';

export class VirtualTryOnRegistry {
  private static instance: VirtualTryOnRegistry;
  private providers: Map<string, IVirtualTryOnProvider> = new Map();

  private constructor() {
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
   *    and it is NOT 'auto' or 'free', use that configured provider.
   * 2. Default: Hugging Face IDM-VTON (100% Free GPU Virtual Try-On, zero cost, no credit card required)!
   */
  public getActiveProvider(): IVirtualTryOnProvider {
    const configuredTarget = (process.env.VIRTUAL_TRYON_PROVIDER || 'auto').toLowerCase().trim();

    // 1. Explicit provider specifically requested (and not 'auto' or 'free')
    if (
      configuredTarget !== 'auto' &&
      configuredTarget !== 'free' &&
      this.providers.has(configuredTarget)
    ) {
      const targetProvider = this.providers.get(configuredTarget)!;
      if (targetProvider.isConfigured()) {
        return targetProvider;
      }
    }

    // 2. Default & Free: Hugging Face IDM-VTON (Always works, completely free)
    const hf = this.providers.get('hf-idm-vton');
    if (hf) {
      return hf;
    }

    // Fallback to any available provider
    return this.providers.get('fashn') || this.providers.get('replicate')!;
  }
}
