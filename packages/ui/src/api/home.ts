export interface HomePageDto {
  id: string;
  hero_title: Record<string, string>;
  hero_subtitle: Record<string, string>;
  hero_cta_label: Record<string, string>;
  highlights: Array<{ title: Record<string, string>; description: Record<string, string>; icon_key?: string }>;
  version: number;
  updated_at: string;
}

import { readAccessToken } from "./auth";

function authHeaders(): HeadersInit {
  const token = readAccessToken();
  if (!token) {
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getPublicHome(): Promise<HomePageDto> {
  const response = await fetch("/api/public/home");
  if (!response.ok) {
    throw new Error("Failed to load home");
  }
  return (await response.json()) as HomePageDto;
}

export async function patchAdminHome(input: {
  hero_title: Record<string, string>;
  hero_subtitle: Record<string, string>;
}): Promise<HomePageDto> {
  const response = await fetch("/api/admin/home", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update home: ${response.status}`);
  }

  return (await response.json()) as HomePageDto;
}
