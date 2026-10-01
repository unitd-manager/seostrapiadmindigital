import { scoreSeo, type SeoData } from './seoScore';

const COLORS = { GOOD: '#2f7a3b', 'NEEDS WORK': '#b26a00', POOR: '#c0392b' } as const;

const SeoSummary = ({ seo }: { seo?: SeoData | null }) => {
  const result = scoreSeo(seo);
  const color = COLORS[result.label];
  const failing = result.checks.filter((check) => !check.passed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, color }}>{result.score}</div>
        <div style={{ fontSize: 12, color: '#666687' }}>SEO score</div>
        <div style={{ fontSize: 12, fontWeight: 700, color, marginTop: 2 }}>{result.label}</div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Overview</div>
        <div style={{ fontSize: 13, color: '#666687' }}>
          Checks {result.passed}/{result.total} passed
        </div>
        <div style={{ fontSize: 13, color: '#666687' }}>
          Focus keyword: {result.focusKeyword || 'not set'}
        </div>
      </div>

      {failing.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>To improve</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#666687' }}>
            {failing.map((check) => (
              <li key={check.id}>{check.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeoSummary;
