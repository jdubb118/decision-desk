import { useState } from 'react';
import type { Deliverable } from '../types/deliverable';
import { agents } from '../theme';
import { IGFeedPost, IGCarousel, IGStories, IGReel, TikTokPost } from './InstagramMockup';
import { brandPalette } from './mockups/_shared';

const CARD_SHADOW = '0 0 40px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.3)';

const IFRAME_STYLE = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', -apple-system, sans-serif; color: #1a1814; line-height: 1.7; padding: 28px 32px; }
  h1, h2, h3, h4 { font-family: 'Bricolage Grotesque', sans-serif; color: #1a1814; margin: 24px 0 12px; line-height: 1.3; }
  h1 { font-size: 24px; font-weight: 700; }
  h2 { font-size: 20px; font-weight: 600; }
  h3 { font-size: 15px; font-weight: 600; color: #6b6560; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 28px; }
  h4 { font-size: 14px; font-weight: 600; }
  p { font-size: 14px; color: #4a4540; margin: 8px 0 16px; }
  ul, ol { padding-left: 20px; margin: 8px 0 16px; }
  li { font-size: 14px; color: #4a4540; margin-bottom: 10px; line-height: 1.65; }
  b, strong { color: #1a1814; font-weight: 600; }
  blockquote { border-left: 3px solid var(--accent, #c4a35a); margin: 16px 0; padding: 12px 16px; background: #f8f7f4; border-radius: 0 8px 8px 0; font-style: italic; color: #6b6560; }
  code { font-family: 'JetBrains Mono', monospace; font-size: 12px; background: #f8f7f4; padding: 2px 6px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e8e4de; font-size: 13px; }
  th { font-weight: 600; color: #9e9892; text-transform: uppercase; font-size: 10px; letter-spacing: 0.06em; }
  hr { border: none; border-top: 1px solid #e8e4de; margin: 20px 0; }
  a { color: #3d5a73; text-decoration: none; }
</style>`;

function styledIframe(html: string, title: string) {
  return <iframe srcDoc={IFRAME_STYLE + html} sandbox="allow-same-origin" style={{ flex: 1, border: 'none', width: '100%' }} title={title} />;
}

function PlaceholderImg({ w, h, brand, text, style }: { w: number; h: number; brand: string; text: string; style?: React.CSSProperties }) {
  const seed = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  const bg = brandPalette(brand).accentHex;
  const [useFallback, setUseFallback] = useState(false);
  if (useFallback) {
    return <img src={`https://placehold.co/${w}x${h}/${bg}/ffffff?text=${encodeURIComponent(text)}`} style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }} />;
  }
  return <img src={`https://picsum.photos/seed/${seed}${brand}/${w}/${h}`} onError={() => setUseFallback(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }} />;
}

function CreativeAsset({ deliverableId, title, fallbackBrand }: { deliverableId: string; title: string; fallbackBrand?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed && fallbackBrand) {
    return <PlaceholderImg w={600} h={600} brand={fallbackBrand} text={title.slice(0, 20)} style={{ position: 'absolute', inset: 0 }} />;
  }
  if (failed) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>🖼</div>
      </div>
    );
  }
  return <img src={`/api/file/${deliverableId}`} alt={title} onError={() => setFailed(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 12 }}>
      <span style={{ color: '#9e9892', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10, fontWeight: 600, flexShrink: 0, minWidth: 80 }}>{label}</span>
      <span style={{ color: '#6b6560', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{value}</span>
    </div>
  );
}

function CardShell({ children, maxWidth = 700 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div style={{ width: '100%', maxWidth, height: '100%', background: '#fff', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'auto', boxShadow: CARD_SHADOW, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}

function ChromeHeader({ children, bg }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{ background: bg || '#f8f7f4', borderBottom: '1px solid #e8e4de', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      {children}
    </div>
  );
}

function HeaderLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: color || '#9e9892', textTransform: 'uppercase' }}>{children}</span>;
}

function AgentBadge({ agentId }: { agentId: string }) {
  const agent = agents[agentId];
  const color = agent?.color || '#9e9892';
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, background: `${color}18`, color }}>{agent?.label || agentId}</span>;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}


export function CardPreview({ deliverable, previewWidth }: { deliverable: Deliverable; previewWidth: 'mobile' | 'desktop' }) {
  const meta = (deliverable.metadata || {}) as Record<string, unknown>;
  const brand = deliverable.brand;
  const palette = brandPalette(brand);
  const brandName = palette.name;
  const handle = palette.handle;
  const accent = palette.accent;
  const initial = palette.initial;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMAIL HTML
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'email-html') {
    const width = previewWidth === 'mobile' ? 375 : 600;
    return (
      <div style={{ width: Math.min(width + 2, width + 40), maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: CARD_SHADOW, border: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ background: '#f6f8fc', borderBottom: '1px solid #e0e0e0', padding: '10px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#202124' }}>{brandName}</span>
                <span style={{ fontSize: 11, color: '#80868b' }}>{new Date(deliverable.submitted_at).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: 12, color: '#5f6368', marginTop: 1 }}>to <strong>you</strong></div>
            </div>
          </div>
          {deliverable.subject_line && <div style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: '#202124', lineHeight: 1.3 }}>{deliverable.subject_line}</div>}
        </div>
        <iframe src={`/api/preview/${deliverable.id}`} style={{ flex: 1, border: 'none', width: '100%' }} sandbox="allow-same-origin" title={deliverable.title} />
      </div>
    );
  }

  // ━━━ INSTAGRAM FEED POST ━━━
  if (deliverable.type === 'social-image') {
    const isStories = String(meta.format) === 'reel' || String(meta.format) === 'stories' || String(meta.dimensions) === '1080x1920';
    const caption = String(meta.caption || '');
    const imgSrc = deliverable.content_path ? `/api/file/${deliverable.id}` : null;
    if (isStories) return <IGStories brand={brand} handle={handle} imgSrc={imgSrc} placeholderText={deliverable.title.slice(0, 15)} />;
    return <IGFeedPost brand={brand} handle={handle} caption={caption} imgSrc={imgSrc} placeholderText={deliverable.title.slice(0, 20)} location={meta.location ? String(meta.location) : undefined} isVerified />;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTAGRAM CAPTION (social-copy)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'social-copy') {
    const captionRaw = String(meta.caption || meta.copy || deliverable.title);
    const charCount = captionRaw.length;
    const hashtagCount = (captionRaw.match(/#\w+/g) || []).length;

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 24, padding: 12, height: '100%', overflowY: 'auto' }}>
        {/* IG Post mockup */}
        <div style={{ width: 340, background: '#fff', borderRadius: 8, boxShadow: CARD_SHADOW, border: '1px solid #dbdbdb', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `conic-gradient(from 180deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`, padding: 2 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #fff', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700 }}>{initial}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>{handle}</span>
          </div>
          <div style={{ aspectRatio: '1/1', position: 'relative' }}>
            <PlaceholderImg w={540} h={540} brand={brand} text={deliverable.title.slice(0, 15)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <div style={{ flex: 1 }} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div style={{ padding: '0 10px 8px', fontSize: 11, color: '#262626', lineHeight: 1.5 }}>
            <strong>{handle}</strong>{' '}{captionRaw.length > 80 ? captionRaw.slice(0, 80) + '…' : captionRaw}
          </div>
        </div>
        {/* Full caption + stats */}
        <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: charCount > 1980 ? '#b53d2d' : '#6b6560', fontWeight: 600 }}>{charCount}/2200</span>
            {hashtagCount > 0 && <span style={{ fontSize: 12, color: '#3d5a73', fontFamily: "'JetBrains Mono', monospace" }}>#{hashtagCount}</span>}
          </div>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8e4de', padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9892', marginBottom: 8 }}>Full Caption</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: '#1a1814', whiteSpace: 'pre-wrap' }}>{captionRaw}</div>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FACEBOOK / META AD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'ad-copy') {
    const m = meta as Record<string, string>;
    const domain = palette.domain;
    return (
      <div style={{ maxWidth: 500, width: '100%', background: '#fff', borderRadius: 8, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
        {/* FB Header */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>{brandName[0]}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#050505' }}>{brandName}</div>
            <div style={{ fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
              Sponsored · <svg width="12" height="12" viewBox="0 0 16 16" fill="#65676b"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.7 5.3l-4 5a.75.75 0 0 1-1.1.1l-2.5-2a.75.75 0 1 1 .9-1.2l1.9 1.5 3.5-4.4a.75.75 0 1 1 1.2.9z"/></svg>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', color: '#65676b', fontSize: 24 }}>···</div>
        </div>
        {/* Primary text */}
        <div style={{ padding: '0 16px 12px', fontSize: 15, lineHeight: 1.6, color: '#050505' }}>{m.primary_text || 'Primary text here.'}</div>
        {/* Creative */}
        <div style={{ aspectRatio: '1.91/1', background: '#f0f0f0', position: 'relative' }}>
          {deliverable.content_path ? <CreativeAsset deliverableId={deliverable.id} title={deliverable.title} fallbackBrand={brand} /> : <PlaceholderImg w={764} h={400} brand={brand} text={m.headline || deliverable.title.slice(0, 25)} />}
        </div>
        {/* CTA strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f0f2f5' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#65676b', marginBottom: 2 }}>{domain}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#050505', lineHeight: 1.3 }}>{m.headline || deliverable.title}</div>
          </div>
          <button style={{ background: '#1877f2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 16 }}>{m.cta || 'Shop Now'}</button>
        </div>
        {/* Reactions */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid #ced0d4', display: 'flex', gap: 4 }}>
          <div style={{ display: 'flex', marginRight: 8 }}>
            <span style={{ fontSize: 16, marginRight: -4, position: 'relative', zIndex: 3 }}>👍</span>
            <span style={{ fontSize: 16, marginRight: -4, position: 'relative', zIndex: 2 }}>❤️</span>
            <span style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>😮</span>
          </div>
          <span style={{ fontSize: 13, color: '#65676b' }}>24</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13, color: '#65676b' }}>3 comments · 1 share</span>
        </div>
        <div style={{ padding: '4px 16px 8px', borderTop: '1px solid #ced0d4', display: 'flex', justifyContent: 'space-around' }}>
          {['👍 Like', '💬 Comment', '↗️ Share'].map(a => (
            <span key={a} style={{ fontSize: 14, fontWeight: 600, color: '#65676b', padding: '8px 0' }}>{a}</span>
          ))}
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTAGRAM CAROUSEL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'carousel' || deliverable.type === 'carousel-asset') {
    const slideCount = Number(meta.slide_count || 4);
    const caption = String(meta.caption || '');
    return <IGCarousel brand={brand} handle={handle} caption={caption} slideCount={slideCount} placeholderText={deliverable.title.slice(0, 15)} isVerified />;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTAGRAM REEL / TIKTOK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'reel' || deliverable.type === 'short-video' || deliverable.type === 'tiktok') {
    const caption = String(meta.caption || meta.text || '');
    const duration = String(meta.duration || '0:30');
    const platform = String(meta.platform || (deliverable.type === 'tiktok' ? 'TikTok' : 'Instagram'));
    const isTikTok = platform.toLowerCase() === 'tiktok' || deliverable.type === 'tiktok';
    const imgSrc = deliverable.content_path ? `/api/file/${deliverable.id}` : null;
    if (isTikTok) return <TikTokPost brand={brand} handle={handle} caption={caption} duration={duration} imgSrc={imgSrc} placeholderText="TikTok" />;
    return <IGReel brand={brand} handle={handle} caption={caption} duration={duration} imgSrc={imgSrc} placeholderText="Reel" />;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TWITTER / X POST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'tweet' || deliverable.type === 'x-post') {
    const text = String(meta.text || meta.copy || deliverable.html_content?.replace(/<[^>]+>/g, '') || deliverable.title);
    const xHandle = `@${palette.handle}`;
    return (
      <div style={{ maxWidth: 560, width: '100%', background: '#000', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid #2f3336', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', display: 'flex', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>{brandName[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#e7e9ea' }}>{brandName}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d9bf0"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/></svg>
              <span style={{ color: '#71767b', fontSize: 15 }}>{xHandle} · 2m</span>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.5, color: '#e7e9ea', marginTop: 6, whiteSpace: 'pre-wrap' }}>{text}</div>
            {deliverable.content_path && (
              <div style={{ marginTop: 12, borderRadius: 16, overflow: 'hidden', border: '1px solid #2f3336', position: 'relative', aspectRatio: '16/9' }}>
                <CreativeAsset deliverableId={deliverable.id} title={deliverable.title} fallbackBrand={brand} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, maxWidth: 400 }}>
              {[{ icon: '💬', n: '12' }, { icon: '🔁', n: '48' }, { icon: '♡', n: '284' }, { icon: '📊', n: '5.2K' }, { icon: '↗️', n: '' }].map((a, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#71767b' }}>{a.icon} {a.n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LINKEDIN POST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'linkedin-post') {
    const text = String(meta.text || meta.copy || deliverable.html_content?.replace(/<[^>]+>/g, '') || deliverable.title);
    return (
      <div style={{ maxWidth: 552, width: '100%', background: '#fff', borderRadius: 8, boxShadow: CARD_SHADOW, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 4, background: accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>{brandName[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'rgba(0,0,0,.9)' }}>{brandName}</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,.6)', marginTop: 1 }}>2,847 followers</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', gap: 4 }}>Just now · <svg width="12" height="12" viewBox="0 0 16 16" fill="rgba(0,0,0,.4)"><circle cx="8" cy="8" r="7" fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="1.5"/><path d="M8 3v5l3.5 2" fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,0,0,.4)"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
        </div>
        <div style={{ padding: '0 16px 12px', fontSize: 14, lineHeight: 1.5, color: 'rgba(0,0,0,.9)', whiteSpace: 'pre-wrap' }}>{text.length > 300 ? text.slice(0, 300) + '...' : text}</div>
        {deliverable.content_path ? (
          <div style={{ position: 'relative', aspectRatio: '1.91/1' }}><CreativeAsset deliverableId={deliverable.id} title={deliverable.title} fallbackBrand={brand} /></div>
        ) : (
          <div style={{ aspectRatio: '1.91/1', position: 'relative' }}><PlaceholderImg w={800} h={420} brand={brand} text={deliverable.title.slice(0, 25)} /></div>
        )}
        {/* Reactions */}
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', marginRight: 6 }}>
            <span style={{ fontSize: 14, marginRight: -2 }}>👍</span><span style={{ fontSize: 14, marginRight: -2 }}>💡</span><span style={{ fontSize: 14 }}>❤️</span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,.6)' }}>42</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,.6)' }}>6 comments · 2 reposts</span>
        </div>
        <div style={{ padding: '4px 16px 8px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-around' }}>
          {['👍 Like', '💬 Comment', '🔁 Repost', '✉️ Send'].map(a => (
            <span key={a} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,.6)', padding: '10px 0' }}>{a}</span>
          ))}
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SMS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'sms') {
    const message = String(meta.message || meta.body || meta.text || deliverable.title);
    const charCount = message.length;
    return (
      <div style={{ maxWidth: 380, width: '100%' }}>
        {/* iPhone Messages chrome */}
        <div style={{ background: '#f2f2f7', borderRadius: 20, boxShadow: CARD_SHADOW, overflow: 'hidden', border: '1px solid #c7c7cc' }}>
          <div style={{ background: '#f7f7f7', padding: '12px 16px', borderBottom: '1px solid #c7c7cc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#007aff', fontSize: 16 }}>‹</span>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>{brandName}</div>
              <div style={{ fontSize: 11, color: '#8e8e93' }}>SMS/MMS</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#007aff"><circle cx="10" cy="10" r="9" fill="none" stroke="#007aff" strokeWidth="1.5"/><text x="10" y="14" textAnchor="middle" fontSize="11" fill="#007aff" fontWeight="600">i</text></svg>
          </div>
          <div style={{ padding: '20px 12px 16px', minHeight: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
              <div style={{
                background: accent,
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '18px 18px 4px 18px',
                fontSize: 15,
                lineHeight: 1.45,
                maxWidth: '82%',
              }}>
                {message}
              </div>
            </div>
            <div style={{ textAlign: 'right', padding: '2px 8px 0' }}>
              <span style={{ fontSize: 11, color: '#8e8e93' }}>Delivered</span>
            </div>
          </div>
          <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #c7c7cc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 20, border: '1px solid #c7c7cc', padding: '8px 14px', fontSize: 14, color: '#8e8e93' }}>iMessage</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#007aff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#6b6560' }}>{charCount} chars</span>
          {charCount > 160 && <span style={{ fontSize: 11, color: '#b53d2d', fontWeight: 600 }}>{Math.ceil(charCount / 160)} segments</span>}
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HOMEPAGE HERO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'homepage-hero' || deliverable.type === 'hero-banner') {
    const headline = String(meta.headline || deliverable.title);
    const subheadline = String(meta.subheadline || meta.subtitle || '');
    const ctaText = String(meta.cta || 'Shop Now');
    const domain = palette.domain;

    return (
      <div style={{ maxWidth: 820, width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
          {/* Browser chrome */}
          <div style={{ padding: '6px 12px', background: '#e8e8e8', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #d0d0d0' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#444', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', border: '1px solid #d0d0d0' }}>
              🔒 {domain}
            </div>
          </div>
          {/* Nav bar */}
          <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1814', letterSpacing: '0.08em' }}>{brandName.toUpperCase()}</span>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 20 }}>
              {['New', 'Shop', 'About'].map(l => <span key={l} style={{ fontSize: 13, color: '#6b6560' }}>{l}</span>)}
            </div>
          </div>
          {/* Hero */}
          <div style={{ position: 'relative', aspectRatio: '16/6' }}>
            <PlaceholderImg w={1200} h={450} brand={brand} text={headline.slice(0, 30)} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.45))' }}>
              <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif", textAlign: 'center', margin: '0 0 8px', textShadow: '0 2px 8px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>{headline}</h2>
              {subheadline && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: '0 0 20px', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{subheadline}</p>}
              <button style={{ padding: '12px 32px', borderRadius: 6, background: '#fff', color: '#1a1814', fontWeight: 600, fontSize: 14, border: 'none', letterSpacing: '0.04em' }}>{ctaText}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // YOUTUBE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (deliverable.type === 'youtube' || deliverable.type === 'youtube-video') {
    const videoTitle = String(meta.video_title || deliverable.title);
    const description = String(meta.description || meta.caption || '');
    const duration = String(meta.duration || '3:45');

    return (
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
          <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
            <PlaceholderImg w={1280} h={720} brand={brand} text={videoTitle.slice(0, 25)} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 68, height: 48, borderRadius: 12, background: 'rgba(255,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #fff', marginLeft: 4 }} />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 8, right: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{duration}</div>
            {/* Progress bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.3)' }}>
              <div style={{ width: '35%', height: '100%', background: '#ff0000' }} />
            </div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f', lineHeight: 1.35, marginBottom: 8 }}>{videoTitle}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{brandName[0]}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f' }}>{brandName}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#606060"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
                <span style={{ fontSize: 12, color: '#606060' }}>12.4K subscribers</span>
              </div>
              <button style={{ marginLeft: 'auto', background: '#0f0f0f', color: '#fff', borderRadius: 20, padding: '8px 16px', fontWeight: 600, fontSize: 13, border: 'none' }}>Subscribe</button>
            </div>
            <div style={{ background: '#f2f2f2', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 13, color: '#0f0f0f', fontWeight: 500, marginBottom: 4 }}>2.1K views · 3 hours ago</div>
              {description && <div style={{ fontSize: 13, color: '#0f0f0f', lineHeight: 1.45 }}>{description.slice(0, 150)}{description.length > 150 ? '...' : ''}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NON-MEDIA CARD TYPES (business decisions, data, questions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (deliverable.type === 'question') {
    const question = String(meta.question || deliverable.title);
    const context = String(meta.context || '');
    const urgency = String(meta.urgency || 'normal');
    const blocks = Array.isArray(meta.blocks) ? meta.blocks as string[] : (meta.blocks ? [String(meta.blocks)] : []);
    const agentLabel = agents[deliverable.agent_id]?.label || deliverable.agent_id;
    const agentColor = agents[deliverable.agent_id]?.color || '#9e9892';

    return (
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid #e8e4de', overflow: 'hidden' }}>
          <ChromeHeader bg="#f8f7f4"><span style={{ fontSize: 15 }}>❓</span><HeaderLabel>Question from</HeaderLabel><span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, background: `${agentColor}18`, color: agentColor }}>{agentLabel}</span>{urgency === 'high' && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(181,61,45,0.1)', color: '#b53d2d' }}>URGENT</span>}</ChromeHeader>
          <div style={{ padding: '28px 24px 20px' }}>
            <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 600, lineHeight: 1.4, color: '#1a1814', margin: 0, marginBottom: context ? 24 : 0 }}>{question}</p>
            {context && <div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9892', marginBottom: 8 }}>Context</div><p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.65, margin: 0 }}>{context}</p></div>}
          </div>
          {blocks.length > 0 && <div style={{ padding: '12px 24px', borderTop: '1px solid #e8e4de', background: '#f8f7f4', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9892' }}>Blocks</span>{blocks.map((b, i) => <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#fff', border: '1px solid #e8e4de', color: '#6b6560' }}>{String(b)}</span>)}</div>}
        </div>
      </div>
    );
  }

  if (deliverable.type === 'recommendation') {
    const insight = String(meta.insight || deliverable.title);
    const proposedAction = String(meta.proposed_action || meta.action || '');
    const impact = String(meta.impact || '');
    const effort = String(meta.effort || '');
    const evidence = String(meta.evidence || '');
    return (
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid #c4a35a', overflow: 'hidden' }}>
          <ChromeHeader bg="#fdf9f0"><span style={{ fontSize: 15 }}>💡</span><HeaderLabel color="#7a5c1e">Recommendation</HeaderLabel><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9892', marginBottom: 8 }}>Insight</div><p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 600, color: '#1a1814', lineHeight: 1.4, margin: 0 }}>{insight}</p></div>
            {evidence && <div style={{ marginBottom: 20 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e9892', marginBottom: 6 }}>Evidence</div><p style={{ fontSize: 13, color: '#6b6560', lineHeight: 1.6, margin: 0 }}>{evidence}</p></div>}
            {proposedAction && <div style={{ background: '#fdf9f0', borderRadius: 8, border: '1px solid #e8d5a3', padding: '14px 16px', marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a5c1e', marginBottom: 6 }}>Proposed Action</div><p style={{ fontSize: 14, color: '#5c4a1e', lineHeight: 1.6, margin: 0 }}>{proposedAction}</p></div>}
            {(impact || effort) && <div style={{ display: 'flex', gap: 12 }}>{impact && <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e8e4de', background: '#f8f7f4' }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 4 }}>Impact</div><div style={{ fontSize: 13, color: '#2d7a4f', fontWeight: 600 }}>{impact}</div></div>}{effort && <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e8e4de', background: '#f8f7f4' }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 4 }}>Effort</div><div style={{ fontSize: 13, color: '#6b6560', fontWeight: 500 }}>{effort}</div></div>}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (deliverable.type === 'performance-update') {
    const metrics = (meta.metrics || {}) as Record<string, number>;
    const benchmark = (meta.benchmark || {}) as Record<string, number>;
    const recommendation = String(meta.recommendation || 'advance');
    const agentNote = String(meta.agent_note || '');
    const recColor = recommendation === 'advance' ? '#2d7a4f' : recommendation === 'kill' ? '#b53d2d' : '#b5770d';
    const recLabel = recommendation === 'advance' ? 'Advance' : recommendation === 'kill' ? 'Kill' : 'Hold';
    return (
      <div style={{ width: '100%', maxWidth: 680 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #c4a35a', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
          <ChromeHeader bg="#fdf9f0"><span style={{ fontSize: 16 }}>📊</span><HeaderLabel color="#7a5c1e">Performance Update</HeaderLabel><span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: recColor, color: '#fff' }}>{recLabel}</span></ChromeHeader>
          <div style={{ padding: '20px 24px' }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a1814' }}>{deliverable.title}</h2>
            {Object.keys(metrics).length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 20 }}>{Object.entries(metrics).map(([key, value]) => { const bench = benchmark[key]; const isGood = bench !== undefined ? value >= bench : null; return (<div key={key} style={{ background: isGood === true ? '#f0f9f4' : isGood === false ? '#fdf0f0' : '#f8f7f4', borderRadius: 8, padding: '10px 12px', border: `1px solid ${isGood === true ? '#b8e0c8' : isGood === false ? '#f0c0bc' : '#e8e4de'}` }}><div style={{ fontSize: 10, color: '#9e9892', marginBottom: 4, textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</div><div style={{ fontSize: 20, fontWeight: 700, color: isGood === true ? '#2d7a4f' : isGood === false ? '#b53d2d' : '#1a1814', fontFamily: "'JetBrains Mono', monospace" }}>{typeof value === 'number' && value < 100 && key.includes('rate') ? `${value}%` : value}</div>{bench !== undefined && <div style={{ fontSize: 10, color: '#9e9892', marginTop: 2 }}>bench: {bench}</div>}</div>); })}</div>}
            {agentNote && <div style={{ background: '#fdf9f0', borderRadius: 8, border: '1px solid #c4a35a', padding: '12px 16px', fontSize: 13, lineHeight: 1.7, color: '#5c4a1e' }}><div style={{ fontSize: 10, fontWeight: 700, color: '#7a5c1e', textTransform: 'uppercase', marginBottom: 6 }}>Agent Recommendation</div>{agentNote}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (deliverable.type === 'research-summary') {
    const observation = String(meta.observation || meta.summary || deliverable.html_content?.replace(/<[^>]+>/g, '').trim() || '');
    const implication = String(meta.implication || meta.strategic_implication || '');
    const source = String(meta.source || meta.platform || '');
    const domainStr = String(meta.domain || meta.topic || 'market');
    const domainColors: Record<string, string> = { seo: '#2563eb', paid: '#7c3aed', social: '#db2777', market: '#b5770d', competitive: '#b5770d' };
    const dColor = domainColors[domainStr.toLowerCase()] || '#b5770d';
    return (
      <CardShell maxWidth={680}>
        <div style={{ borderLeft: `4px solid ${dColor}` }}>
          <ChromeHeader bg={`${dColor}08`}><HeaderLabel color={dColor}>Market Intelligence</HeaderLabel><span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: '#fff', border: `1px solid ${dColor}30`, color: dColor, fontWeight: 600 }}>{domainStr.toUpperCase()}</span>{source && <span style={{ fontSize: 10, color: '#9e9892' }}>{source}</span>}<span style={{ marginLeft: 'auto' }}><AgentBadge agentId={deliverable.agent_id} /></span></ChromeHeader>
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 600, color: '#1a1814', margin: 0 }}>{deliverable.title}</h2>
            {observation && <div><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 8 }}>Observation</div><div style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.7 }}>{observation}</div></div>}
            {implication && <div style={{ padding: '14px 16px', borderRadius: 8, background: `${dColor}08`, border: `1px solid ${dColor}20` }}><div style={{ fontSize: 10, fontWeight: 700, color: dColor, textTransform: 'uppercase', marginBottom: 6 }}>Strategic Implication</div><div style={{ fontSize: 14, color: '#1a1814', lineHeight: 1.6, fontWeight: 500 }}>{implication}</div></div>}
          </div>
        </div>
      </CardShell>
    );
  }

  // Remaining business card types — blocker, decision-point, budget, capability, content-brief, influencer, paid-campaign, visual-asset, seo, pr, strategy-doc
  if (deliverable.type === 'blocker-escalation') {
    const blocker = String(meta.blocker || meta.description || deliverable.title);
    const impactStr = String(meta.impact || '');
    const resolution = String(meta.suggested_resolution || meta.resolution || '');
    return (
      <div style={{ width: '100%', maxWidth: 640 }}><div style={{ background: '#fff', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid #b53d2d', overflow: 'hidden' }}>
        <ChromeHeader bg="#fdf0f0"><span style={{ fontSize: 15 }}>🚨</span><HeaderLabel color="#b53d2d">Escalation</HeaderLabel><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 600, color: '#1a1814', lineHeight: 1.4, margin: '0 0 16px' }}>{blocker}</p>
          {impactStr && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 6 }}>Impact</div><p style={{ fontSize: 13, color: '#6b6560', lineHeight: 1.6, margin: 0 }}>{impactStr}</p></div>}
          {resolution && <div style={{ background: '#f0f9f4', borderRadius: 8, border: '1px solid #b8e0c8', padding: '12px 16px' }}><div style={{ fontSize: 10, fontWeight: 700, color: '#2d7a4f', textTransform: 'uppercase', marginBottom: 6 }}>Suggested Resolution</div><p style={{ fontSize: 13, color: '#1a1814', lineHeight: 1.6, margin: 0 }}>{resolution}</p></div>}
        </div>
      </div></div>
    );
  }

  if (deliverable.type === 'decision-point') {
    const situation = String(meta.situation || meta.context || '');
    const options = Array.isArray(meta.options) ? meta.options as Array<{ label: string; description?: string }> : [];
    return (
      <div style={{ width: '100%', maxWidth: 600 }}><div style={{ background: '#fff', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid var(--brand-accent)', overflow: 'hidden' }}>
        <ChromeHeader bg="var(--brand-accent-subtle)"><span style={{ fontSize: 15 }}>🔀</span><HeaderLabel color="var(--brand-badge-color)">Decision Point</HeaderLabel><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
        <div style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 600, color: '#1a1814', marginBottom: 16 }}>{deliverable.title}</h2>
          {situation && <p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.6, marginBottom: 20 }}>{situation}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{options.map((opt, i) => <div key={i} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e8e4de', background: '#f8f7f4' }}><div style={{ fontWeight: 600, fontSize: 14, color: '#1a1814', marginBottom: opt.description ? 4 : 0 }}>{opt.label}</div>{opt.description && <div style={{ fontSize: 12, color: '#6b6560', lineHeight: 1.5 }}>{opt.description}</div>}</div>)}</div>
        </div>
      </div></div>
    );
  }

  if (deliverable.type === 'budget-request') {
    const amount = String(meta.amount || meta.budget || '');
    const purpose = String(meta.purpose || '');
    const expectedRoi = String(meta.expected_roi || meta.roi || '');
    return (
      <div style={{ width: '100%', maxWidth: 560 }}><div style={{ background: '#fff', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid #e8e4de', overflow: 'hidden' }}>
        <ChromeHeader><span style={{ fontSize: 15 }}>💰</span><HeaderLabel>Budget Request</HeaderLabel><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
        <div style={{ padding: 24 }}>
          {amount && <div style={{ marginBottom: 20, textAlign: 'center', padding: 16, background: '#f8f7f4', borderRadius: 8, border: '1px solid #e8e4de' }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 6 }}>Amount Requested</div><div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, fontWeight: 700, color: '#1a1814' }}>{amount}</div></div>}
          {purpose && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 6 }}>Purpose</div><p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.6, margin: 0 }}>{purpose}</p></div>}
          {expectedRoi && <div style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e8e4de', background: '#f8f7f4' }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 4 }}>Expected ROI</div><div style={{ fontSize: 13, color: '#2d7a4f', fontWeight: 600 }}>{expectedRoi}</div></div>}
        </div>
      </div></div>
    );
  }

  if (deliverable.type === 'influencer-proposal') {
    const name = String(meta.influencer_name || meta.name || deliverable.title);
    const followers = String(meta.followers || '');
    const engRate = String(meta.engagement_rate || '');
    const niche = String(meta.niche || '');
    const collab = String(meta.collaboration || meta.proposed_collaboration || '');
    return (
      <div style={{ width: '100%', maxWidth: 560 }}><div style={{ background: '#fff', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid #e8e4de', overflow: 'hidden' }}>
        <ChromeHeader><span style={{ fontSize: 15 }}>🤝</span><HeaderLabel>Influencer Proposal</HeaderLabel><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>{name[0]}</div>
            <div><div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 600, color: '#1a1814' }}>{name}</div><div style={{ display: 'flex', gap: 12, marginTop: 6 }}>{followers && <span style={{ fontSize: 12, color: '#6b6560' }}>{followers} followers</span>}{engRate && <span style={{ fontSize: 12, color: '#2d7a4f', fontWeight: 600 }}>{engRate} eng</span>}{niche && <span style={{ fontSize: 12, color: 'var(--brand-accent)' }}>{niche}</span>}</div></div>
          </div>
          {collab && <div><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 6 }}>Proposed Collaboration</div><p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.6, margin: 0 }}>{collab}</p></div>}
        </div>
      </div></div>
    );
  }

  if (deliverable.type === 'capability-request') {
    const m = meta as Record<string, string | number>;
    const rationale = String(m.rationale || m.unblocks || '');
    const testing = String(m.testing_plan || '');
    const rollback = String(m.rollback || '');
    const risk = String(m.risk || '');
    const effort = String(m.effort || '');
    const cost = String(m.cost || '');
    const probation = m.probation_days ? `${m.probation_days} days` : '';
    const toolName = String(m.tool_name || m.mcp_name || '');
    const sourceRepo = String(m.source_repo || '');
    const riskColor = risk === 'high' ? '#b53d2d' : risk === 'medium' ? '#b5770d' : '#2d7a4f';
    return (
      <CardShell maxWidth={720}>
        <ChromeHeader bg="var(--brand-accent-subtle)">
          <span style={{ fontSize: 16 }}>⚡</span>
          <HeaderLabel color="var(--brand-badge-color)">Capability Request</HeaderLabel>
          <span style={{ marginLeft: 'auto' }}><AgentBadge agentId={deliverable.agent_id} /></span>
        </ChromeHeader>
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 700, color: '#1a1814', marginBottom: 6, lineHeight: 1.3 }}>{deliverable.title}</h2>

          {toolName && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background: '#f8f7f4', padding: '3px 8px', borderRadius: 4, color: '#1a1814', border: '1px solid #e8e4de' }}>{toolName}</code>
              {sourceRepo && <a href={sourceRepo} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#3d5a73', textDecoration: 'none' }}>↗ source</a>}
            </div>
          )}

          {/* At-a-glance chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {risk && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${riskColor}18`, color: riskColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{risk} risk</span>}
            {cost && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#f8f7f4', border: '1px solid #e8e4de', color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cost}</span>}
            {probation && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#f8f7f4', border: '1px solid #e8e4de', color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em' }}>probation {probation}</span>}
            {effort && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#f8f7f4', border: '1px solid #e8e4de', color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{effort}</span>}
          </div>

          {rationale && (
            <Section label="Why">
              <p style={{ fontSize: 14, color: '#4a4540', lineHeight: 1.65, margin: 0 }}>{rationale}</p>
            </Section>
          )}

          {testing && (
            <Section label="Testing plan">
              <p style={{ fontSize: 13, color: '#6b6560', lineHeight: 1.65, margin: 0 }}>{testing}</p>
            </Section>
          )}

          {rollback && (
            <Section label="Rollback">
              <p style={{ fontSize: 13, color: '#6b6560', lineHeight: 1.65, margin: 0 }}>{rollback}</p>
            </Section>
          )}

          {!rationale && !testing && !rollback && deliverable.html_content && (
            <div style={{ fontSize: 13, color: '#4a4540', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: deliverable.html_content }} />
          )}
        </div>
      </CardShell>
    );
  }

  if (deliverable.type === 'content-brief') {
    const objective = String(meta.objective || '');
    const channels = Array.isArray(meta.channels) ? meta.channels as string[] : [];
    const toneNotes = String(meta.tone_notes || meta.tone || '');
    return (
      <CardShell maxWidth={720}>
        <ChromeHeader bg="var(--brand-accent-subtle)"><HeaderLabel color="var(--brand-badge-color)">Content Brief</HeaderLabel><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#1a1814' }}>{deliverable.title}</h2>
          {objective && <div style={{ marginBottom: 18 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 6 }}>Objective</div><p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.65, margin: 0 }}>{objective}</p></div>}
          {channels.length > 0 && <div style={{ marginBottom: 18 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 8 }}>Channels</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{channels.map((c, i) => <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f8f7f4', border: '1px solid #e8e4de', color: '#6b6560' }}>{String(c)}</span>)}</div></div>}
          {toneNotes && <div><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 6 }}>Tone</div><p style={{ fontSize: 13, color: '#6b6560', lineHeight: 1.6, margin: 0 }}>{toneNotes}</p></div>}
        </div>
      </CardShell>
    );
  }

  if (deliverable.type === 'paid-campaign-brief') {
    const budget = String(meta.budget || meta.amount || '');
    const objective = String(meta.objective || '');
    const audience = String(meta.audience || meta.target_audience || '');
    const platform = String(meta.platform || '');
    return (
      <div style={{ width: '100%', maxWidth: 640 }}><div style={{ background: '#fff', borderRadius: 16, boxShadow: CARD_SHADOW, border: '1px solid var(--brand-accent)', overflow: 'hidden' }}>
        <ChromeHeader bg="var(--brand-accent-subtle)"><span style={{ fontSize: 15 }}>💳</span><HeaderLabel color="var(--brand-badge-color)">Paid Campaign Brief</HeaderLabel><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
        <div style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a1814' }}>{deliverable.title}</h2>
          {budget && <div style={{ textAlign: 'center', padding: 16, background: '#f8f7f4', borderRadius: 8, border: '1px solid #e8e4de', marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#9e9892', textTransform: 'uppercase', marginBottom: 4 }}>Budget</div><div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 700 }}>{budget}</div></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{objective && <MetaRow label="Objective" value={objective} />}{audience && <MetaRow label="Audience" value={audience} />}{platform && <MetaRow label="Platform" value={platform} />}</div>
        </div>
      </div></div>
    );
  }

  if (deliverable.type === 'visual-asset') {
    const tags = [String(meta.asset_type || 'image'), String(meta.platform || ''), String(meta.dimensions || '')].filter(t => t && t !== 'undefined');
    const caption = String(meta.caption || meta.alt_text || '');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 10, padding: '8px 0' }}>
        <div style={{ position: 'relative', flex: 1, minHeight: 0, width: '100%', maxWidth: 520, borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e4de', background: '#fff', boxShadow: CARD_SHADOW }}>
          <CreativeAsset deliverableId={deliverable.id} title={deliverable.title} fallbackBrand={brand} />
        </div>
        {tags.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>{tags.map((t, i) => <span key={i} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: '#f8f7f4', border: '1px solid #e8e4de', color: '#9e9892', fontWeight: 500 }}>{t}</span>)}</div>}
        {caption && <div style={{ maxWidth: 520, fontSize: 13, color: '#6b6560', fontStyle: 'italic', textAlign: 'center' }}>"{caption}"</div>}
      </div>
    );
  }

  if (deliverable.type === 'video-asset') {
    const duration = String(meta.duration || '');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, minHeight: 0, width: '100%', maxWidth: 640, borderRadius: 16, overflow: 'hidden', background: '#000', boxShadow: CARD_SHADOW }}>
          <video src={`/api/file/${deliverable.id}`} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          {duration && <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '2px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{duration}</div>}
        </div>
      </div>
    );
  }

  if (deliverable.type === 'seo-content') {
    const m = meta as Record<string, string | number>;
    const domain = palette.domain;
    return (
      <div style={{ width: '100%', maxWidth: 760, height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: 8, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9e9892', textTransform: 'uppercase', marginBottom: 6 }}>Google SERP Preview</div>
          <div style={{ fontSize: 12, color: '#4d5156', marginBottom: 3 }}>{String(m.target_url || domain)}</div>
          <div style={{ fontSize: 18, color: '#1a0dab', marginBottom: 3, lineHeight: 1.3, fontFamily: 'arial, sans-serif' }}>{deliverable.title}</div>
          <div style={{ fontSize: 13, color: '#4d5156', lineHeight: 1.5 }}>{String(m.meta_description || deliverable.title)}</div>
        </div>
        <CardShell>{deliverable.html_content ? styledIframe(deliverable.html_content, deliverable.title) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#9e9892', fontStyle: 'italic' }}>Content in workspace</div>}</CardShell>
      </div>
    );
  }

  if (deliverable.type === 'pr-copy') {
    return (
      <CardShell maxWidth={760}>
        <div style={{ background: '#1a1814', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}><HeaderLabel color="#fff">FOR IMMEDIATE RELEASE</HeaderLabel>{meta.embargo ? <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, background: '#b53d2d', color: '#fff', fontSize: 10, fontWeight: 700 }}>EMBARGO: {String(meta.embargo)}</span> : null}</div>
        {deliverable.html_content ? styledIframe(deliverable.html_content, deliverable.title) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 32 }}><div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 600, color: '#1a1814', textAlign: 'center' }}>{deliverable.title}</div></div>}
      </CardShell>
    );
  }

  if (deliverable.type === 'strategy-doc') {
    return (
      <CardShell maxWidth={760}>
        <ChromeHeader bg="var(--brand-accent-subtle)"><HeaderLabel color="var(--brand-accent)">Strategy Brief</HeaderLabel><span style={{ marginLeft: 'auto' }}><AgentBadge agentId={deliverable.agent_id} /></span></ChromeHeader>
        {deliverable.html_content ? styledIframe(deliverable.html_content, deliverable.title) : <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}><h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 600, marginBottom: 20, color: '#1a1814' }}>{deliverable.title}</h2>{Object.entries(meta).filter(([k]) => !k.startsWith('_')).map(([k, v]) => <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #e8e4de' }}><span style={{ fontSize: 11, fontWeight: 600, color: '#9e9892', textTransform: 'uppercase', minWidth: 120 }}>{k.replace(/_/g, ' ')}</span><span style={{ fontSize: 13, color: '#6b6560' }}>{String(v)}</span></div>)}</div>}
      </CardShell>
    );
  }

  // ━━━ FALLBACK ━━━
  return (
    <CardShell maxWidth={700}>
      <ChromeHeader><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--brand-accent-subtle)', color: 'var(--brand-badge-color)', border: '1px solid var(--brand-accent)', textTransform: 'uppercase' }}>{deliverable.type.replace(/-/g, ' ')}</span><AgentBadge agentId={deliverable.agent_id} /></ChromeHeader>
      {deliverable.html_content ? styledIframe(deliverable.html_content, deliverable.title) : <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}><h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#1a1814' }}>{deliverable.title}</h2>{Object.entries(meta).filter(([k]) => !k.startsWith('_')).map(([k, v]) => <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #e8e4de' }}><span style={{ fontSize: 11, fontWeight: 600, color: '#9e9892', textTransform: 'uppercase', minWidth: 120 }}>{k.replace(/_/g, ' ')}</span><span style={{ fontSize: 13, color: '#6b6560' }}>{String(v)}</span></div>)}</div>}
    </CardShell>
  );
}
