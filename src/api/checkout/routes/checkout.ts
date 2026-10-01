export default {
  routes: [
    {
      method: 'POST',
      path: '/checkout/create-stripe-session',
      handler: 'api::checkout.checkout.createStripeSession',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/checkout/verify-stripe-session',
      handler: 'api::checkout.checkout.verifyStripeSession',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
