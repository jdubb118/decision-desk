import { colors } from '../theme';

const ACTION_LABELS: Record<string, [string, string, string]> = {
  'performance-update':  ['Advance', 'Discuss', 'Kill'],
  'question':            ['Answer',  'Discuss', 'Skip'],
  'recommendation':      ['Act',     'Discuss', 'Pass'],
  'research-summary':    ['Act',     'Discuss', 'Noted'],
  'blocker-escalation':  ['Resolve', 'Discuss', 'Defer'],
  'content-brief':       ['Approve', 'Discuss', 'Hold'],
  'influencer-proposal': ['Approve', 'Discuss', 'Pass'],
  'decision-point':      ['Yes',     'Discuss', 'No'],
  '_default':            ['Approve', 'Discuss', 'Deny'],
};

interface ActionBarProps {
  type: string;
  dpOptions: Array<{ id?: string; label: string; description?: string }> | null;
  isBlocked: boolean;
  onApprove: () => void;
  onDiscuss: () => void;
  onDeny: () => void;
  onSkip: () => void;
  queuePosition: number;
  queueTotal: number;
}

export function ActionBar({ type, dpOptions, isBlocked, onApprove, onDiscuss, onDeny, onSkip, queuePosition, queueTotal }: ActionBarProps) {
  const labels = ACTION_LABELS[type] || ACTION_LABELS._default;
  const [yesLabel, midLabel, noLabel] = labels;

  const finalYes = dpOptions?.[0]?.label || yesLabel;
  const finalNo = dpOptions?.[1]?.label || noLabel;
  const noIsMuted = type === 'question' || type === 'research-summary';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '10px 20px',
      background: '#0d0d1a',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    }}>
      {/* Deny */}
      <ActionButton
        label={finalNo}
        hint="← swipe left"
        color={noIsMuted ? '#666' : colors.deny}
        hoverBg={noIsMuted ? 'rgba(255,255,255,0.04)' : 'rgba(181,61,45,0.12)'}
        onClick={onDeny}
      />

      {/* Skip + Queue counter */}
      <button
        onClick={onSkip}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          padding: '8px 12px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        title="Skip (Esc)"
      >
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#fff',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {queuePosition}<span style={{ opacity: 0.3 }}>/{queueTotal}</span>
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
          skip · esc
        </div>
      </button>

      {/* Discuss */}
      <ActionButton
        label={midLabel}
        hint="↑ swipe up"
        color={colors.discuss}
        hoverBg="rgba(181,119,13,0.12)"
        onClick={onDiscuss}
      />

      {/* Approve */}
      <ActionButton
        label={finalYes}
        hint="→ swipe right"
        color={colors.approve}
        hoverBg="rgba(45,122,79,0.12)"
        onClick={onApprove}
        disabled={isBlocked && type !== 'question'}
        primary
      />
    </div>
  );
}

function ActionButton({ label, hint, color, hoverBg, onClick, disabled, primary }: {
  label: string;
  hint: string;
  color: string;
  hoverBg: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 0',
        borderRadius: 10,
        background: primary ? `${color}18` : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${disabled ? 'rgba(255,255,255,0.06)' : `${color}40`}`,
        color: disabled ? 'rgba(255,255,255,0.2)' : color,
        fontSize: 13,
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms ease',
        minWidth: 120,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = primary ? `${color}18` : 'rgba(255,255,255,0.03)';
      }}
    >
      <span>{label}</span>
      <span style={{
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        opacity: 0.45,
        fontWeight: 500,
        letterSpacing: '0.03em',
      }}>{hint}</span>
    </button>
  );
}
