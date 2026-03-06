export interface CacheHeaders {
  [name: string]: string;
}

export function mediaCacheHeaders(): CacheHeaders {
  return {
    "Cache-Control": "public, max-age=31536000, immutable",
  };
}
