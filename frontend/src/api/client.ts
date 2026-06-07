import { API_BASE_URL } from "../constants/app";
import type {
  OverviewResponse,
  Theme,
  GameRecord,
  ThemeLeaderboard,
  RecordRank,
  PlayerRecordWithRank,
  RecordListResponse,
} from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchThemes(params?: {
  type?: string;
  is_active?: boolean;
}): Promise<Theme[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.is_active !== undefined)
    query.set("is_active", String(params.is_active));

  const response = await fetch(
    `${API_BASE_URL}/themes${query.toString() ? `?${query.toString()}` : ""}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Themes request failed: ${response.status}`);
  }

  return response.json() as Promise<Theme[]>;
}

export async function fetchTheme(id: number): Promise<Theme> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Theme request failed: ${response.status}`);
  }

  return response.json() as Promise<Theme>;
}

export async function createTheme(data: Partial<Theme>): Promise<Theme> {
  const response = await fetch(`${API_BASE_URL}/themes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Create theme failed: ${response.status}`);
  }

  return response.json() as Promise<Theme>;
}

export async function updateTheme(
  id: number,
  data: Partial<Theme>
): Promise<Theme> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Update theme failed: ${response.status}`);
  }

  return response.json() as Promise<Theme>;
}

export async function deleteTheme(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Delete theme failed: ${response.status}`);
  }
}

export async function fetchRecords(params?: {
  theme_id?: number;
  start_date?: string;
  end_date?: string;
  escaped?: boolean;
  page?: number;
  page_size?: number;
}): Promise<RecordListResponse> {
  const query = new URLSearchParams();
  if (params?.theme_id) query.set("theme_id", String(params.theme_id));
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.escaped !== undefined)
    query.set("escaped", String(params.escaped));
  if (params?.page) query.set("page", String(params.page));
  if (params?.page_size) query.set("page_size", String(params.page_size));

  const response = await fetch(
    `${API_BASE_URL}/records${query.toString() ? `?${query.toString()}` : ""}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Records request failed: ${response.status}`);
  }

  return response.json() as Promise<RecordListResponse>;
}

export async function fetchRecord(id: number): Promise<GameRecord> {
  const response = await fetch(`${API_BASE_URL}/records/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Record request failed: ${response.status}`);
  }

  return response.json() as Promise<GameRecord>;
}

export async function createRecord(data: {
  theme_id: number;
  team_name: string;
  player_count: number;
  completion_time_seconds: number;
  hint_count: number;
  escaped: boolean;
  record_date: string;
  notes?: string;
  team_members?: { player_name: string; player_phone?: string }[];
}): Promise<GameRecord> {
  const response = await fetch(`${API_BASE_URL}/records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Create record failed: ${response.status}`);
  }

  return response.json() as Promise<GameRecord>;
}

export async function updateRecord(
  id: number,
  data: Partial<GameRecord> & {
    team_members?: { player_name: string; player_phone?: string }[];
  }
): Promise<GameRecord> {
  const response = await fetch(`${API_BASE_URL}/records/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Update record failed: ${response.status}`);
  }

  return response.json() as Promise<GameRecord>;
}

export async function deleteRecord(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/records/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Delete record failed: ${response.status}`);
  }
}

export async function fetchPlayerRecords(phone: string): Promise<GameRecord[]> {
  const response = await fetch(
    `${API_BASE_URL}/records/player?phone=${encodeURIComponent(phone)}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Player records request failed: ${response.status}`);
  }

  return response.json() as Promise<GameRecord[]>;
}

export async function fetchAllLeaderboards(limit?: number): Promise<ThemeLeaderboard[]> {
  const query = limit ? `?limit=${limit}` : "";
  const response = await fetch(`${API_BASE_URL}/leaderboards${query}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Leaderboards request failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeLeaderboard[]>;
}

export async function fetchThemeLeaderboard(
  themeId: number,
  limit?: number,
  escapedOnly?: boolean
): Promise<ThemeLeaderboard> {
  const query = new URLSearchParams();
  if (limit) query.set("limit", String(limit));
  if (escapedOnly !== undefined) query.set("escaped_only", String(escapedOnly));

  const response = await fetch(
    `${API_BASE_URL}/leaderboards/theme/${themeId}${query.toString() ? `?${query.toString()}` : ""}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Theme leaderboard request failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeLeaderboard>;
}

export async function fetchRecordRank(recordId: number): Promise<RecordRank> {
  const response = await fetch(
    `${API_BASE_URL}/leaderboards/record/${recordId}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Record rank request failed: ${response.status}`);
  }

  return response.json() as Promise<RecordRank>;
}

export async function fetchPlayerRank(
  phone: string,
  themeId?: number
): Promise<PlayerRecordWithRank[]> {
  const query = new URLSearchParams();
  query.set("phone", phone);
  if (themeId) query.set("theme_id", String(themeId));

  const response = await fetch(
    `${API_BASE_URL}/leaderboards/player?${query.toString()}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Player rank request failed: ${response.status}`);
  }

  return response.json() as Promise<PlayerRecordWithRank[]>;
}
