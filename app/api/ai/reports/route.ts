import { NextRequest, NextResponse } from 'next/server';
import { SalesReportAiService } from '@/lib/services/ai/salesReportAiService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const period = (searchParams.get('period') as any) || 'monthly';

    const body = await req.json();
    const orders = body.orders || [];
    const products = body.products || [];

    const summary = SalesReportAiService.generateReport(orders, products, period);

    if (format === 'csv') {
      const csv = SalesReportAiService.exportToCsv(orders);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="jeansbd_sales_report_${period}_${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'excel') {
      const excelXml = SalesReportAiService.exportToExcelHtml(orders, summary);
      return new NextResponse(excelXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="jeansbd_sales_report_${period}_${Date.now()}.xls"`,
        },
      });
    }

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('API /api/ai/reports error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Report generation error' }, { status: 500 });
  }
}
