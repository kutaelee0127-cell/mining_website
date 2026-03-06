import { readAccessToken } from "./auth";

export interface AboutPageDto {
  id: string;
  brand_story: Record<string, string>;
  designer_intro: Record<string, string>;
  designer_profile_ids: string[];
  location_block: {
    address: Record<string, string>;
    naver_map_url: string;
    transport_hint?: Record<string, string>;
    parking_hint?: Record<string, string>;
    phone?: string;
  };
  version: number;
  updated_at: string;
}

export interface BookingDto {
  booking_url: string;
  open_in_new_tab: boolean;
  note: Record<string, string>;
  version: number;
  updated_at: string;
}

function adminHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getPublicAbout(): Promise<AboutPageDto> {
  const response = await fetch("/api/public/about");
  if (!response.ok) {
    throw new Error(`Failed about load: ${response.status}`);
  }
  return (await response.json()) as AboutPageDto;
}

export async function patchAdminAbout(input: {
  brand_story?: Record<string, string>;
  designer_intro?: Record<string, string>;
  location_block?: { naver_map_url?: string; address?: Record<string, string> };
}): Promise<AboutPageDto> {
  const response = await fetch("/api/admin/about", {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Failed about patch: ${response.status}`);
  }
  return (await response.json()) as AboutPageDto;
}

export async function getPublicBooking(): Promise<BookingDto> {
  const response = await fetch("/api/public/booking");
  if (!response.ok) {
    throw new Error(`Failed booking load: ${response.status}`);
  }
  return (await response.json()) as BookingDto;
}

export async function patchAdminBooking(input: {
  booking_url?: string;
  note?: Record<string, string>;
  open_in_new_tab?: boolean;
}): Promise<BookingDto> {
  const response = await fetch("/api/admin/booking", {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Failed booking patch: ${response.status}`);
  }
  return (await response.json()) as BookingDto;
}
