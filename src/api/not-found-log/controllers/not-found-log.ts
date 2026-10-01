import { factories } from '@strapi/strapi';

const UID = 'api::not-found-log.not-found-log';
const cut = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;

/** "/Some-Page/?utm=1#x" and "https://site.com/some-page" both become "/some-page". */
const normalizeLoggedPath = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value || value.length > 2000) return null;

  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      return null;
    }
  }
  value = value.split('#')[0].split('?')[0];
  if (!value.startsWith('/')) value = `/${value}`;
  value = value.replace(/\/{2,}/g, '/');
  if (value.length > 1) value = value.replace(/\/+$/, '');
  return value.toLowerCase().slice(0, 500);
};

export default factories.createCoreController(UID, ({ strapi }) => ({
  /**
   * POST /api/not-found-logs/track   body: { path, referrer? }
   * Public + rate limited. Creates the row on first hit, increments hitCount afterwards.
   */
  async track(ctx) {
    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const path = normalizeLoggedPath(body.path);

    if (!path) {
      return ctx.badRequest('A valid "path" is required.');
    }

    const referrer = cut(body.referrer, 1000);
    const userAgent = cut(ctx.request.headers['user-agent'], 500);
    const now = new Date();
    const db = strapi.db.query(UID);

    const bump = async (row: any) => {
      // Atomic increment so concurrent hits are not lost.
      await strapi.db.connection('not_found_logs').where({ id: row.id }).increment('hit_count', 1);
      await db.update({
        where: { id: row.id },
        data: {
          lastSeenAt: now,
          resolved: false, // it is still being hit, so it needs attention again
          ...(referrer ? { referrer } : {}),
          ...(userAgent ? { userAgent } : {}),
        },
      });
    };

    let row = await db.findOne({ where: { path } });

    if (row) {
      await bump(row);
    } else {
      try {
        await db.create({
          data: { path, hitCount: 1, referrer, userAgent, firstSeenAt: now, lastSeenAt: now, resolved: false },
        });
      } catch (error) {
        // Two first-hits raced; the unique index rejected the loser -> count it as a normal hit.
        row = await db.findOne({ where: { path } });
        if (!row) throw error;
        await bump(row);
      }
    }

    ctx.status = 202;
    ctx.body = { data: { path, tracked: true } };
  },
}));
