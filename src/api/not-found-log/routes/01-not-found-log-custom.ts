export default {
  routes: [
    {
      method: 'POST',
      path: '/not-found-logs/track',
      handler: 'not-found-log.track',
      config: {
        auth: false,
        middlewares: ['api::not-found-log.rate-limit'],
      },
    },
  ],
};
