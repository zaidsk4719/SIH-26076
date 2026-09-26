/**
 * Device Geolocation & Reverse Geocoding Service
 * Provides accurate auto-detection for ANY location worldwide and across India
 * with dual-tier satellite GPS and instantaneous IP-telemetry fallback.
 */

import {
  ALL_INDIA_LOCATIONS,
  IndiaLocation,
  registerCustomIndiaLocation,
  INDIA_STATES_AND_UTS,
  IndiaRegion,
  ClimateZone,
} from '../data/indiaLocations';
import {
  getLocationCoordinates,
  registerLocationCoordinates,
} from './weatherApi';

export interface DetectedLocationResult {
  locationId: string;
  name: string;
  nameHi: string;
  state: string;
  stateHi: string;
  country: string;
  latitude: number;
  longitude: number;
  distanceToStationKm?: number;
  stationCode: string;
  source?: 'gps' | 'ip' | 'station';
}

export interface CoordinatesWithMetadata {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  source: 'gps' | 'ip';
}

/**
 * Calculates accurate great-circle distance between two GPS coordinates in kilometers (Haversine formula)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the mathematically closest meteorological station from the 160+ known AWS network
 */
export function findClosestWeatherStation(
  lat: number,
  lon: number
): { station: IndiaLocation; distanceKm: number } {
  let minDistance = Infinity;
  // Default to New Delhi (IMD National Weather Forecasting Centre) instead of Pune
  let closest = ALL_INDIA_LOCATIONS.find((l) => l.id === 'delhi') || ALL_INDIA_LOCATIONS[0];

  if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
    for (const loc of ALL_INDIA_LOCATIONS) {
      const coords = getLocationCoordinates(loc.id);
      const dist = calculateHaversineDistanceKm(lat, lon, coords.lat, coords.lon);
      if (dist < minDistance) {
        minDistance = dist;
        closest = loc;
      }
    }
  }

  return { station: closest, distanceKm: minDistance === Infinity ? 0 : minDistance };
}

/**
 * Reverse geocodes latitude/longitude into a real city, district/state, and country name.
 * Uses high-speed free reverse geocoding (Photon Komoot -> Nominatim -> Hint -> Closest Station).
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number,
  hint?: { city?: string; state?: string; country?: string }
): Promise<{ city: string; state: string; country: string }> {
  // 1. Try Photon Komoot reverse geocoding (fast, reliable, CORS enabled)
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const res = await fetch(photonUrl, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const props = data.features[0].properties || {};
        const city =
          props.city ||
          props.town ||
          props.village ||
          props.municipality ||
          props.suburb ||
          props.district ||
          props.county ||
          props.locality ||
          props.name ||
          '';
        const state = props.state || '';
        const country = props.country || 'India';
        if (city && city.toLowerCase() !== 'india') {
          return { city, state, country };
        }
      }
    }
  } catch (err) {
    console.warn('Photon reverse geocode attempt failed, trying next provider:', err);
  }

  // 2. Try OpenStreetMap Nominatim with standard User-Agent
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(nomUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mausam-IMD-WeatherApp/2.0',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.municipality ||
        addr.district ||
        addr.county ||
        addr.state_district ||
        '';
      const state = addr.state || '';
      const country = addr.country || 'India';
      if (city) {
        return { city, state, country };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode attempt failed:', err);
  }

  // 3. Use IP hint if provided
  if (hint && hint.city) {
    return {
      city: hint.city,
      state: hint.state || '',
      country: hint.country || 'India',
    };
  }

  // 4. Mathematical closest station fallback
  const closest = findClosestWeatherStation(lat, lon);
  return {
    city: closest.station.name.split(',')[0].trim(),
    state: closest.station.state,
    country: 'India',
  };
}

/**
 * Complete Auto-Detection Engine:
 * Takes coordinates, identifies the real location, registers it into the app,
 * and sets up exact coordinate telemetry so Open-Meteo fetches the real local weather.
 */
export async function autoDetectUserLocation(
  lat: number,
  lon: number,
  hint?: { city?: string; state?: string; country?: string; source?: 'gps' | 'ip' }
): Promise<DetectedLocationResult> {
  const { city, state, country } = await reverseGeocodeCoordinates(lat, lon, hint);
  const { station: closestStation, distanceKm } = findClosestWeatherStation(lat, lon);

  // If user is within 25 km of an established IMD station and matches city/district or region
  if (
    distanceKm <= 25 &&
    country.toLowerCase() === 'india' &&
    (closestStation.name.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(closestStation.name.toLowerCase().split(',')[0].trim()) ||
      closestStation.state.toLowerCase() === state.toLowerCase())
  ) {
    registerLocationCoordinates(closestStation.id, { lat, lon });
    return {
      locationId: closestStation.id,
      name: closestStation.name,
      nameHi: closestStation.nameHi,
      state: closestStation.state,
      stateHi: closestStation.stateHi,
      country: 'India',
      latitude: lat,
      longitude: lon,
      distanceToStationKm: distanceKm,
      stationCode: closestStation.stationCode,
      source: hint?.source || 'gps',
    };
  }

  // Create clean custom location for the user's exact detected city/town
  const cleanCitySlug = city.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'detected_loc';
  const cleanId = `gps_${cleanCitySlug}_${Math.round(lat * 1000)}_${Math.round(lon * 1000)}`;

  // Determine state match
  const matchedState = INDIA_STATES_AND_UTS.find(
    (s) =>
      s.name.toLowerCase() === state.toLowerCase() ||
      state.toLowerCase().includes(s.name.toLowerCase())
  );

  const displayName = state && !city.includes(state) ? `${city}, ${state}` : city;
  const displayNameHi = matchedState ? `${city}, ${matchedState.nameHi}` : displayName;

  let region: IndiaRegion = 'Central';
  let climateZone: ClimateZone = 'Deccan';
  let elevationMeters = 300;

  if (closestStation) {
    region = closestStation.region;
    climateZone = closestStation.climateZone;
    elevationMeters = closestStation.elevationMeters;
  }

  const newLoc: IndiaLocation = {
    id: cleanId,
    name: displayName,
    nameHi: displayNameHi,
    state: matchedState ? matchedState.name : (state || country || 'Detected Location'),
    stateHi: matchedState ? matchedState.nameHi : (state || country || 'पहचाना गया स्थान'),
    region,
    climateZone,
    elevationMeters,
    stationCode: `AWS-${Math.round(lat * 100)}`,
    lat,
    lon,
  };

  // Register the custom location and its exact GPS coordinates
  registerCustomIndiaLocation(newLoc);
  registerLocationCoordinates(cleanId, { lat, lon });

  // Save to persistent storage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mausam_selected_location', cleanId);
    }
  } catch {
    // Ignore storage issues
  }

  return {
    locationId: cleanId,
    name: displayName,
    nameHi: displayNameHi,
    state: newLoc.state,
    stateHi: newLoc.stateHi,
    country,
    latitude: lat,
    longitude: lon,
    distanceToStationKm: distanceKm,
    stationCode: newLoc.stationCode,
    source: hint?.source || 'gps',
  };
}

/**
 * Fetches real client location using IP Geolocation fallback
 * Used when browser GPS is blocked, denied, or times out in sandboxed frames
 */
export async function getClientIpLocation(): Promise<CoordinatesWithMetadata> {
  // Provider 1: GeoJS (super fast, high availability, no key required)
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        return {
          latitude: lat,
          longitude: lon,
          city: data.city || undefined,
          state: data.region || undefined,
          country: data.country || undefined,
          source: 'ip',
        };
      }
    }
  } catch (err) {
    console.warn('GeoJS IP lookup failed, trying secondary IP provider:', err);
  }

  // Provider 2: IPWhois
  try {
    const res = await fetch('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || undefined,
          state: data.region || undefined,
          country: data.country || undefined,
          source: 'ip',
        };
      }
    }
  } catch (err) {
    console.warn('IPWhois lookup failed:', err);
  }

  throw new Error('All IP geolocation providers failed');
}

/**
 * Dual-tier location coordinator:
 * Tier 1: Attempts high-accuracy browser navigator.geolocation
 * Tier 2: Seamlessly falls back to IP telemetry if GPS is denied or unavailable
 */
export async function requestBrowserCoordinates(): Promise<CoordinatesWithMetadata> {
  // If navigator.geolocation is supported, attempt with a 10s timeout to allow user to accept permission
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const gpsResult = await new Promise<CoordinatesWithMetadata>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              source: 'gps',
            });
          },
          (err) => {
            // If high accuracy timed out or was position unavailable, retry with fast network/wifi mode
            if (err.code === 3 /* TIMEOUT */ || err.code === 2 /* POSITION_UNAVAILABLE */) {
              navigator.geolocation.getCurrentPosition(
                (pos2) => {
                  resolve({
                    latitude: pos2.coords.latitude,
                    longitude: pos2.coords.longitude,
                    source: 'gps',
                  });
                },
                (err2) => reject(err2),
                {
                  enableHighAccuracy: false,
                  timeout: 4000,
                  maximumAge: 60000,
                }
              );
            } else {
              reject(err);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
          }
        );
      });
      return gpsResult;
    } catch (err) {
      console.warn('Browser GPS permission denied or timed out; falling back to IP telemetry:', err);
    }
  }

  // Fallback to real IP geolocation
  return await getClientIpLocation();
}
