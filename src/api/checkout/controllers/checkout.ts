import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

const rethrowHttpError = (ctx: Context, error: unknown, fallbackMessage: string) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    throw error;
  }

  ctx.throw(500, fallbackMessage);
};

const controller: Core.Controller = {
  async createOrder(ctx: Context) {
    try {
      const payload = typeof ctx.request.body === 'object' && ctx.request.body ? ctx.request.body : {};
      const result = await strapi.service('api::checkout.checkout').createOrder(payload);

      ctx.body = {
        data: result,
      };
    } catch (error) {
      rethrowHttpError(ctx, error, `Failed to create Razorpay order: ${error}`);
    }
  },

  async verifyPayment(ctx: Context) {
    try {
      const payload = typeof ctx.request.body === 'object' && ctx.request.body ? ctx.request.body : {};
      const result = await strapi.service('api::checkout.checkout').verifyPayment(payload);

      ctx.body = {
        data: result,
      };
    } catch (error) {
      rethrowHttpError(ctx, error, `Failed to verify Razorpay payment: ${error}`);
    }
  },
};

export default controller;
