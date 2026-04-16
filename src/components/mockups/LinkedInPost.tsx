import { CARD_SHADOW, PlaceholderImg, brandLabel } from './_shared';

export interface LinkedInPostProps {
  brand: string;
  caption: string;
  imgSrc: string | null;
  placeholderText: string;
  /** When true, show founder persona header; when false, company header. */
  isFounder?: boolean;
  /** Optional sub-type hint. 'document' = PDF carousel, 'text' = skip image. */
  subChannel?: 'company-post' | 'founder-post' | 'text post' | 'text-post' | 'document' | 'carousel';
  founderName?: string;
  founderHeadline?: string;
}

/**
 * LinkedIn post mockup — handles both company-page posts and founder (personal-profile) posts.
 * For `subChannel='text post'`, image is omitted.
 */
export function LinkedInPost({
  brand,
  caption,
  imgSrc,
  placeholderText,
  isFounder = false,
  subChannel,
  founderName,
  founderHeadline,
}: LinkedInPostProps) {
  const brandName = brandLabel(brand);
  const accent = brand === 'deke' ? '#c4a35a' : '#3d5a73';
  const isTextOnly = subChannel === 'text post' || subChannel === 'text-post';
  const isDocument = subChannel === 'document' || subChannel === 'carousel';

  const displayName = isFounder
    ? founderName || (brand === 'deke' ? 'Russ' : 'Oscar Lindberg')
    : brandName;
  const displayHeadline = isFounder
    ? founderHeadline ||
      (brand === 'deke'
        ? 'Founder at DEKE Style Journey · Menswear built on one simple idea'
        : 'Founder at Emanuel Berg · Swedish shirts, made for how we live now')
    : null;

  return (
    <div
      style={{
        maxWidth: 552,
        width: '100%',
        background: '#fff',
        borderRadius: 8,
        boxShadow: CARD_SHADOW,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {isFounder ? (
          // Person profile pic: circle
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: accent,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {displayName[0]}
          </div>
        ) : (
          // Company logo: rounded square
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 4,
              background: accent,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {brandName[0]}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
              fontSize: 14,
              color: 'rgba(0,0,0,.9)',
            }}
          >
            {displayName}
            {isFounder && (
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(0,0,0,.5)',
                  background: '#f3f2ef',
                  padding: '0 5px',
                  borderRadius: 2,
                  fontWeight: 400,
                }}
              >
                1st
              </span>
            )}
          </div>
          {isFounder ? (
            <div
              style={{
                fontSize: 12,
                color: 'rgba(0,0,0,.6)',
                marginTop: 1,
                lineHeight: 1.35,
              }}
            >
              {displayHeadline}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,.6)', marginTop: 1 }}>
              2,847 followers
            </div>
          )}
          <div
            style={{
              fontSize: 12,
              color: 'rgba(0,0,0,.6)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 2,
            }}
          >
            2h
            <span>·</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="rgba(0,0,0,.4)" strokeWidth="1.5" />
              <path
                d="M8 3v5l3.5 2"
                stroke="rgba(0,0,0,.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,0,0,.4)">
          <circle cx="12" cy="6" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="18" r="2" />
        </svg>
      </div>

      {/* Post body */}
      {caption && (
        <div
          style={{
            padding: '0 16px 12px',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'rgba(0,0,0,.9)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {caption.length > 300 ? (
            <>
              {caption.slice(0, 300)}
              <span style={{ color: 'rgba(0,0,0,.6)', cursor: 'pointer' }}>… see more</span>
            </>
          ) : (
            caption
          )}
        </div>
      )}

      {/* Media (only when not text-only) */}
      {!isTextOnly && (
        <div style={{ position: 'relative', aspectRatio: isDocument ? '1/1' : '1.91/1' }}>
          <PlaceholderImg
            w={800}
            h={isDocument ? 800 : 420}
            brand={brand}
            text={placeholderText}
            src={imgSrc}
          />
          {isDocument && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                padding: '3px 10px',
                borderRadius: 4,
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              PDF · 8 pages
            </div>
          )}
        </div>
      )}

      {/* Reactions */}
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', marginRight: 6 }}>
          <span style={{ fontSize: 14, marginRight: -2 }}>👍</span>
          <span style={{ fontSize: 14, marginRight: -2 }}>💡</span>
          <span style={{ fontSize: 14 }}>❤️</span>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,.6)' }}>{isFounder ? '184' : '42'}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,.6)' }}>
          {isFounder ? '28 comments · 6 reposts' : '6 comments · 2 reposts'}
        </span>
      </div>

      {/* Action bar */}
      <div
        style={{
          padding: '4px 8px 8px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {[
          { icon: '👍', label: 'Like' },
          { icon: '💬', label: 'Comment' },
          { icon: '🔁', label: 'Repost' },
          { icon: '✉', label: 'Send' },
        ].map((a) => (
          <span
            key={a.label}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(0,0,0,.6)',
              padding: '10px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{a.icon}</span>
            {a.label}
          </span>
        ))}
      </div>
    </div>
  );
}
