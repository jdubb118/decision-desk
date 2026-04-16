import { CARD_SHADOW, PlaceholderImg, brandLabel } from './_shared';

export interface FBFeedPostProps {
  brand: string;
  caption: string;
  imgSrc: string | null;
  placeholderText: string;
  /** Optional layout hint: 'reel' = 9:16, 'carousel' = shows stacked dots, others use 1.91:1 */
  variant?: 'image' | 'reel' | 'carousel' | 'link';
  linkDomain?: string;
  linkTitle?: string;
}

/**
 * Organic Facebook Page post (NOT a Sponsored ad). Used for any facebook/*
 * calendar entry. For paid ads, CardPreview still uses the old ad-copy block.
 */
export function FBFeedPost({
  brand,
  caption,
  imgSrc,
  placeholderText,
  variant = 'image',
  linkDomain,
  linkTitle,
}: FBFeedPostProps) {
  const brandName = brandLabel(brand);
  const accent = brand === 'deke' ? '#c4a35a' : '#3d5a73';
  const imageAspect = variant === 'reel' ? '9/16' : '1.91/1';
  const imageWidth = variant === 'reel' ? 400 : 800;
  const imageHeight = variant === 'reel' ? 720 : 420;

  return (
    <div
      style={{
        maxWidth: 500,
        width: '100%',
        background: '#fff',
        borderRadius: 8,
        boxShadow: CARD_SHADOW,
        border: '1px solid #dddfe2',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {brandName[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#050505' }}>{brandName}</span>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="#1877f2">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.7 5.3l-4 5a.75.75 0 0 1-1.1.1l-2.5-2a.75.75 0 1 1 .9-1.2l1.9 1.5 3.5-4.4a.75.75 0 1 1 1.2.9z" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#65676b',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>2h</span>
            <span>·</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#65676b">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#65676b" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="#65676b" />
            </svg>
          </div>
        </div>
        <div style={{ color: '#65676b', fontSize: 24, lineHeight: 1 }}>···</div>
      </div>

      {/* Primary text */}
      {caption && (
        <div
          style={{
            padding: '0 16px 12px',
            fontSize: 15,
            lineHeight: 1.45,
            color: '#050505',
            whiteSpace: 'pre-wrap',
          }}
        >
          {caption.length > 300 ? caption.slice(0, 300) + '… See more' : caption}
        </div>
      )}

      {/* Media */}
      {variant === 'link' ? (
        <div style={{ margin: '0 0', borderTop: '1px solid #dddfe2', background: '#f0f2f5' }}>
          <div style={{ aspectRatio: '1.91/1', position: 'relative' }}>
            <PlaceholderImg
              w={imageWidth}
              h={imageHeight}
              brand={brand}
              text={placeholderText}
              src={imgSrc}
            />
          </div>
          <div style={{ padding: '10px 16px' }}>
            <div
              style={{
                fontSize: 12,
                color: '#65676b',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {linkDomain || (brand === 'eb' ? 'emanuel-berg.com' : 'deke-style.com')}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#050505',
                lineHeight: 1.3,
                marginTop: 2,
              }}
            >
              {linkTitle || caption.split('\n')[0].slice(0, 70) || 'Explore the collection'}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            aspectRatio: imageAspect,
            background: '#000',
            position: 'relative',
            maxHeight: variant === 'reel' ? 600 : undefined,
          }}
        >
          <PlaceholderImg
            w={imageWidth}
            h={imageHeight}
            brand={brand}
            text={placeholderText}
            src={imgSrc}
          />
          {variant === 'reel' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: '16px solid #fff',
                    marginLeft: 4,
                  }}
                />
              </div>
            </div>
          )}
          {variant === 'carousel' && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                padding: '3px 8px',
                borderRadius: 12,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              1/4
            </div>
          )}
        </div>
      )}

      {/* Reactions summary */}
      <div
        style={{
          padding: '10px 16px 8px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e4e6eb',
          fontSize: 13,
          color: '#65676b',
        }}
      >
        <div style={{ display: 'flex', marginRight: 6 }}>
          <span style={{ fontSize: 16, marginRight: -4, position: 'relative', zIndex: 3 }}>👍</span>
          <span style={{ fontSize: 16, marginRight: -4, position: 'relative', zIndex: 2 }}>❤️</span>
          <span style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>😮</span>
        </div>
        <span>142</span>
        <div style={{ flex: 1 }} />
        <span>18 comments · 5 shares</span>
      </div>

      {/* Action bar */}
      <div
        style={{
          padding: '4px 8px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {[
          { icon: '👍', label: 'Like' },
          { icon: '💬', label: 'Comment' },
          { icon: '↗', label: 'Share' },
        ].map((a) => (
          <span
            key={a.label}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#65676b',
              padding: '10px 12px',
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
