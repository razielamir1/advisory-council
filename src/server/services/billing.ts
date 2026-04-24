/**
 * Phase 4 billing abstraction. Keeps Phase 4 provider choice (LemonSqueezy first,
 * Cardcom + Green Invoice later at ~300 paying users) behind a single interface.
 *
 * Not wired into the server yet — this file defines the shape so Phase 4 code
 * can slot in without touching discussion routes. Enabling billing requires:
 * 1. Implementing a concrete provider (LemonSqueezyProvider)
 * 2. Registering a webhook route in src/server/routes/webhooks/
 * 3. Extending the users table if new subscription fields are needed
 */

export type BillingEvent =
  | { type: 'subscription_created'; subscriptionId: string; userEmail: string; currentPeriodEnd: Date }
  | { type: 'subscription_updated'; subscriptionId: string; currentPeriodEnd: Date }
  | { type: 'subscription_cancelled'; subscriptionId: string; effectiveAt: Date }
  | { type: 'subscription_payment_failed'; subscriptionId: string }
  | { type: 'subscription_payment_success'; subscriptionId: string; currentPeriodEnd: Date };

export interface BillingProvider {
  readonly name: 'lemonsqueezy' | 'cardcom' | 'noop';

  createCheckoutUrl(input: { userId: string; email: string; plan: string }): Promise<string>;

  verifyWebhook(rawBody: string, signature: string): boolean;

  parseWebhookEvent(payload: unknown): BillingEvent | null;

  cancelSubscription(subscriptionId: string): Promise<void>;
}

// Noop provider = billing disabled. Used until a concrete provider is wired up.
class NoopBillingProvider implements BillingProvider {
  readonly name = 'noop' as const;
  async createCheckoutUrl(): Promise<string> {
    throw new Error('Billing is not configured yet.');
  }
  verifyWebhook(): boolean {
    return false;
  }
  parseWebhookEvent(): BillingEvent | null {
    return null;
  }
  async cancelSubscription(): Promise<void> {
    throw new Error('Billing is not configured yet.');
  }
}

let provider: BillingProvider = new NoopBillingProvider();

export function getBillingProvider(): BillingProvider {
  return provider;
}

export function registerBillingProvider(p: BillingProvider): void {
  provider = p;
}

export function isBillingEnabled(): boolean {
  return provider.name !== 'noop';
}
