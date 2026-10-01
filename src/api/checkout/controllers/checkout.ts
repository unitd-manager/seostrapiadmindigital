import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import { CheckoutServiceError } from '../services/checkout';

const respondToCheckoutError = (ctx: Context, error: unknown, fallbackMessage: string) => {
  if (error instanceof CheckoutServiceError) {
    ctx.throw(error.status, error.message);
  }

  strapi.log.error(fallbackMessage, error);
  ctx.throw(500, 'Checkout could not be started. Check the Strapi server logs and Stripe configuration.');
};

const controller: Core.Controller = {
  async createStripeSession(ctx: Context) {
    try {
      const payload = typeof ctx.request.body === 'object' && ctx.request.body ? ctx.request.body : {};
      const result = await strapi.service('api::checkout.checkout').createStripeSession(payload);
      ctx.body = { data: result };
    } catch (error) {
      respondToCheckoutError(ctx, error, 'Failed to create Stripe checkout session.');
    }
  },

  async verifyStripeSession(ctx: Context) {
    try {
      const payload = typeof ctx.request.body === 'object' && ctx.request.body ? ctx.request.body : {};
      const result = await strapi.service('api::checkout.checkout').verifyStripeSession(payload);
      ctx.body = { data: result };
    } catch (error) {
      respondToCheckoutError(ctx, error, 'Failed to verify Stripe checkout session.');
    }
  },

};

export default controller;
