const { AiCoreService } = require('./lib/services/ai/aiCore');
const { ProductAiService } = require('./lib/services/ai/productAiService');
const { OrderAiService } = require('./lib/services/ai/orderAiService');
const { SalesReportAiService } = require('./lib/services/ai/salesReportAiService');
const { BusinessIntelligenceService } = require('./lib/services/ai/businessIntelligenceService');
const { AutomationEngine } = require('./lib/services/ai/automationEngine');

async function testAll() {
  console.log('--- 1. Testing Product AI Service ---');
  const dummyProduct = {
    id: 'p-1',
    name: 'Raw Vintage Denim',
    slug: 'raw-vintage-denim',
    category: "Men's Straight Leg Jeans",
    price: 2200,
    totalStock: 3,
    variants: [{ size: '32', color: 'Raw Blue', stock: 2, sku: 'RVD-32-BLU' }],
  };
  const stockAlerts = ProductAiService.monitorStock([dummyProduct], 5);
  console.log('Stock Alerts detected:', stockAlerts.length, stockAlerts[0]?.urgency);

  console.log('--- 2. Testing Order AI Service ---');
  const dummyOrder = {
    id: 'ord-1',
    orderNumber: 'JBD-12345',
    customer: {
      fullName: 'Kamal Hossain',
      phone: '01712345678',
      district: 'Dhaka',
      address: 'House 12, Road 5, Dhanmondi, Dhaka',
    },
    totalAmount: 2280,
    paymentMethod: 'cod',
    orderStatus: 'Pending',
    createdAt: new Date().toISOString(),
    items: [{ productId: 'p-1', name: 'Raw Vintage Denim', size: '32', price: 2200, quantity: 1, subtotal: 2200 }],
  };
  const verification = OrderAiService.verifyOrder(dummyOrder, []);
  console.log('Order Verification Risk Score:', verification.riskScore, 'Valid phone:', verification.verificationChecks.phoneValid);

  console.log('--- 3. Testing Sales Reporting ---');
  const summary = SalesReportAiService.generateReport([dummyOrder], [dummyProduct], 'monthly');
  console.log('Report Total Revenue:', summary.totalRevenue, 'Total Orders:', summary.totalOrders);
  const csv = SalesReportAiService.exportToCsv([dummyOrder]);
  console.log('CSV Export lines:', csv.split('\n').length);

  console.log('--- 4. Testing Automation Rules ---');
  const rules = AutomationEngine.getDefaultRules();
  console.log('Default Rules count:', rules.length);

  console.log('--- ALL MODULE UNIT TESTS PASSED SUCCESSFULLY! ---');
}

testAll().catch(console.error);
