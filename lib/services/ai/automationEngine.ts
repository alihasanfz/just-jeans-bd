/**
 * Jeans BD — Smart Automation Engine & Governance
 * 
 * Provides:
 * 1. Automation Rules Engine (Toggles, conditions, and thresholds)
 * 2. Sensitive Action Approval Queue (Price changes, order cancellations, refunds)
 * 3. Security & Activity Audit Logging
 * 4. Automated Event Handlers
 */

export interface AutomationRuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'orders' | 'inventory' | 'notifications' | 'pricing';
  lastTriggered?: string;
}

export interface PendingApprovalAction {
  id: string;
  actionType: 'price_change' | 'order_cancellation' | 'customer_refund' | 'product_deletion';
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: string;
  targetId: string;
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface ActivityAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: 'product' | 'order' | 'automation' | 'setting' | 'support';
  details: string;
  ipAddress?: string;
}

export class AutomationEngine {
  private static readonly RULES_KEY = 'jeansbd_ai_automation_rules';
  private static readonly APPROVALS_KEY = 'jeansbd_ai_pending_approvals';
  private static readonly AUDIT_KEY = 'jeansbd_ai_audit_logs';

  public static getDefaultRules(): AutomationRuleConfig[] {
    return [
      {
        id: 'rule_auto_order_verify',
        name: 'Auto-Verify Clean COD Orders',
        description: 'Automatically flags low-risk orders (valid 11-digit mobile & complete address) as verified.',
        enabled: true,
        category: 'orders',
      },
      {
        id: 'rule_low_stock_radar',
        name: 'Continuous Low-Stock Radar',
        description: 'Sends real-time admin alert when any popular size variant falls below 5 units.',
        enabled: true,
        category: 'inventory',
      },
      {
        id: 'rule_delivery_delay_watcher',
        name: 'Courier Delay Watchdog',
        description: 'Flags parcels stuck in transit over 48 hours and drafts customer apology notification.',
        enabled: true,
        category: 'orders',
      },
      {
        id: 'rule_auto_sms_dispatch',
        name: 'Instant Dispatch Notification Draft',
        description: 'Automatically prepares SMS and WhatsApp tracking notification upon courier handover.',
        enabled: true,
        category: 'notifications',
      },
      {
        id: 'rule_price_protection_gate',
        name: 'Price Protection Approval Gate',
        description: 'Requires Super Admin confirmation before any product price drop greater than 15%.',
        enabled: true,
        category: 'pricing',
      },
    ];
  }

  public static getRules(): AutomationRuleConfig[] {
    if (typeof window === 'undefined') return this.getDefaultRules();
    try {
      const stored = localStorage.getItem(this.RULES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return this.getDefaultRules();
  }

  public static saveRules(rules: AutomationRuleConfig[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.RULES_KEY, JSON.stringify(rules));
      } catch (e) {
        console.error('Failed to save automation rules', e);
      }
    }
  }

  public static toggleRule(ruleId: string, enabled: boolean): AutomationRuleConfig[] {
    const rules = this.getRules().map((r) => (r.id === ruleId ? { ...r, enabled } : r));
    this.saveRules(rules);
    return rules;
  }

  // Pending Approvals
  public static getApprovals(): PendingApprovalAction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.APPROVALS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'appr-101',
        actionType: 'order_cancellation',
        title: 'Cancel Order #JBD-49210',
        description: 'Customer requested cancellation due to wrong waist size selection.',
        requestedBy: 'support@jeansbd.com',
        requestedAt: new Date(Date.now() - 3600000).toISOString(),
        targetId: 'ord-49210',
        payload: { orderNumber: 'JBD-49210', refundAmount: 0 },
        status: 'pending',
      },
    ];
  }

  public static requestApproval(action: Omit<PendingApprovalAction, 'id' | 'requestedAt' | 'status'>): PendingApprovalAction {
    const newApproval: PendingApprovalAction = {
      ...action,
      id: `appr-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    if (typeof window !== 'undefined') {
      const current = this.getApprovals();
      const updated = [newApproval, ...current];
      localStorage.setItem(this.APPROVALS_KEY, JSON.stringify(updated));
    }
    return newApproval;
  }

  public static resolveApproval(
    approvalId: string,
    status: 'approved' | 'rejected',
    reviewerEmail: string,
    comment?: string
  ): PendingApprovalAction | null {
    if (typeof window === 'undefined') return null;
    const list = this.getApprovals();
    const idx = list.findIndex((a) => a.id === approvalId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status,
      reviewedBy: reviewerEmail,
      reviewedAt: new Date().toISOString(),
      reviewComment: comment,
    };

    localStorage.setItem(this.APPROVALS_KEY, JSON.stringify(list));
    return list[idx];
  }

  // Audit Logs
  public static logActivity(entry: Omit<ActivityAuditLog, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return;
    const newLog: ActivityAuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = this.getAuditLogs();
      const trimmed = [newLog, ...existing].slice(0, 100); // keep last 100 logs
      localStorage.setItem(this.AUDIT_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  public static getAuditLogs(): ActivityAuditLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.AUDIT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'log-seed-1',
        timestamp: new Date().toISOString(),
        actorEmail: 'hasansheikh9080@gmail.com',
        actorRole: 'Super Admin',
        action: 'AI Control Center Initialized',
        targetType: 'automation',
        details: 'Full AI Automation System online with Gemini Engine & database synchronization.',
      },
    ];
  }
}
