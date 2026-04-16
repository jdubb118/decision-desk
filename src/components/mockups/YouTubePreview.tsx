import { CARD_SHADOW, PlaceholderImg, brandPalette } from './_shared';

export interface YouTubePreviewProps {
  brand: string;
  title: string;
  description: string;
  imgSrc: string | null;
  placeholderText: string;
  duration: string;
  /** 'short' = 9:16 phone frame; anything else = 16:9 desktop player. */
  subChannel?: 'short' | 'long-form' | string;
}

/** YouTube preview: Shorts (phone frame, 9:16) or long-form (player, 16:9). */
export function YouTubePreview({
  brand,
  title,
  description,
  imgSrc,
  placeholderText,
  duration,
  subChannel,
}: YouTubePreviewProps) {
  const isShort = subChannel === 'short';
  if (isShort) return <YouTubeShort brand={brand} title={title} imgSrc={imgSrc} placeholderText={placeholderText} duration={duration} />;
  return <YouTubeLongForm brand={brand} title={title} description={description} imgSrc={imgSrc} placeholderText={placeholderText} duration={duration} />;
}

function YouTubeLongForm({
  brand,
  title,
  description,
  imgSrc,
  placeholderText,
  duration,
}: {
  brand: string;
  title: string;
  description: string;
  imgSrc: string | null;
  placeholderText: string;
  duration: string;
}) {
  const palette = brandPalette(brand);
  const brandName = palette.name;
  const accent = palette.accent;
  return (
    <div style={{ maxWidth: 640, width: '100%' }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
          <PlaceholderImg w={1280} h={720} brand={brand} text={placeholderText} src={imgSrc} />
          {/* Play button */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 68, height: 48, borderRadius: 12, background: 'rgba(255,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #fff', marginLeft: 4 }} />
            </div>
          </div>
          {/* Duration badge */}
          <div style={{ position: 'absolute', bottom: 8, right: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
            {duration}
          </div>
          {/* Progress bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.3)' }}>
            <div style={{ width: '35%', height: '100%', background: '#ff0000' }} />
          </div>
        </div>
        <div style={{ padding: '12px 16px', fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f', lineHeight: 1.35, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {brandName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f' }}>{brandName}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#606060">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span style={{ fontSize: 12, color: '#606060' }}>12.4K subscribers</span>
            </div>
            <button style={{ marginLeft: 'auto', background: '#0f0f0f', color: '#fff', borderRadius: 20, padding: '8px 16px', fontWeight: 600, fontSize: 13, border: 'none' }}>
              Subscribe
            </button>
          </div>
          <div style={{ background: '#f2f2f2', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 13, color: '#0f0f0f', fontWeight: 500, marginBottom: 4 }}>
              2.1K views · 3 hours ago
            </div>
            {description && (
              <div style={{ fontSize: 13, color: '#0f0f0f', lineHeight: 1.45 }}>
                {description.slice(0, 200)}
                {description.length > 200 ? '…' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function YouTubeShort({
  brand,
  title,
  imgSrc,
  placeholderText,
  duration,
}: {
  brand: string;
  title: string;
  imgSrc: string | null;
  placeholderText: string;
  duration: string;
}) {
  const palette = brandPalette(brand);
  const brandName = palette.name;
  const accent = palette.accent;
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 300, background: '#000', borderRadius: 44, padding: '14px 8px',
        boxShadow: '0 0 0 2px #1a1a1a, 0 0 0 4px #333, ' + CARD_SHADOW,
      }}>
        {/* Dynamic Island */}
        <div style={{ height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 90, height: 24, background: '#000', borderRadius: 20, border: '1px solid #1a1a1a' }} />
        </div>
        <div style={{ borderRadius: 32, overflow: 'hidden', position: 'relative', background: '#000' }}>
          <div style={{ aspectRatio: '9/16', position: 'relative' }}>
            <PlaceholderImg w={540} h={960} brand={brand} text={placeholderText} src={imgSrc} />
            {/* Shorts logo top-left */}
            <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: 4, background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: '-apple-system, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Shorts</span>
            </div>
            {/* Search top-right */}
            <div style={{ position: 'absolute', top: 10, right: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {/* Play icon */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid #fff', marginLeft: 4 }} />
              </div>
            </div>
            {/* Right sidebar */}
            <div style={{ position: 'absolute', right: 10, bottom: 110, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {[
                { icon: '👍', n: '2.1K' },
                { icon: '👎', n: '' },
                { icon: '💬', n: '84' },
                { icon: '↗', n: 'Share' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {a.icon}
                  </div>
                  {a.n && <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{a.n}</span>}
                </div>
              ))}
              {/* Channel avatar */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                {brandName[0]}
              </div>
            </div>
            {/* Bottom info */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 64, padding: '36px 12px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: '-apple-system, sans-serif' }}>@{palette.handle}</span>
                <span style={{ fontSize: 11, color: '#fff', padding: '2px 8px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.5)', fontWeight: 600 }}>Subscribe</span>
              </div>
              <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4, fontFamily: '-apple-system, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {title.length > 80 ? title.slice(0, 80) + '…' : title}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 6, right: 6, padding: '1px 5px', borderRadius: 3, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              {duration}
            </div>
          </div>
        </div>
        <div style={{ height: 18, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 2 }}>
          <div style={{ width: 120, height: 4, background: '#fff', borderRadius: 2, opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}
