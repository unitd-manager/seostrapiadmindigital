export default {
  routes: [
    {
      method: "POST",
      path: "/seo-audit",
      handler: "seo-audit.submit",
      config: {
        auth: false, // public endpoint, same as the old /api/seo-audit
      },
    },
  ],
};