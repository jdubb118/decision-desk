export interface Deliverable {
  id: string;
  campaign_id: string;
  agent_id: string;
  type: string;
  title: string;
  version: number;
  html_content: string | null;
  status: string;
  subject_line: string | null;
  brand: string;
  module: string;
  campaign_title: string;
  validation_status: string;
  validation_results: Array<{ check: string; type: string; passed: boolean; message: string }> | null;
  submitted_at: string;
  scheduled_for: string | null;
  metadata: Record<string, unknown> | null;
  content_path: string | null;
  priority_score: number;
  siblings_waiting: number;
  executed_at: string | null;
  executed_by: string | null;
  execution_status: string | null;
  execution_notes: string | null;
}

export type SwipeDirection = 'approve' | 'deny' | 'discuss' | null;

export interface CardContext {
  consequence: string;
  sequence: {
    position: number;
    total: number;
    statuses: string[];
    campaignTitle: string;
  } | null;
  blockingCount: number;
  priorDenials: Array<{ version: number; verdict: string; denial_tags: string[]; notes: string | null }>;
  reviewerNote: string | null;
  agentHistory: Array<{ verdict: string; created_at: string; notes: string | null }>;
  agentStats: { total: number; approved: number; rate: number; topDenialTag: string | null };
  qa: {
    qaReviewed: boolean;
    agentSelfScore: number | null;
    agentNote: string | null;
    overallConfidence: string | null;
    qaScore: number | null;
    technicalScore: number;
    passedChecks: number;
    totalChecks: number;
  };
}

export interface MorningBrief {
  queue_depth: number;
  new_since_24h: number;
  stalled_campaigns: Array<{ title: string; stage: string; updated_at: string }>;
  perf_results: Array<{ title: string; verdict: string; notes: string | null }>;
  silent_agents: Array<{ agent: string; days: number }>;
  pending_perf_count: number;
}

export interface SessionStats {
  count: number;
  approvals: number;
  denials: number;
  avgGapSeconds: number | null;
  streak: number;
  streakType: string | null;
}
