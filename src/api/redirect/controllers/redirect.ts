import { factories } from '@strapi/strapi';
import { STATUS_CODE_MAP } from '../utils';

export default factories.createCoreController('api::redirect.redirect', ({ strapi }) => ({
  /**
   * GET /api/redirects/lookup
   * Public. Returns every enabled redirect in a tiny, cache-friendly shape.
   */
  async lookup(ctx) {
    const rows = await strapi.db.query('api::redirect.redirect').findMany({
      where: { enabled: true },
      select: ['source', 'destination', 'statusCode'],
      orderBy: { id: 'asc' },
      limit: 5000,
    });

    ctx.set('Cache-Control', 'public, max-age=60');
    ctx.body = {
      data: rows.map((row: any) => ({
        source: row.source,
        destination: row.destination,
        statusCode: STATUS_CODE_MAP[row.statusCode] ?? 301,
      })),
    };
  },
}));
