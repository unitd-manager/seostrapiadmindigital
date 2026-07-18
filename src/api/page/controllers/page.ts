import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::page.page', ({ strapi }) => ({
  async find(ctx) {
    // Call the default core controller action with custom populate
    ctx.query = {
      ...ctx.query,
      populate: {
        pageBuilder: {
          populate: '*',
        },
      },
    };
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    // Call the default core controller action with custom populate
    ctx.query = {
      ...ctx.query,
      populate: {
        pageBuilder: {
          populate: '*',
        },
      },
    };
    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },
}));
