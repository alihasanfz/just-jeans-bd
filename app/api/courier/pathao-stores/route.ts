import { NextRequest, NextResponse } from 'next/server';
import { loadServerCourierSettings } from '@/lib/services/courier/courierService';
import { getPathaoStores } from '@/lib/services/courier/pathao';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const current = await loadServerCourierSettings();

    const creds = {
      clientId: body?.clientId || current.pathao.clientId,
      clientSecret: body?.clientSecret || current.pathao.clientSecret,
      username: body?.username || current.pathao.username,
      password: body?.password || current.pathao.password,
      isSandbox: body?.isSandbox !== undefined ? body.isSandbox : current.pathao.isSandbox,
    };

    const res = await getPathaoStores(creds);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch Pathao stores' },
      { status: 500 }
    );
  }
}
