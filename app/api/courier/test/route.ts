import { NextRequest, NextResponse } from 'next/server';
import { loadServerCourierSettings, saveServerCourierSettings } from '@/lib/services/courier/courierService';
import { testSteadfastConnection } from '@/lib/services/courier/steadfast';
import { testPathaoConnection } from '@/lib/services/courier/pathao';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, creds } = body;

    const current = await loadServerCourierSettings();

    if (provider === 'steadfast') {
      const apiKey = creds?.apiKey || current.steadfast.apiKey;
      const secretKey = creds?.secretKey || current.steadfast.secretKey;
      const baseUrl = creds?.baseUrl || current.steadfast.baseUrl;

      const result = await testSteadfastConnection(apiKey, secretKey, baseUrl);

      // Record test result in DB
      await saveServerCourierSettings({
        lastTested: {
          ...current.lastTested,
          steadfast: {
            success: result.success,
            message: result.message,
            timestamp: new Date().toISOString(),
            balance: result.balance,
          },
        },
      });

      return NextResponse.json(result);
    }

    if (provider === 'pathao') {
      const pathaoCreds = {
        clientId: creds?.clientId || current.pathao.clientId,
        clientSecret: creds?.clientSecret || current.pathao.clientSecret,
        username: creds?.username || current.pathao.username,
        password: creds?.password || current.pathao.password,
        isSandbox: creds?.isSandbox !== undefined ? creds.isSandbox : current.pathao.isSandbox,
      };

      const result = await testPathaoConnection(pathaoCreds);

      // Record test result in DB
      await saveServerCourierSettings({
        lastTested: {
          ...current.lastTested,
          pathao: {
            success: result.success,
            message: result.message,
            timestamp: new Date().toISOString(),
            storeCount: result.storeCount,
          },
        },
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: 'Invalid courier provider requested.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error executing connection test.' },
      { status: 500 }
    );
  }
}
