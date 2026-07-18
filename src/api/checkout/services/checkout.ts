import crypto from 'crypto';
import axios from 'axios';
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

type VerifyPaymentPayload = {
  checkoutReference?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
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

const RAZORPAY_API_BASE_URL = 'https://api.razorpay.com/v1';

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

const getBackendBaseUrl = () => {
  const explicitUrl =
    process.env.STRAPI_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    process.env.BACKEND_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  const port = process.env.PORT || '1337';
  return `http://127.0.0.1:${port}`;
};

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const currency = process.env.RAZORPAY_CURRENCY || 'USD';

  return {
    keyId,
    keySecret,
    currency,
  };
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
  async createOrder(payload: CreateOrderPayload) {
    const { keyId, keySecret, currency } = getRazorpayConfig();

    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys are not configured in the backend environment.');
    }

    const customer = payload?.customer || {};
    const order = payload?.order || {};
    const items = Array.isArray(order.items) ? order.items : [];

    if (!customer.name?.trim() || !customer.email?.trim()) {
      throw new Error('Customer name and email are required.');
    }

    if (items.length === 0) {
      throw new Error('At least one checkout item is required.');
    }

    const pricingCards = await fetchPricingCardsFromHomePage();
    if (pricingCards.length === 0) {
      throw new Error('No pricing cards were found in the published home page.');
    }

    const resolvedItems: ResolvedCheckoutItem[] = items.map((item) => {
      const matchedCard = findMatchingPricingCard(pricingCards, item);

      if (!matchedCard) {
        throw new Error(`Could not match checkout item "${item.name || item.id || 'unknown'}" to CMS pricing.`);
      }

      const quantity = Math.max(1, Math.trunc(Number(item.quantity) || 1));
      const unitAmountMajor = parsePrice(matchedCard.price);
      if (unitAmountMajor <= 0) {
        throw new Error(`Invalid CMS price for "${(matchedCard.package_title || matchedCard.title) || 'package'}".`);
      }

      return {
        key: normalizePaymentKey(matchedCard.package_title || matchedCard.title),
        title: (matchedCard.package_title || matchedCard.title) || 'Package',
        quantity,
        unitAmountMajor,
        lineAmountMajor: unitAmountMajor * quantity,
        duration: (matchedCard.price_plan || matchedCard.duration) || 'mo',
      };
    });

    const totalAmountMajor = resolvedItems.reduce(
      (sum, item) => sum + item.lineAmountMajor,
      0
    );
    const amountMinor = toMinorUnits(totalAmountMajor);
    const checkoutReference = buildCheckoutReference();
    
    console.log('Checkout Service - Pricing Cards:', pricingCards);
    console.log('Checkout Service - Resolved Items:', resolvedItems);
    console.log('Checkout Service - Total Amount Major:', totalAmountMajor);
    console.log('Checkout Service - Amount Minor:', amountMinor);
    console.log('Checkout Service - Currency:', currency);

    const checkoutRecord = await strapi.documents('api::checkout-record.checkout-record').create({
      data: {
        checkoutReference,
        provider: 'razorpay',
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

    const razorpayResponse = await axios.post(
      `${RAZORPAY_API_BASE_URL}/orders`,
      {
        amount: amountMinor,
        currency,
        receipt: checkoutReference,
        notes: {
          checkoutReference,
          customerEmail: customer.email.trim(),
          customerName: customer.name.trim(),
        },
      },
      {
        auth: {
          username: keyId,
          password: keySecret,
        },
      }
    );

    const razorpayOrder = razorpayResponse.data;

    await strapi.documents('api::checkout-record.checkout-record').update({
      documentId: checkoutRecord.documentId,
      data: {
        status: 'order_created',
        razorpayOrderId: razorpayOrder.id,
        gatewayOrderPayload: razorpayOrder,
      },
    });

    return {
      checkoutReference,
      recordId: checkoutRecord.documentId,
      key: keyId,
      currency,
      amount: amountMinor,
      amountMajor: totalAmountMajor,
      orderId: razorpayOrder.id,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        company: customer.company?.trim() || '',
        country: customer.country?.trim() || '',
      },
      items: resolvedItems,
    };
  },

  async verifyPayment(payload: VerifyPaymentPayload) {
    const { keySecret } = getRazorpayConfig();

    if (!keySecret) {
      throw new Error('Razorpay secret is not configured in the backend environment.');
    }

    const checkoutReference = payload.checkoutReference?.trim();
    const razorpayOrderId = payload.razorpay_order_id?.trim();
    const razorpayPaymentId = payload.razorpay_payment_id?.trim();
    const razorpaySignature = payload.razorpay_signature?.trim();

    if (!checkoutReference || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('Missing Razorpay verification payload.');
    }

    const records = await strapi.documents('api::checkout-record.checkout-record').findMany({
      filters: {
        checkoutReference,
      },
      pagination: {
        page: 1,
        pageSize: 1,
      },
    });

    const checkoutRecord = Array.isArray(records) ? records[0] : null;
    if (!checkoutRecord) {
      throw new Error('Checkout record not found.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await strapi.documents('api::checkout-record.checkout-record').update({
        documentId: checkoutRecord.documentId,
        data: {
          status: 'verification_failed',
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId,
          razorpaySignature,
          gatewayVerifyPayload: payload,
          errorMessage: 'Invalid Razorpay signature.',
        },
      });

      throw new Error('Razorpay signature verification failed.');
    }

    const paymentResponse = await axios.get(
      `${RAZORPAY_API_BASE_URL}/payments/${encodeURIComponent(razorpayPaymentId)}`,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID || '',
          password: keySecret,
        },
      }
    );

    const paymentPayload = paymentResponse.data;

    await strapi.documents('api::checkout-record.checkout-record').update({
      documentId: checkoutRecord.documentId,
      data: {
        status: 'paid',
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature,
        gatewayVerifyPayload: paymentPayload,
        verifiedAt: new Date().toISOString(),
        errorMessage: '',
      },
    });

    return {
      verified: true,
      checkoutReference,
      razorpayOrderId,
      razorpayPaymentId,
      amountMinor: checkoutRecord.amountMinor,
      amountMajor: checkoutRecord.amountMajor,
      currency: checkoutRecord.currency,
      items: checkoutRecord.items || [],
      customerName: checkoutRecord.customerName || '',
      customerEmail: checkoutRecord.customerEmail || '',
    };
  },
});
