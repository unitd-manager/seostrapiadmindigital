import { errors } from '@strapi/utils';
import {
  getHost,
  isAbsoluteUrl,
  lookupKey,
  normalizeDestination,
  normalizePath,
  normalizeSource,
} from '../../utils';

const UID = 'api::redirect.redirect';
const MAX_HOPS = 25;

const fail = (message: string): never => {
  throw new errors.ApplicationError(message);
};

async function validate(event: any, isUpdate: boolean) {
  const data = event.params?.data ?? {};
  const where = event.params?.where ?? {};

  let existing: any = null;
  if (isUpdate && (where.id || where.documentId)) {
    existing = await strapi.db.query(UID).findOne({ where });
  }

  // Merge so partial updates are validated against the full record.
  const rawSource = data.source !== undefined ? data.source : existing?.source;
  const rawDestination = data.destination !== undefined ? data.destination : existing?.destination;
  const enabled = data.enabled !== undefined ? data.enabled : existing?.enabled ?? true;

  if (data.source === undefined && data.destination === undefined && data.enabled === undefined) {
    return; // nothing relevant changed
  }

  if (!rawSource || !String(rawSource).trim()) fail('Source is required.');
  if (!rawDestination || !String(rawDestination).trim()) fail('Destination is required.');

  const sourceHost = getHost(String(rawSource));
  const source = normalizeSource(String(rawSource));
  const destination = normalizeDestination(String(rawDestination));

  if (!source) fail('Source is not a valid URL or path.');
  if (!destination) fail('Destination is not a valid URL or path.');
  if (source === '/') fail('The home page ("/") cannot be used as a redirect source.');

  // ---- self redirect ----
  const destIsAbsolute = isAbsoluteUrl(destination);
  const destPath = normalizePath(destination);
  const destHost = getHost(destination);
  const sameTarget = destIsAbsolute
    ? sourceHost !== null && destHost === sourceHost && lookupKey(destPath) === lookupKey(source)
    : lookupKey(destPath) === lookupKey(source);

  if (sameTarget) fail('Source and destination are the same, this would redirect to itself.');

  // ---- duplicates ----
  const all = await strapi.db.query(UID).findMany({ select: ['id', 'source', 'destination', 'enabled'] });
  const others = all.filter((row: any) => !existing || row.id !== existing.id);

  if (others.some((row: any) => lookupKey(row.source) === lookupKey(source))) {
    fail(`A redirect for "${source}" already exists.`);
  }

  // ---- loops (only internal destinations can chain) ----
  if (enabled && !destIsAbsolute) {
    const bySource = new Map<string, string>();
    for (const row of others) {
      if (row.enabled) bySource.set(lookupKey(row.source), row.destination);
    }

    let current = lookupKey(destPath);
    const sourceKey = lookupKey(source);
    for (let hop = 0; hop < MAX_HOPS; hop += 1) {
      if (current === sourceKey) {
        fail('This redirect would create a redirect loop.');
      }
      const next = bySource.get(current);
      if (!next || isAbsoluteUrl(next)) break;
      current = lookupKey(normalizePath(next));
    }
  }

  // ---- write normalized values back ----
  event.params.data = { ...data, source, destination };
}

export default {
  async beforeCreate(event: any) {
    await validate(event, false);
  },
  async beforeUpdate(event: any) {
    await validate(event, true);
  },
  /** A new redirect means the 404 that triggered it is handled, mark it resolved. */
  async afterCreate(event: any) {
    try {
      const source = event.result?.source;
      if (!source || !strapi.contentTypes['api::not-found-log.not-found-log']) return;
      await strapi.db
        .query('api::not-found-log.not-found-log')
        .updateMany({ where: { path: lookupKey(source) }, data: { resolved: true } });
    } catch (error) {
      strapi.log.warn(`[redirect] could not auto-resolve 404 log: ${error}`);
    }
  },
};
