/**
 * URL helpers shared by the Redirect lifecycle + lookup controller.
 *
 * source      -> always stored as a path, e.g. "/old-page" (no origin, query, hash or trailing slash)
 * destination -> either an internal path ("/new-page") or an absolute http(s) URL (external redirect)
 */

const ABSOLUTE_URL = /^https?:\/\//i;

export const isAbsoluteUrl = (value: string) => ABSOLUTE_URL.test(value);

export const normalizePath = (raw: string): string => {
  let value = String(raw ?? '').trim();
  if (!value) return '';

  if (isAbsoluteUrl(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      return '';
    }
  }

  value = value.split('#')[0].split('?')[0].trim();
  if (!value.startsWith('/')) value = `/${value}`;
  value = value.replace(/\/{2,}/g, '/');
  if (value.length > 1) value = value.replace(/\/+$/, '');
  return value || '/';
};

export const getHost = (raw: string): string | null => {
  try {
    return isAbsoluteUrl(raw) ? new URL(raw).host.toLowerCase() : null;
  } catch {
    return null;
  }
};

/** Source is always reduced to a path. Comparison is case-insensitive (see lookupKey). */
export const normalizeSource = (raw: string) => normalizePath(raw);

/** Internal destinations become clean paths (query string is kept), external ones are kept absolute. */
export const normalizeDestination = (raw: string): string => {
  const value = String(raw ?? '').trim();
  if (!value) return '';

  if (isAbsoluteUrl(value)) {
    try {
      new URL(value); // validate only, external URLs are kept exactly as typed
      return value;
    } catch {
      return '';
    }
  }

  const [pathAndQuery, hash] = value.split('#');
  const [pathPart, query] = pathAndQuery.split('?');
  const path = normalizePath(pathPart);
  return `${path}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
};

/** Key used for duplicate / loop detection. */
export const lookupKey = (path: string) => normalizePath(path).toLowerCase();

export const STATUS_CODE_MAP: Record<string, number> = {
  permanent: 301,
  temporary: 302,
};
