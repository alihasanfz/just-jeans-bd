import { IVirtualTryOnProvider } from './types';
import { FashnAIProvider } from './fashnProvider';
import { ReplicateIDMVTONProvider } from './replicateProvider';
import { FalAIProvider } from './falProvider';
import { GeminiVisionProvider } from './geminiProvider';

export class VirtualTryOnRegistry {
  private static instance: VirtualTryOnRegistry;
  private providers: Map<string, IVirtualTryOnProvider> = new Map();

  private constructor() {
    this.register(new FashnAIProvider());
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
   * Resolves the primary active provider based on user config and configured credentials
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

    // 2. Auto selection order based on specialized VTON capabilities
    const priorityList = ['fashn', 'replicate', 'fal', 'gemini'];
    for (const id of priorityList) {
      const p = this.providers.get(id);
      if (p && p.isConfigured()) {
        return p;
      }
    }

    // 3. Fallback to Replicate provider by default
    return this.providers.get('replicate')!;
  }
}
