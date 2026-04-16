// Shared utilities for calendar mockup components.
// Lightweight version — no hooks, no Deliverable dependency.

import { useState } from 'react';

export const CARD_SHADOW = '0 0 40px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.3)';

export const PENDING_ASSET = '__PENDING__';

export interface PlaceholderImgProps {
  w: number;
  h: number;
  brand: string;
  text: string;
  style?: React.CSSProperties;
  /** When `src` equals PENDING_ASSET, render the "asset pending" tile instead of a stock photo. */
  src?: string | null;
}

function brandHex(brand: string): string {
  return brand === 'deke' ? 'c4a35a' : '3d5a73';
}

function brandColor(brand: string): string {
  return brand === 'deke' ? '#c4a35a' : '#3d5a73';
}

/**
 * A unified placeholder/image renderer for calendar mockups.
 *
 * Three states:
 *   1. `src` is an absolute URL -> render it directly
 *   2. `src` is `PENDING_ASSET` -> render the "Asset pending" tile (muted brand tint + DRAFT stripe)
 *   3. `src` is null/undefined -> fall back to Picsum stock (with placehold.co fallback on error)
 */
export function PlaceholderImg({ w, h, brand, text, style, src }: PlaceholderImgProps) {
  const [useFallback, setUseFallback] = useState(false);

  if (src === PENDING_ASSET) {
    return <PendingAssetTile brand={brand} text={text} style={style} />;
  }

  if (src) {
    return (
      <img
        src={src}
        alt={text}
        onError={() => setUseFallback(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      />
    );
  }

  const seed = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'asset';
  const bg = brandHex(brand);
  if (useFallback) {
    return (
      <img
        src={`https://placehold.co/${w}x${h}/${bg}/ffffff?text=${encodeURIComponent(text)}`}
        alt={text}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      />
    );
  }
  return (
    <img
      src={`https://picsum.photos/seed/${seed}${brand}/${w}/${h}`}
      alt={text}
      onError={() => setUseFallback(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
}

/** Muted brand-tinted tile for "no asset yet" state. */
export function PendingAssetTile({
  brand,
  text,
  style,
}: {
  brand: string;
  text: string;
  style?: React.CSSProperties;
}) {
  const accent = brandColor(brand);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${accent}33 0%, ${accent}14 60%, #1a1a1a 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        ...style,
      }}
    >
      {/* Diagonal hatch pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0 2px, transparent 2px 14px)`,
          pointerEvents: 'none',
        }}
      />
      {/* Centered icon + label */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `2px dashed ${accent}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          color: accent,
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        ⬒
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: accent,
          textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 6,
        }}
      >
        Asset Pending
      </div>
      {text && (
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            maxWidth: '88%',
            lineHeight: 1.45,
            fontStyle: 'italic',
          }}
        >
          {text.length > 90 ? text.slice(0, 90) + '…' : text}
        </div>
      )}
      {/* Corner DRAFT stripe */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: -28,
          transform: 'rotate(35deg)',
          background: accent,
          color: '#000',
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.2em',
          padding: '2px 36px',
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
      >
        DRAFT
      </div>
    </div>
  );
}

/** Brand name formatter. */
export function brandLabel(brand: string): string {
  return brand === 'deke' ? 'DEKE' : brand === 'eb' ? 'Emanuel Berg' : brand.toUpperCase();
}

/** Brand accent color (hex with #). */
export function brandAccent(brand: string): string {
  return brandColor(brand);
}
