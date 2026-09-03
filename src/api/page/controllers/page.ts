import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::page.page',
  ({ strapi }) => ({
    async find(ctx) {
      // Use the requested populate query if one is provided.
      // Otherwise use the normal population for all page layouts.
      if (!ctx.query.populate) {
        ctx.query.populate = {
          pageBuilder: {
            populate: '*',
          },
        };
      }

      const { data, meta } = await super.find(ctx);

      return { data, meta };
    },

    async findOne(ctx) {
      // Use the requested populate query if one is provided.
      // Otherwise use the normal population for all page layouts.
      if (!ctx.query.populate) {
        ctx.query.populate = {
          pageBuilder: {
            populate: '*',
          },
        };
      }

      const { data, meta } = await super.findOne(ctx);

      return { data, meta };
    },
  })
);