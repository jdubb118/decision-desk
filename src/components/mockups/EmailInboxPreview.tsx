import { CARD_SHADOW, PlaceholderImg, brandLabel } from './_shared';

export interface EmailInboxPreviewProps {
  brand: string;
  subject: string;
  previewText: string;
  /** If present, rendered in a sandboxed iframe (assumed HTML). */
  finalCopyHtml?: string | null;
  /** Fallback plain-text copy direction. */
  copyDirection?: string | null;
  heroImgSrc: string | null;
  heroPlaceholder: string;
  concept?: string;
}

const IFRAME_STYLE = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', -apple-system, sans-serif; color: #1a1814; line-height: 1.7; padding: 28px 32px; background: #fff; }
  h1, h2, h3, h4 { font-family: 'Bricolage Grotesque', sans-serif; color: #1a1814; margin: 24px 0 12px; line-height: 1.3; }
  h1 { font-size: 26px; font-weight: 700; }
  h2 { font-size: 20px; font-weight: 600; }
  p { font-size: 14px; color: #4a4540; margin: 8px 0 16px; }
  img { max-width: 100%; height: auto; border-radius: 4px; }
  a { color: #3d5a73; text-decoration: none; }
  hr { border: none; border-top: 1px solid #e8e4de; margin: 20px 0; }
</style>`;

function isHtml(s: string | null | undefined): boolean {
  if (!s) return false;
  return /<\w+[\s>]/.test(s);
}

function plainTextToHtml(text: string): string {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return esc
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

/** Gmail-like preview: inbox row + open email body. Handles HTML and text gracefully. */
export function EmailInboxPreview({
  brand,
  subject,
  previewText,
  finalCopyHtml,
  copyDirection,
  heroImgSrc,
  heroPlaceholder,
  concept,
}: EmailInboxPreviewProps) {
  const brandName = brandLabel(brand);
  const accent = brand === 'deke' ? '#c4a35a' : '#3d5a73';

  const rawCopy = (finalCopyHtml ?? copyDirection ?? '').trim();
  const copyIsHtml = isHtml(rawCopy);

  // Template shell for text-only: bake the copy into a simple HTML email template
  const templatedHtml = rawCopy
    ? copyIsHtml
      ? rawCopy
      : buildTemplateHtml({
          brand,
          brandName,
          accent,
          subject,
          body: plainTextToHtml(rawCopy),
          previewText,
        })
    : buildTemplateHtml({
        brand,
        brandName,
        accent,
        subject,
        body: `<p style="color:#9e9892;font-style:italic">${concept ? 'Concept: ' + concept : 'No copy yet.'}</p>`,
        previewText,
      });

  return (
    <div style={{ maxWidth: 640, width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Inbox list row */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e8e4de',
          boxShadow: CARD_SHADOW,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 14px',
            borderBottom: '1px solid #e8e4de',
            background: '#f8f7f4',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: '-apple-system, sans-serif',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#9e9892', textTransform: 'uppercase' }}>
            Inbox
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#9e9892' }}>1 of 42</span>
        </div>
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            fontFamily: '-apple-system, sans-serif',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {brandName[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>{brandName}</span>
              <span style={{ fontSize: 11, color: '#5f6368' }}>to you</span>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#202124',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subject}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#5f6368',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {previewText.slice(0, 110)}
              {previewText.length > 110 ? '…' : ''}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#5f6368', flexShrink: 0 }}>9:41 AM</div>
        </div>
      </div>

      {/* Opened email body */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e8e4de',
          boxShadow: CARD_SHADOW,
          overflow: 'hidden',
        }}
      >
        {/* Email header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #e8e4de',
            background: '#fafafa',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              color: '#202124',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {subject}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {brandName[0]}
            </div>
            <div style={{ flex: 1, fontSize: 12, color: '#5f6368' }}>
              <strong style={{ color: '#202124' }}>{brandName}</strong>{' '}
              &lt;hello@{brand === 'eb' ? 'emanuel-berg.com' : 'deke-style.com'}&gt;
              <div>to you · 9:41 AM</div>
            </div>
          </div>
        </div>
        {/* Body iframe (sandboxed) */}
        <iframe
          srcDoc={IFRAME_STYLE + templatedHtml}
          sandbox="allow-same-origin"
          title={subject}
          style={{
            width: '100%',
            minHeight: 420,
            border: 'none',
            display: 'block',
            background: '#fff',
          }}
        />
        {/* Hero thumbnail badge if we had one */}
        {heroImgSrc !== null && (
          <div style={{ display: 'none' }}>
            <PlaceholderImg w={600} h={300} brand={brand} text={heroPlaceholder} src={heroImgSrc} />
          </div>
        )}
      </div>
    </div>
  );
}

function buildTemplateHtml(opts: {
  brand: string;
  brandName: string;
  accent: string;
  subject: string;
  body: string;
  previewText: string;
}): string {
  const { brandName, accent, subject, body } = opts;
  return `
    <div style="max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #e8e4de;">
        <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 0.14em; color: #1a1814;">
          ${brandName.toUpperCase()}
        </div>
      </div>
      <div style="padding: 28px 32px 16px;">
        <h1 style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 26px; font-weight: 700; color: #1a1814; margin: 0 0 16px; line-height: 1.25;">
          ${escapeHtml(subject)}
        </h1>
        ${body}
        <div style="margin: 28px 0 8px; text-align: center;">
          <a href="#" style="display: inline-block; background: ${accent}; color: #fff; padding: 12px 32px; border-radius: 4px; font-weight: 600; font-size: 14px; letter-spacing: 0.06em; text-decoration: none;">
            SHOP NOW
          </a>
        </div>
      </div>
      <div style="padding: 20px 32px; text-align: center; border-top: 1px solid #e8e4de; background: #faf9f6;">
        <div style="font-size: 11px; color: #9e9892; line-height: 1.6;">
          You're receiving this because you signed up.<br />
          <a href="#" style="color: #9e9892; text-decoration: underline;">Unsubscribe</a> · <a href="#" style="color: #9e9892; text-decoration: underline;">Preferences</a>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
