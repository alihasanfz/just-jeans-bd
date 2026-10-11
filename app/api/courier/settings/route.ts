import { NextRequest, NextResponse } from 'next/server';
import { loadServerCourierSettings, saveServerCourierSettings } from '@/lib/services/courier/courierService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await loadServerCourierSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch courier settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await saveServerCourierSettings(body);

    if (result.success) {
      const updated = await loadServerCourierSettings();
      return NextResponse.json({
        success: true,
        message: 'Courier API settings updated successfully!',
        settings: updated,
      });
    }

    return NextResponse.json(
      { success: false, message: result.message || 'Failed to save settings' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Invalid request body' },
      { status: 500 }
    );
  }
}
