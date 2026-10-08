import { NextResponse } from 'next/server';
import { TryOnJobRepository } from '@/lib/services/vton/jobRepository';
import { VirtualTryOnRegistry } from '@/lib/services/vton/providerRegistry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repository = TryOnJobRepository.getInstance();
    const stats = await repository.getStats();

    const registry = VirtualTryOnRegistry.getInstance();
    const providers = registry.getAllProviders().map((p) => ({
      id: p.id,
      name: p.name,
      configured: p.isConfigured(),
    }));

    const activeProvider = registry.getActiveProvider();

    return NextResponse.json({
      success: true,
      stats,
      providers,
      activeProvider: {
        id: activeProvider.id,
        name: activeProvider.name,
        configured: activeProvider.isConfigured(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
