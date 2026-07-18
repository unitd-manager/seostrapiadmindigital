export default {
  routes: [
    {
      method: 'POST',
      path: '/checkout/create-order',
      handler: 'api::checkout.checkout.createOrder',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/checkout/verify-payment',
      handler: 'api::checkout.checkout.verifyPayment',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
