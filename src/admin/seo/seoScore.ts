/**
 * SEO scoring used by the "SEO Summary" side panel.
 * 11 checks, score = passed / total (rounded). Pure function so it can be unit-tested.
 */
export type SeoMedia = { id?: number; url?: string } | null | undefined;

export type SeoData = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  metaImage?: SeoMedia;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: SeoMedia;
  twitterCard?: string | null;
};

export type SeoCheck = { id: string; label: string; passed: boolean };

export type SeoResult = {
  score: number;
  label: 'GOOD' | 'NEEDS WORK' | 'POOR';
  passed: number;
  total: number;
  checks: SeoCheck[];
  focusKeyword: string;
};

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const has = (haystack: string, needle: string) =>
  needle.length > 0 && haystack.toLowerCase().includes(needle.toLowerCase());

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export function scoreSeo(seo?: SeoData | null): SeoResult {
  const data = seo ?? {};
  const title = text(data.metaTitle);
  const description = text(data.metaDescription);
  const keyword = text(data.focusKeyword);

  const checks: SeoCheck[] = [
    { id: 'title', label: 'Meta title is 30-60 characters', passed: title.length >= 30 && title.length <= 60 },
    {
      id: 'description',
      label: 'Meta description is 70-160 characters',
      passed: description.length >= 70 && description.length <= 160,
    },
    { id: 'focus', label: 'Focus keyword is set', passed: keyword.length > 0 },
    { id: 'focusTitle', label: 'Focus keyword is in the meta title', passed: has(title, keyword) },
    { id: 'focusDesc', label: 'Focus keyword is in the meta description', passed: has(description, keyword) },
    { id: 'keywords', label: 'Keywords are set', passed: text(data.keywords).length > 0 },
    { id: 'canonical', label: 'Canonical URL is a valid URL', passed: isValidUrl(text(data.canonicalUrl)) },
    { id: 'metaImage', label: 'Meta image is set', passed: Boolean(data.metaImage) },
    { id: 'ogTitle', label: 'OG title is set', passed: text(data.ogTitle).length > 0 },
    { id: 'ogDescription', label: 'OG description is set', passed: text(data.ogDescription).length > 0 },
    { id: 'ogImage', label: 'OG image is set', passed: Boolean(data.ogImage) },
    { id: 'twitter', label: 'Twitter card is set', passed: text(data.twitterCard).length > 0 },
  ];

  const passed = checks.filter((check) => check.passed).length;
  const total = checks.length;
  const score = Math.round((passed / total) * 100);

  return {
    score,
    label: score >= 80 ? 'GOOD' : score >= 50 ? 'NEEDS WORK' : 'POOR',
    passed,
    total,
    checks,
    focusKeyword: keyword,
  };
}
