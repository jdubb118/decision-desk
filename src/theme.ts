// Decision Desk design tokens
// Brand-native, editorial, warm — not generic SaaS

// Brand is a free-form string; UI styling is config-driven (Day 2).
// The `brands` record below carries default palettes for any brand id we
// recognise. Unknown brand ids fall back to the `default` palette.
export type Brand = string;

type BrandPalette = {
  name: string;
  fullName: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  tintBg: string;
  badgeColor: string;
};

const defaultPalette: BrandPalette = {
  name: 'Default',
  fullName: 'Default',
  accent: '#6366f1',
  accentHover: '#4f46e5',
  accentSubtle: 'rgba(99,102,241,0.12)',
  tintBg: '#f0f0ff',
  badgeColor: '#3730a3',
};

const knownBrands: Record<string, BrandPalette> = {
  default: defaultPalette,
};

export const brands: Record<string, BrandPalette> = new Proxy(knownBrands, {
  get(target, prop: string) {
    return target[prop] ?? defaultPalette;
  },
});

export const colors = {
  // Base
  bg: '#f5f3ef',
  bgSubtle: '#efede9',
  surface: '#ffffff',
  surfaceHover: '#f8f7f4',
  border: '#e8e4de',
  borderStrong: '#d0ccc4',

  // Text
  textPrimary: '#1a1814',
  textSecondary: '#6b6560',
  textMuted: '#9e9892',
  textInverse: '#ffffff',

  // Decision states
  approve: '#2d7a4f',
  approveSubtle: 'rgba(45,122,79,0.1)',
  approveBorder: 'rgba(45,122,79,0.3)',
  discuss: '#b5770d',
  discussSubtle: 'rgba(181,119,13,0.1)',
  discussBorder: 'rgba(181,119,13,0.3)',
  deny: '#b53d2d',
  denySubtle: 'rgba(181,61,45,0.1)',
  denyBorder: 'rgba(181,61,45,0.3)',

  // Status
  statusActive: '#2d7a4f',
  statusWarning: '#b5770d',
  statusError: '#b53d2d',
  statusNeutral: '#6b6560',

  // Validation
  validPassed: '#2d7a4f',
  validWarning: '#b5770d',
  validBlocked: '#b53d2d',
};

export const fonts = {
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  lg: '0 8px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.04)',
  xl: '0 20px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)',
};

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '400ms ease',
  brand: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Module config
export const modules = [
  { id: 'email-flows', label: 'Email', icon: 'email', color: '#3d5a73' },
  { id: 'paid-media', label: 'Paid', icon: 'paid', color: '#7c5cbf' },
  { id: 'seo', label: 'SEO', icon: 'search', color: '#2d7a4f' },
  { id: 'organic-social', label: 'Social', icon: 'social', color: '#c4a35a' },
  { id: 'pr-influencer', label: 'PR', icon: 'pr', color: '#b5770d' },
  { id: 'merch', label: 'Merch', icon: 'merch', color: '#6b6560' },
] as const;

export type ModuleId = typeof modules[number]['id'];

// Campaign stage config
export const stages = [
  { id: 'briefed', label: 'Briefed', color: colors.textMuted },
  { id: 'in-review', label: 'In Review', color: colors.discuss },
  { id: 'pending', label: 'Awaiting Review', color: '#7c5cbf' },
  { id: 'approved', label: 'Approved', color: colors.approve },
  { id: 'deployed', label: 'Deployed', color: '#1a7a4f' },
  { id: 'denied', label: 'Denied', color: colors.deny },
] as const;

// Denial tags
export const denialTags = [
  { id: 'off-brand-tone', label: 'Off-brand tone' },
  { id: 'off-brand-visual', label: 'Off-brand visual' },
  { id: 'wrong-cta', label: 'Wrong CTA' },
  { id: 'factually-incorrect', label: 'Factually incorrect' },
  { id: 'needs-personalization', label: 'Needs personalization' },
  { id: 'too-long', label: 'Too long' },
  { id: 'too-short', label: 'Too short' },
  { id: 'wrong-platform-format', label: 'Wrong format' },
  { id: 'preview-quality', label: 'Preview quality' },
  { id: 'technical-error', label: 'Technical error' },
  { id: 'strategy-misalignment', label: 'Strategy mismatch' },
  { id: 'other', label: 'Other' },
];

// Agent config — colors are auto-assigned for unknown agent ids.
// Day 2 will surface this from server config so it can be customised.
const agentPalette = ['#7c5cbf', '#b5770d', '#3d5a73', '#2d7a4f', '#c4a35a', '#b53d2d', '#6b6560', '#2d6a8a'];
function colorFor(agentId: string): string {
  let h = 0;
  for (let i = 0; i < agentId.length; i++) h = (h * 31 + agentId.charCodeAt(i)) | 0;
  return agentPalette[Math.abs(h) % agentPalette.length];
}

export const agents: Record<string, { label: string; color: string }> = new Proxy({}, {
  get(_target, agentId: string) {
    return { label: agentId.charAt(0).toUpperCase() + agentId.slice(1), color: colorFor(agentId) };
  },
});
