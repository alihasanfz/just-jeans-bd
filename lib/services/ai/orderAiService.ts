/**
 * Jeans BD — AI Order Management & Verification Service
 * 
 * Provides:
 * 1. Intelligent Order Verification (Bangladesh Mobile validation, district matching, fake/bogus order score)
 * 2. Pending Orders Triage & Prioritization
 * 3. Delivery Delay Detection & Alerts
 * 4. Cancellation & Return Root-Cause Analysis
 * 5. Automated Customer Notification Generator (SMS, WhatsApp, Email in Bangla & English)
 */

import { Order } from '@/types';
import { AiCoreService } from './aiCore';

export interface OrderVerificationResult {
  orderId: string;
  orderNumber: string;
  isVerified: boolean;
  riskScore: number; // 0 (safest) to 100 (highest risk)
  riskLevel: 'low' | 'medium' | 'high';
  verificationChecks: {
    phoneValid: boolean;
    phoneOperator?: string;
    phoneIssue?: string;
    addressComplete: boolean;
    addressIssue?: string;
    districtRecognized: boolean;
    highValueCodWarning: boolean;
    duplicateOrderRisk: boolean;
  };
  recommendation: 'auto_approve' | 'call_customer' | 'hold_for_inspection' | 'reject_suspicious';
  adminNotesBn: string;
  adminNotesEn: string;
}

export interface DeliveryDelayAlert {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  district: string;
  courierName?: string;
  trackingNumber?: string;
  daysSinceCreation: number;
  orderStatus: string;
  isDelayed: boolean;
  delayReason: string;
  delaySeverity: 'normal' | 'moderate' | 'critical';
  suggestedAction: string;
}

export interface CustomerNotificationCopies {
  orderNumber: string;
  channel: 'sms' | 'whatsapp' | 'email';
  eventType: 'order_confirmed' | 'dispatched' | 'out_for_delivery' | 'delayed' | 'delivered';
  messageBn: string;
  messageEn: string;
  emailSubject?: string;
}

// 64 districts of Bangladesh for verification
const BANGLADESH_DISTRICTS = new Set([
  'dhaka', 'faridpur', 'gazipur', 'gopalganj', 'kishoreganj', 'madaripur', 'manikganj', 'munshiganj', 'narayanganj', 'narsingdi', 'rajbari', 'shariatpur', 'tangail',
  'chattogram', 'chittagong', 'cox\'s bazar', 'cumilla', 'comilla', 'feni', 'khagrachhari', 'lakshmipur', 'noakhali', 'rangamati', 'brahmanbaria', 'chandpur',
  'rajshahi', 'bogura', 'bogra', 'joypurhat', 'naogaon', 'natore', 'chapai nawabganj', 'pabna', 'sirajganj',
  'khulna', 'bagerhat', 'chuadanga', 'jashore', 'jessore', 'jhenaidah', 'kushtia', 'magura', 'meherpur', 'narail', 'satkhira',
  'barishal', 'barisal', 'barguna', 'bhola', 'jhalokati', 'patuakhali', 'pirojpur',
  'sylhet', 'habiganj', 'moulvibazar', 'sunamganj',
  'rangpur', 'dinajpur', 'gaibandha', 'kurigram', 'lalmonirhat', 'nilphamari', 'panchagarh', 'thakurgaon',
  'mymensingh', 'jamalpur', 'netrokona', 'sherpur'
]);

export class OrderAiService {
  /**
   * Performs automated order verification and risk scoring
   */
  public static verifyOrder(order: Order, allOrders?: Order[]): OrderVerificationResult {
    let riskScore = 0;
    const checks = {
      phoneValid: false,
      phoneOperator: '',
      phoneIssue: undefined as string | undefined,
      addressComplete: false,
      addressIssue: undefined as string | undefined,
      districtRecognized: false,
      highValueCodWarning: false,
      duplicateOrderRisk: false,
    };

    const phone = (order.customer?.phone || '').replace(/[\s-]/g, '');
    const cleanPhone = phone.startsWith('+880') ? phone.replace('+880', '0') : phone.startsWith('880') ? phone.replace('880', '0') : phone;

    // 1. Phone validation
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (bdPhoneRegex.test(cleanPhone)) {
      checks.phoneValid = true;
      const prefix = cleanPhone.substring(0, 3);
      if (prefix === '017' || prefix === '013') checks.phoneOperator = 'Grameenphone';
      else if (prefix === '018') checks.phoneOperator = 'Robi';
      else if (prefix === '019' || prefix === '014') checks.phoneOperator = 'Banglalink';
      else if (prefix === '015') checks.phoneOperator = 'Teletalk';
      else if (prefix === '016') checks.phoneOperator = 'Airtel';
    } else {
      checks.phoneValid = false;
      checks.phoneIssue = 'Invalid Bangladesh mobile format (must be 11 digits starting with 013-019).';
      riskScore += 45;
    }

    // 2. Address completeness
    const addr = (order.customer?.address || '').trim();
    if (addr.length < 10) {
      checks.addressComplete = false;
      checks.addressIssue = 'Address is too short or lacks road/house/thana detail.';
      riskScore += 30;
    } else {
      checks.addressComplete = true;
    }

    // 3. District recognition
    const dist = (order.customer?.district || '').toLowerCase().trim();
    if (BANGLADESH_DISTRICTS.has(dist)) {
      checks.districtRecognized = true;
    } else {
      checks.districtRecognized = false;
      riskScore += 15;
    }

    // 4. High-value COD warning
    if (order.paymentMethod === 'cod' && order.totalAmount > 6000) {
      checks.highValueCodWarning = true;
      riskScore += 20;
    }

    // 5. Duplicate order checking (same phone within 2 hours)
    if (allOrders && allOrders.length > 0) {
      const recentDuplicates = allOrders.filter((o) => {
        if (o.id === order.id) return false;
        const oPhone = (o.customer?.phone || '').replace(/[\s-]/g, '');
        if (oPhone !== phone) return false;
        const diffMs = Math.abs(new Date(order.createdAt).getTime() - new Date(o.createdAt).getTime());
        return diffMs < 1000 * 60 * 120; // 2 hours
      });

      if (recentDuplicates.length > 0) {
        checks.duplicateOrderRisk = true;
        riskScore += 35;
      }
    }

    // Cap risk score at 100
    riskScore = Math.min(100, riskScore);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let recommendation: OrderVerificationResult['recommendation'] = 'auto_approve';
    let notesBn = 'অর্ডার সম্পূর্ণ নির্ভুল এবং ভেরিফাইড। সরাসরি কনফার্ম ও ডিসপ্যাচ করা যাবে।';
    let notesEn = 'Order details verified successfully. Safe for automated fulfillment.';

    if (riskScore >= 60) {
      riskLevel = 'high';
      recommendation = checks.phoneValid ? 'hold_for_inspection' : 'reject_suspicious';
      notesBn = 'সতর্কতা: উচ্চ ঝুঁকি শনাক্ত হয়েছে! ফোন নম্বর বা ঠিকানা অসম্পূর্ণ। গ্রাহককে কল করে নিশ্চিত না করা পর্যন্ত পার্সেল পাঠাবেন না।';
      notesEn = 'High risk: Incomplete address or invalid phone number. Call customer before dispatching.';
    } else if (riskScore >= 25) {
      riskLevel = 'medium';
      recommendation = 'call_customer';
      notesBn = 'মাঝারি ঝুঁকি: ক্যাশ অন ডেলিভারি নিশ্চিত করতে একবার ফোনে যোগাযোগ করুন।';
      notesEn = 'Moderate risk: Recommended to confirm order details via quick confirmation phone call.';
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      isVerified: riskScore < 25,
      riskScore,
      riskLevel,
      verificationChecks: checks,
      recommendation,
      adminNotesBn: notesBn,
      adminNotesEn: notesEn,
    };
  }

  /**
   * Scans orders to identify stuck deliveries or shipping bottlenecks
   */
  public static detectDeliveryDelays(orders: Order[]): DeliveryDelayAlert[] {
    const alerts: DeliveryDelayAlert[] = [];
    const now = Date.now();

    for (const order of orders) {
      // Ignore delivered or cancelled orders
      const st = (order.orderStatus || '').toLowerCase();
      if (st === 'delivered' || st === 'cancelled' || st === 'returned') continue;

      const orderTime = new Date(order.createdAt).getTime();
      const hoursSince = (now - orderTime) / (1000 * 60 * 60);
      const daysSince = Math.floor(hoursSince / 24);

      let isDelayed = false;
      let reason = '';
      let severity: 'normal' | 'moderate' | 'critical' = 'normal';
      let action = 'Normal dispatch progression.';

      if (st === 'pending' && hoursSince > 24) {
        isDelayed = true;
        severity = hoursSince > 48 ? 'critical' : 'moderate';
        reason = `Pending order has not been confirmed for ${Math.round(hoursSince)} hours.`;
        action = 'Call customer immediately to verify and assign to Steadfast/Pathao courier.';
      } else if ((st === 'confirmed' || st === 'processing') && hoursSince > 48) {
        isDelayed = true;
        severity = 'critical';
        reason = `Order is in processing for ${daysSince} days without courier handover.`;
        action = 'Hand over parcel to courier hub and print consignment label.';
      } else if (st === 'shipped' && hoursSince > 120) {
        // > 5 days in transit
        isDelayed = true;
        severity = 'critical';
        reason = `Parcel in transit for ${daysSince} days. Potential courier delay at delivery hub.`;
        action = `Check ${order.delivery?.courierCompany || 'Courier'} tracking (${order.delivery?.trackingNumber || 'N/A'}) and notify customer.`;
      }

      if (isDelayed) {
        alerts.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.fullName || 'Customer',
          phone: order.customer?.phone || '',
          district: order.customer?.district || 'Dhaka',
          courierName: order.delivery?.courierCompany,
          trackingNumber: order.delivery?.trackingNumber,
          daysSinceCreation: daysSince,
          orderStatus: order.orderStatus,
          isDelayed,
          delayReason: reason,
          delaySeverity: severity,
          suggestedAction: action,
        });
      }
    }

    return alerts.sort((a, b) => (b.delaySeverity === 'critical' ? 1 : -1));
  }

  /**
   * Generates bilingual customer notification message copy
   */
  public static generateNotificationCopy(
    order: Order,
    eventType: CustomerNotificationCopies['eventType'],
    channel: CustomerNotificationCopies['channel'] = 'sms'
  ): CustomerNotificationCopies {
    const customerName = order.customer?.fullName?.split(' ')[0] || 'গ্রাহক';
    const orderNumber = order.orderNumber;
    const total = `৳${order.totalAmount}`;
    const courier = order.delivery?.courierCompany || 'Steadfast Courier';
    const tracking = order.delivery?.trackingNumber || '';

    let bn = '';
    let en = '';
    let subject = '';

    switch (eventType) {
      case 'order_confirmed':
        bn = `প্রিয় ${customerName}, Jeans BD-তে আপনার অর্ডারটি (${orderNumber}) সফলভাবে কনফার্ম হয়েছে। মোট মূল্য: ${total}। খুব শীঘ্রই পার্সেলটি কুরিয়ারে পাঠানো হবে। ধন্যবাদ!`;
        en = `Dear ${customerName}, your Jeans BD order #${orderNumber} is confirmed! Total: ${total}. We are preparing your premium denim for dispatch. Thank you!`;
        subject = `Order Confirmation #${orderNumber} — Jeans BD`;
        break;

      case 'dispatched':
        bn = `প্রিয় ${customerName}, আপনার Jeans BD অর্ডার #${orderNumber} ${courier}-এ হ্যান্ডওভার করা হয়েছে। ট্র্যাকিং কোড: ${tracking || 'SMS মাধ্যমে পাবেন'}। ১-৩ কার্যদিবসের মধ্যে ডেলিভারি পাবেন।`;
        en = `Great news! Your Jeans BD order #${orderNumber} has been dispatched via ${courier}. Tracking ID: ${tracking || 'will be sent via SMS'}. Delivery in 1-3 business days.`;
        subject = `Your Jeans BD Parcel has Shipped! #${orderNumber}`;
        break;

      case 'delayed':
        bn = `প্রিয় ${customerName}, কুরিয়ার জ্যামের কারণে আপনার অর্ডার #${orderNumber} পৌঁছাতে কিছুটা বিলম্ব হচ্ছে। আমাদের টিম দ্রুত ডেলিভারির জন্য কাজ করছে। সাময়িক অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।`;
        en = `Dear ${customerName}, delivery of your order #${orderNumber} is experiencing a slight courier delay. We are actively expediting it with the courier hub. We apologize for the inconvenience.`;
        subject = `Update regarding your Jeans BD Delivery #${orderNumber}`;
        break;

      case 'out_for_delivery':
        bn = `প্রিয় ${customerName}, আপনার অর্ডার #${orderNumber} আজ ডেলিভারি হবে। কুরিয়ার রাইডার আপনার সাথে ফোনে যোগাযোগ করবে। অনুগ্রহ করে ${total} প্রস্তুত রাখুন। - Jeans BD`;
        en = `Hello ${customerName}, order #${orderNumber} is OUT FOR DELIVERY today! Please keep ${total} ready for the rider. - Jeans BD`;
        subject = `Out for Delivery Today! #${orderNumber} — Jeans BD`;
        break;

      case 'delivered':
        bn = `প্রিয় ${customerName}, আপনার Jeans BD অর্ডার #${orderNumber} সফলভাবে ডেলিভারি হয়েছে। আমাদের জিন্স আপনার পছন্দ হলে ৫-স্টার রিভিউ দিতে ভুলবেন না! শুভকামনা।`;
        en = `Thank you ${customerName}! Your Jeans BD order #${orderNumber} has been delivered. We hope you love the fit! Feel free to share your feedback.`;
        subject = `Order Delivered! How was your Jeans BD experience?`;
        break;
    }

    return {
      orderNumber,
      channel,
      eventType,
      messageBn: bn,
      messageEn: en,
      emailSubject: subject,
    };
  }
}
