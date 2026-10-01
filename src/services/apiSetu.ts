/**
 * API Setu Service Module (Client-Side)
 * Consumes the official Mausam (IMD) Collection via the backend gateway.
 * 
 * Supports:
 * - District Warnings (districtwarning)
 */

export interface ApiSetuResponse<T> {
  status: string;
  provider: string;
  timestamp: string;
  data: T;
}

/**
 * Fetch district warning from API Setu Mausam Collection
 */
export interface ApiSetuWarning {
  day: string;
  warning_level: string;
  warning_type: string;
  description: string;
}

export async function fetchApiSetuWarnings(district: string): Promise<ApiSetuWarning[] | null> {
  try {
    const res = await fetch(`/api/apisetu/mausam/districtwarning?district=${encodeURIComponent(district)}`);
    if (!res.ok) return null;
    const json: ApiSetuResponse<{ district: string; warnings: ApiSetuWarning[] }> = await res.json();
    return json.data.warnings;
  } catch (err) {
    console.error('[ApiSetu Service] Error fetching warnings:', err);
    return null;
  }
}
