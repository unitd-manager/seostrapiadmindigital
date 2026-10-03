import crypto from 'crypto';
import Stripe from 'stripe';
import type { Core } from '@strapi/strapi';

type CheckoutCustomer = {
  name?: string;
  email?: string;
  company?: string;
  country?: string;
};

type CheckoutItemInput = {
  id?: string;
  name?: string;
  quantity?: number;
};

type CreateOrderPayload = {
  customer?: CheckoutCustomer;
  order?: {
    items?: CheckoutItemInput[];
    sourcePage?: string;
    successUrl?: string;
    cancelUrl?: string;
  };
};

type VerifyStripeSessionPayload = {
  checkoutReference?: string;
  sessionId?: string;
};

type PricingCard = {
  package_title?: string;
  package_subtitle?: string;
  price?: string;
  price_plan?: string;
};

type ResolvedCheckoutItem = {
  key: string;
  title: string;
  quantity: number;
  unitAmountMajor: number;
  lineAmountMajor: number;
  duration: string;
};

export class CheckoutServiceError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'CheckoutServiceError';
  }
}

const normalizePaymentKey = (value?: string | null) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-\d+$/, '');

const parsePrice = (value?: string | number | null) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
};

const toMinorUnits = (amountMajor: number) => Math.round(amountMajor * 100);

const buildCheckoutReference = () => {
  const randomPart = crypto.randomBytes(4).toString('hex');
  return `chk_${Date.now()}_${randomPart}`;
};

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    throw new CheckoutServiceError('Stripe is not configured on the server. Set STRIPE_SECRET_KEY in the Strapi backend environment.', 503);
  }
  return new Stripe(secretKey);
};

const getStripeInterval = (duration: string) => {
  const normalized = duration.trim().toLowerCase();
  if (/one[- ]?(time|off)|once|lifetime|single[- ]?payment/.test(normalized)) return null;
  if (/year|annual|annually|\byr\b/.test(normalized)) return 'year' as const;
  if (/week|weekly|\bwk\b/.test(normalized)) return 'week' as const;
  if (/day|daily/.test(normalized)) return 'day' as const;
  return 'month' as const;
};

const getSafeReturnUrl = (value: string, checkoutReference: string, sessionId = false) => {
  let returnUrl: URL;
  try {
    returnUrl = new URL(value);
  } catch {
    throw new Error('Checkout success and cancel URLs must be absolute URLs.');
  }
  if (!['http:', 'https:'].includes(returnUrl.protocol)) {
    throw new Error('Checkout return URL must use HTTP or HTTPS.');
  }
  returnUrl.searchParams.set('checkout_reference', checkoutReference);
  if (!sessionId) return returnUrl.toString();

  const hashIndex = returnUrl.href.indexOf('#');
  const hash = hashIndex === -1 ? '' : returnUrl.href.slice(hashIndex);
  const baseUrl = hashIndex === -1 ? returnUrl.href : returnUrl.href.slice(0, hashIndex);
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}${hash}`;
};

const extractPricingCards = (pageBuilder: any[] = []) => {
  // Try new component first
  let pricingSection = pageBuilder.find(
    (component) => component?.__component === 'acf-sections.package-card-section'
  );
  
  if (pricingSection && Array.isArray(pricingSection.package_cards)) {
    return pricingSection.package_cards;
  }

  // Fall back to old component
  pricingSection = pageBuilder.find(
    (component) => component?.__component === 'acf-sections.home-featured-case-study'
  );
  
  if (pricingSection && Array.isArray(pricingSection.pricing_cards)) {
    return pricingSection.pricing_cards;
  }
  
  return [];
};

const createLookupCandidates = (item: CheckoutItemInput) => {
  return [item.id, item.name]
    .map((value) => normalizePaymentKey(value))
    .filter(Boolean);
};

const findMatchingPricingCard = (cards: any[], item: CheckoutItemInput) => {
  const lookupCandidates = createLookupCandidates(item);

  return cards.find((card) => {
    const cardCandidates = [
      normalizePaymentKey(card.package_title || card.title),
      normalizePaymentKey(card.package_subtitle || card.subtitle),
    ].filter(Boolean);

    return lookupCandidates.some((candidate) => cardCandidates.includes(candidate));
  });
};

const fetchPricingCardsFromHomePage = async () => {
  // Use Strapi's internal entity service instead of axios!
  const pages = await strapi.documents('api::page.page').findMany({
    filters: { slug: { $eq: 'home' } },
    populate: {
      pageBuilder: {
        populate: '*',
      },
    },
  });

  const page = pages?.[0];
  return extractPricingCards(page?.pageBuilder);
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async createStripeSession(payload: CreateOrderPayload) {
    const stripe = getStripeClient();
    const customer = payload?.customer || {};
    const order = payload?.order || {};
    const items = Array.isArray(order.items) ? order.items : [];

    if (!customer.name?.trim() || !customer.email?.trim()) {
      throw new CheckoutServiceError('Customer name and email are required.', 400);
    }
    if (items.length === 0) throw new CheckoutServiceError('At least one checkout item is required.', 400);
    if (!order.successUrl || !order.cancelUrl) {
      throw new CheckoutServiceError('Checkout success and cancel URLs are required.', 400);
    }

    const pricingCards = await fetchPricingCardsFromHomePage();
    if (pricingCards.length === 0) {
      throw new CheckoutServiceError('No pricing cards were found in the published home page.', 503);
    }

    const resolvedItems: ResolvedCheckoutItem[] = items.map((item) => {
      const matchedCard = findMatchingPricingCard(pricingCards, item);
      if (!matchedCard) {
        throw new CheckoutServiceError(`Could not match checkout item "${item.name || item.id || 'unknown'}" to CMS pricing.`, 400);
      }
      const quantity = Math.max(1, Math.trunc(Number(item.quantity) || 1));
      const unitAmountMajor = parsePrice(matchedCard.price);
      if (unitAmountMajor <= 0) {
        throw new CheckoutServiceError(`Invalid CMS price for "${(matchedCard.package_title || matchedCard.title) || 'package'}".`, 400);
      }
      return {
        key: normalizePaymentKey(matchedCard.package_title || matchedCard.title),
        title: (matchedCard.package_title || matchedCard.title) || 'Package',
        quantity,
        unitAmountMajor,
        lineAmountMajor: unitAmountMajor * quantity,
        duration: (matchedCard.price_plan || matchedCard.duration) || 'monthly',
      };
    });

    const intervals = resolvedItems.map((item) => getStripeInterval(item.duration));
    if (intervals.some((interval) => interval !== intervals[0])) {
      throw new CheckoutServiceError('One Stripe checkout cannot mix recurring and one-time packages.', 400);
    }

    const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    const checkoutReference = buildCheckoutReference();
    const totalAmountMajor = resolvedItems.reduce((sum, item) => sum + item.lineAmountMajor, 0);
    const amountMinor = toMinorUnits(totalAmountMajor);
    const checkoutRecord = await strapi.documents('api::checkout-record.checkout-record').create({
      data: {
        checkoutReference,
        provider: 'stripe',
        status: 'initiated',
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim(),
        customerCompany: customer.company?.trim() || '',
        customerCountry: customer.country?.trim() || '',
        currency,
        amountMajor: totalAmountMajor.toFixed(2),
        amountMinor,
        itemCount: resolvedItems.reduce((sum, item) => sum + item.quantity, 0),
        items: resolvedItems,
        sourcePage: order.sourcePage || 'home',
        source: 'website',
        rawRequest: payload,
      },
    });

    const isSubscription = intervals[0] !== null;
    let session: Stripe.Response<Stripe.Checkout.Session>;
    try {
      session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      customer_email: customer.email.trim(),
      client_reference_id: checkoutReference,
      success_url: getSafeReturnUrl(order.successUrl, checkoutReference, true),
      cancel_url: getSafeReturnUrl(order.cancelUrl, checkoutReference),
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: {
        checkoutReference,
        customerName: customer.name.trim(),
        company: customer.company?.trim() || '',
        country: customer.country?.trim() || '',
      },
      ...(isSubscription ? { subscription_data: { metadata: { checkoutReference } } } : {}),
      line_items: resolvedItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency,
          unit_amount: toMinorUnits(item.unitAmountMajor),
          product_data: { name: item.title },
          ...(isSubscription ? { recurring: { interval: intervals[0]! } } : {}),
        },
      })),
      });
    } catch (error) {
      strapi.log.error('Stripe Checkout Session creation failed', error);
      throw new CheckoutServiceError(
        'Stripe could not create checkout. Verify the backend Stripe key, currency, and account configuration.',
        502,
      );
    }

    if (!session.url) throw new CheckoutServiceError('Stripe did not return a checkout URL.', 502);

    await strapi.documents('api::checkout-record.checkout-record').update({
      documentId: checkoutRecord.documentId,
      data: {
        status: 'checkout_session_created',
        stripeCheckoutSessionId: session.id,
        gatewayOrderPayload: { id: session.id, mode: session.mode, url: session.url },
      },
    });
    return { checkoutReference, sessionId: session.id, url: session.url };
  },

  async verifyStripeSession(payload: VerifyStripeSessionPayload) {
    const stripe = getStripeClient();
    const checkoutReference = payload.checkoutReference?.trim();
    const sessionId = payload.sessionId?.trim();
    if (!checkoutReference || !sessionId) {
      throw new CheckoutServiceError('Checkout reference and Stripe session ID are required.', 400);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.checkoutReference !== checkoutReference || session.client_reference_id !== checkoutReference) {
      throw new Error('Stripe session does not match this checkout.');
    }
    const records = await strapi.documents('api::checkout-record.checkout-record').findMany({
      filters: { checkoutReference, provider: 'stripe', stripeCheckoutSessionId: sessionId },
      populate: { items: true },
      pagination: { page: 1, pageSize: 1 },
    });
    const checkoutRecord = Array.isArray(records) ? records[0] : null;
    if (!checkoutRecord) throw new Error('Stripe checkout record not found.');
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      throw new Error('Stripe has not confirmed payment for this checkout.');
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || '';
    await strapi.documents('api::checkout-record.checkout-record').update({
      documentId: checkoutRecord.documentId,
      data: {
        status: 'paid',
        stripePaymentIntentId: paymentIntentId,
        gatewayVerifyPayload: { id: session.id, payment_status: session.payment_status, payment_intent: paymentIntentId },
        verifiedAt: new Date().toISOString(),
        errorMessage: '',
      },
    });

    return {
      verified: true,
      checkoutReference,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      amountMinor: session.amount_total ?? checkoutRecord.amountMinor,
      amountMajor: session.amount_total !== null ? session.amount_total / 100 : checkoutRecord.amountMajor,
      currency: session.currency || checkoutRecord.currency,
      items: checkoutRecord.items || [],
      customerName: checkoutRecord.customerName || '',
      customerEmail: checkoutRecord.customerEmail || '',
    };
  },
});
