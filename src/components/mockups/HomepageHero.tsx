import { CARD_SHADOW, PlaceholderImg, brandPalette } from './_shared';

export interface HomepageHeroProps {
  brand: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  imgSrc: string | null;
  placeholderText: string;
}

/** Browser chrome + site nav + 16:6 hero image with headline overlay + CTA button. */
export function HomepageHero({
  brand,
  headline,
  subheadline,
  ctaText,
  imgSrc,
  placeholderText,
}: HomepageHeroProps) {
  const palette = brandPalette(brand);
  const brandName = palette.name;
  const domain = palette.domain;
  const accent = palette.accent;
  const cta = ctaText || 'Shop Now';

  return (
    <div style={{ maxWidth: 820, width: '100%' }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
        {/* Browser chrome */}
        <div
          style={{
            padding: '6px 12px',
            background: '#e8e8e8',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid #d0d0d0',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 12,
              color: '#444',
              fontFamily: "'DM Sans', sans-serif",
              textAlign: 'center',
              border: '1px solid #d0d0d0',
            }}
          >
            🔒 {domain}
          </div>
        </div>

        {/* Nav bar */}
        <div
          style={{
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: '#1a1814',
              letterSpacing: '0.08em',
            }}
          >
            {brandName.toUpperCase()}
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 20 }}>
            {['New', 'Shop', 'About', 'Journal'].map((l) => (
              <span key={l} style={{ fontSize: 13, color: '#6b6560' }}>
                {l}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginLeft: 24, color: '#6b6560' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', aspectRatio: '16/6', background: '#1a1814' }}>
          <PlaceholderImg w={1200} h={450} brand={brand} text={placeholderText} src={imgSrc} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 60px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.45))',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                color: '#fff',
                fontSize: 36,
                fontWeight: 700,
                fontFamily: "'Bricolage Grotesque', sans-serif",
                margin: '0 0 8px',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                lineHeight: 1.2,
                maxWidth: 680,
              }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p
                style={{
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: 16,
                  margin: '0 0 20px',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  maxWidth: 560,
                  lineHeight: 1.5,
                }}
              >
                {subheadline}
              </p>
            )}
            <button
              style={{
                padding: '12px 32px',
                borderRadius: 6,
                background: '#fff',
                color: '#1a1814',
                fontWeight: 600,
                fontSize: 14,
                border: 'none',
                letterSpacing: '0.04em',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {cta}
            </button>
          </div>
        </div>

        {/* Hint of next section */}
        <div
          style={{
            padding: '16px 24px 20px',
            background: '#faf9f6',
            borderTop: '1px solid #eee',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#9e9892',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            New Arrivals
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${accent}22, #eee)`,
                  border: '1px solid #e8e4de',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
