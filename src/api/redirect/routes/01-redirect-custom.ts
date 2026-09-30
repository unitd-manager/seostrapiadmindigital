// Loaded before the core router so "/redirects/lookup" is not captured by "/redirects/:id".
export default {
  routes: [
    {
      method: 'GET',
      path: '/redirects/lookup',
      handler: 'redirect.lookup',
      config: { auth: false },
    },
  ],
};
