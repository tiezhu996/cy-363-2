export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}

export interface Theme {
  id: number;
  name: string;
  type: string;
  difficulty: number;
  suggested_players: number;
  duration_minutes: number;
  description: string;
  poster_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  player_name: string;
  player_phone?: string;
}

export interface GameRecord {
  id: number;
  theme_id: number;
  team_name: string;
  player_count: number;
  completion_time_seconds: number;
  hint_count: number;
  escaped: boolean;
  record_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  theme?: Theme;
  teamMembers?: TeamMember[];
}

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  player_count: number;
  completion_time_seconds: number;
  completion_time_display: string;
  hint_count: number;
  record_date: string;
  escaped: boolean;
}

export interface ThemeLeaderboard {
  theme: {
    id: number;
    name: string;
    type: string;
    difficulty: number;
    duration_minutes: number;
  };
  leaderboard: LeaderboardEntry[];
  total_records: number;
  escape_rate: number;
  average_time: number;
}

export interface RecordRank {
  global_rank: number;
  theme_rank: number;
  total_in_theme: number;
}

export interface PlayerRecordWithRank {
  record: GameRecord;
  rank: number;
  total_in_theme: number;
}

export interface RecordListResponse {
  total: number;
  page: number;
  page_size: number;
  records: GameRecord[];
}
