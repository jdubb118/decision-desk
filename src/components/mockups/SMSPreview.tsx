import { CARD_SHADOW, brandPalette } from './_shared';

export interface SMSPreviewProps {
  brand: string;
  message: string;
  senderName?: string;
}

/** iPhone Messages bubble preview with segment counter. */
export function SMSPreview({ brand, message, senderName }: SMSPreviewProps) {
  const palette = brandPalette(brand);
  const brandName = senderName || palette.name;
  const bubbleColor = palette.accent;
  const charCount = message.length;
  const segments = Math.max(1, Math.ceil(charCount / 160));

  return (
    <div style={{ maxWidth: 380, width: '100%' }}>
      {/* iPhone Messages chrome */}
      <div
        style={{
          background: '#f2f2f7',
          borderRadius: 28,
          boxShadow: '0 0 0 2px #1a1a1a, 0 0 0 4px #333, ' + CARD_SHADOW,
          overflow: 'hidden',
          border: '1px solid #c7c7cc',
        }}
      >
        {/* Top bar with carrier, time */}
        <div
          style={{
            background: '#f7f7f7',
            padding: '8px 16px 0',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            fontWeight: 600,
            color: '#000',
            fontFamily: '-apple-system, sans-serif',
          }}
        >
          <span>9:41</span>
          <span>●●● 5G</span>
        </div>
        {/* Conversation header */}
        <div
          style={{
            padding: '10px 16px 12px',
            borderBottom: '1px solid #e0e0e2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ color: '#007aff', fontSize: 12, alignSelf: 'flex-start' }}>‹ Messages</span>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: bubbleColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              fontFamily: '-apple-system, sans-serif',
              marginTop: -18,
            }}
          >
            {brandName[0]}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#000',
              fontFamily: '-apple-system, sans-serif',
            }}
          >
            {brandName}
          </div>
          <div style={{ fontSize: 11, color: '#8e8e93' }}>SMS/MMS</div>
        </div>

        {/* Conversation body */}
        <div style={{ padding: '18px 12px 12px', minHeight: 140, background: '#fff' }}>
          <div style={{ fontSize: 10, color: '#8e8e93', textAlign: 'center', marginBottom: 10 }}>
            Today 9:41 AM
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <div
              style={{
                background: bubbleColor,
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '18px 18px 4px 18px',
                fontSize: 15,
                lineHeight: 1.45,
                maxWidth: '82%',
                fontFamily: '-apple-system, sans-serif',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message}
            </div>
          </div>
          <div style={{ textAlign: 'right', padding: '2px 8px 0' }}>
            <span style={{ fontSize: 11, color: '#8e8e93' }}>Delivered</span>
          </div>
        </div>

        {/* Compose bar */}
        <div
          style={{
            padding: '8px 12px 12px',
            borderTop: '1px solid #c7c7cc',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f7f7f7',
          }}
        >
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 20,
              border: '1px solid #c7c7cc',
              padding: '8px 14px',
              fontSize: 14,
              color: '#8e8e93',
            }}
          >
            iMessage
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#007aff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Segment counter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginTop: 12,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span
          style={{
            color: charCount > 160 ? '#b53d2d' : 'rgba(255,255,255,0.55)',
            fontWeight: 600,
          }}
        >
          {charCount}/160
        </span>
        {charCount > 160 && (
          <span style={{ color: '#b53d2d', fontWeight: 600 }}>{segments} segments</span>
        )}
      </div>
    </div>
  );
}
