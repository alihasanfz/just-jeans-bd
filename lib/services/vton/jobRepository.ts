import { StoredTryOnJob } from './types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export class TryOnJobRepository {
  private static instance: TryOnJobRepository;
  // In-memory fallback map to guarantee immediate consistency across serverless execution within process
  private memoryStore: Map<string, StoredTryOnJob> = new Map();

  public static getInstance(): TryOnJobRepository {
    if (!TryOnJobRepository.instance) {
      TryOnJobRepository.instance = new TryOnJobRepository();
    }
    return TryOnJobRepository.instance;
  }

  public async saveJob(job: StoredTryOnJob): Promise<void> {
    this.memoryStore.set(job.id, { ...job });

    if (isSupabaseConfigured) {
      try {
        await supabase.from('virtual_tryon_jobs').upsert({
          id: job.id,
          user_id: job.userId || null,
          product_id: job.productId || null,
          product_name: job.productName || '',
          input_image_url: job.inputImageUrl,
          garment_image_url: job.garmentImageUrl,
          result_image_url: job.resultImageUrl || null,
          garment_type: job.garmentType,
          category: job.category,
          selected_size: job.selectedSize || 'M',
          selected_color: job.selectedColor || '',
          provider: job.provider,
          provider_job_id: job.providerJobId || null,
          status: job.status,
          step_description: job.stepDescription,
          progress_percent: job.progressPercent,
          error_message: job.errorMessage || null,
          processing_time_ms: job.processingTimeMs || 0,
          created_at: job.createdAt,
          completed_at: job.completedAt || null,
          expires_at: job.expiresAt,
        });
      } catch (err) {
        console.warn('Could not save job to Supabase cloud, kept in memory store:', err);
      }
    }
  }

  public async getJob(jobId: string): Promise<StoredTryOnJob | null> {
    const memoryJob = this.memoryStore.get(jobId);
    if (memoryJob) return memoryJob;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('virtual_tryon_jobs')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();

        if (!error && data) {
          const loaded: StoredTryOnJob = {
            id: data.id,
            userId: data.user_id,
            productId: data.product_id,
            productName: data.product_name,
            inputImageUrl: data.input_image_url,
            garmentImageUrl: data.garment_image_url,
            resultImageUrl: data.result_image_url,
            garmentType: data.garment_type,
            category: data.category,
            selectedSize: data.selected_size,
            selectedColor: data.selected_color,
            provider: data.provider,
            providerJobId: data.provider_job_id,
            status: data.status,
            stepDescription: data.step_description || '',
            progressPercent: data.progress_percent || 0,
            errorMessage: data.error_message,
            processingTimeMs: data.processing_time_ms || 0,
            createdAt: data.created_at,
            completedAt: data.completed_at,
            expiresAt: data.expires_at,
          };
          this.memoryStore.set(loaded.id, loaded);
          return loaded;
        }
      } catch (e) {
        console.warn('Supabase getJob fetch failed:', e);
      }
    }

    return null;
  }

  public async updateJob(jobId: string, updates: Partial<StoredTryOnJob>): Promise<StoredTryOnJob | null> {
    const existing = await this.getJob(jobId);
    if (!existing) return null;

    const merged: StoredTryOnJob = {
      ...existing,
      ...updates,
    };

    await this.saveJob(merged);
    return merged;
  }

  public async getStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    processing: number;
    avgTimeMs: number;
  }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('virtual_tryon_jobs').select('status, processing_time_ms');
        if (!error && Array.isArray(data)) {
          const total = data.length;
          const completed = data.filter((d) => d.status === 'completed').length;
          const failed = data.filter((d) => d.status === 'failed').length;
          const processing = data.filter((d) => d.status === 'processing' || d.status === 'queued').length;
          const times = data.filter((d) => d.status === 'completed' && d.processing_time_ms > 0).map((d) => d.processing_time_ms);
          const avgTimeMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
          return { total, completed, failed, processing, avgTimeMs };
        }
      } catch (_) {}
    }

    const all = Array.from(this.memoryStore.values());
    const total = all.length;
    const completed = all.filter((d) => d.status === 'completed').length;
    const failed = all.filter((d) => d.status === 'failed').length;
    const processing = all.filter((d) => d.status === 'processing' || d.status === 'queued').length;
    const times = all.filter((d) => d.status === 'completed' && d.processingTimeMs > 0).map((d) => d.processingTimeMs);
    const avgTimeMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    return { total, completed, failed, processing, avgTimeMs };
  }
}
