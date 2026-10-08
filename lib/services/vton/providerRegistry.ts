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
   * 1. If user explicitly specified VIRTUAL_TRYON_PROVIDER (e.g. 'fashn', 'hf-idm-vton', 'replicate', 'fal') and it is configured, use it.
   * 2. If Fashn API key is configured, use Fashn.
   * 3. Otherwise, seamlessly use Hugging Face IDM-VTON (100% Free diffusion try-on model)!
   */
  public getActiveProvider(): IVirtualTryOnProvider {
    const configuredTarget = (process.env.VIRTUAL_TRYON_PROVIDER || 'auto').toLowerCase().trim();

    // 1. Explicit provider requested
    if (configuredTarget !== 'auto' && this.providers.has(configuredTarget)) {
      const targetProvider = this.providers.get(configuredTarget)!;
      if (targetProvider.isConfigured()) {
        return targetProvider;
      }
    }

    // 2. If Fashn is configured with a valid key, prioritize it
    const fashn = this.providers.get('fashn');
    if (fashn && fashn.isConfigured()) {
      return fashn;
    }

    // 3. If Replicate is configured, use it
    const replicate = this.providers.get('replicate');
    if (replicate && replicate.isConfigured()) {
      return replicate;
    }

    // 4. Default: Hugging Face IDM-VTON (100% Free GPU Virtual Try-On)
    return this.providers.get('hf-idm-vton')!;
  }
}
