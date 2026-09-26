import { INDIA_STATES_AND_UTS, IndiaStateInfo } from '../data/indiaLocations';

// Comprehensive set of known Indian State / UT normalized names
const INDIAN_STATE_NAMES = new Set(
  INDIA_STATES_AND_UTS.map((s) => s.name.toLowerCase())
);

// Map common aliases/variations to standard Indian State names
const STATE_ALIASES: Record<string, string> = {
  ncr: 'Delhi',
  delhi: 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'delhi ncr': 'Delhi',
  'jammu and kashmir': 'Jammu & Kashmir',
  'jammu & kashmir': 'Jammu & Kashmir',
  pondicherry: 'Puducherry',
  orissa: 'Odisha',
  uttaranchal: 'Uttarakhand',
  'andaman and nicobar': 'Andaman & Nicobar Islands',
  'andaman and nicobar islands': 'Andaman & Nicobar Islands',
  'dadra and nagar haveli': 'Dadra & Nagar Haveli',
  'daman and diu': 'Daman & Diu',
};

/**
 * Checks if a given string or code indicates an Indian location.
 */
export function isIndianState(stateOrCountry?: string): boolean {
  if (!stateOrCountry) return false;
  const clean = stateOrCountry.trim().toLowerCase();
  if (clean === 'in' || clean === 'ind' || clean === 'india' || clean === 'bharat') return true;
  if (INDIAN_STATE_NAMES.has(clean)) return true;
  if (STATE_ALIASES[clean]) return true;
  return INDIA_STATES_AND_UTS.some((s) => clean.includes(s.name.toLowerCase()));
}

/**
 * Cleans any numeric codes, IDs, zipcodes, or internal strings from city/state names.
 * NASHIK 117634 -> Nashik
 * Nashik, 117634 -> Nashik
 */
export function sanitizePlaceName(text: string): string {
  if (!text) return '';
  return text
    .replace(/\b\d{4,10}\b/g, '') // remove numeric postal/database/station IDs
    .replace(/aws[-_]?\d+/gi, '') // remove station code fragments
    .replace(/[_-]+/g, ' ') // replace underscores/hyphens with space
    .replace(/,\s*,/g, ',') // remove double commas
    .replace(/\s+/g, ' ') // collapse multi spaces
    .trim()
    .replace(/^,\s*|,\s*$/g, ''); // trim leading/trailing commas
}

/**
 * Standardizes any Indian location display to "City/Town, State"
 * Strictly removes any technical IDs, postal codes, or raw API noise.
 * Examples:
 * - formatIndianLocationDisplay("Pune, Maharashtra") -> "Pune, Maharashtra"
 * - formatIndianLocationDisplay("Nashik 117634", "Maharashtra") -> "Nashik, Maharashtra"
 * - formatIndianLocationDisplay("delhi") -> "Delhi, Delhi"
 */
export function formatIndianLocationDisplay(
  cityName: string,
  stateName?: string,
  language: 'en' | 'hi' = 'en'
): string {
  let cleanCity = sanitizePlaceName(cityName);
  let cleanState = sanitizePlaceName(stateName || '');

  // If city contains comma, split it
  if (cleanCity.includes(',')) {
    const parts = cleanCity.split(',').map((p) => p.trim()).filter(Boolean);
    cleanCity = parts[0];
    if (!cleanState && parts.length > 1) {
      cleanState = parts[1];
    }
  }

  // Capitalize properly
  cleanCity = cleanCity
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // Match state if possible
  if (cleanState) {
    const lowerState = cleanState.toLowerCase();
    const matchedState = INDIA_STATES_AND_UTS.find(
      (s) =>
        s.name.toLowerCase() === lowerState ||
        lowerState.includes(s.name.toLowerCase()) ||
        s.code.toLowerCase() === lowerState
    );

    if (matchedState) {
      cleanState = language === 'hi' ? matchedState.nameHi : matchedState.name;
    } else {
      cleanState = cleanState
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  } else {
    // Attempt state lookup from known lists or default
    const matchedFromCity = INDIA_STATES_AND_UTS.find(
      (s) => s.capital.toLowerCase() === cleanCity.toLowerCase()
    );
    if (matchedFromCity) {
      cleanState = language === 'hi' ? matchedFromCity.nameHi : matchedFromCity.name;
    }
  }

  // If cleanState is "India" or missing and cleanCity matches state name (e.g. Delhi)
  if (!cleanState || cleanState.toLowerCase() === 'india' || cleanState.toLowerCase() === 'bharat') {
    const stateMatch = INDIA_STATES_AND_UTS.find(
      (s) => s.name.toLowerCase() === cleanCity.toLowerCase()
    );
    if (stateMatch) {
      cleanState = language === 'hi' ? stateMatch.nameHi : stateMatch.name;
    }
  }

  if (cleanState && cleanState.toLowerCase() !== cleanCity.toLowerCase()) {
    return `${cleanCity}, ${cleanState}`;
  }

  if (cleanCity.toLowerCase() === 'delhi' || cleanCity.toLowerCase() === 'new delhi') {
    return language === 'hi' ? 'दिल्ली, दिल्ली' : 'Delhi, Delhi';
  }

  return cleanState ? `${cleanCity}, ${cleanState}` : cleanCity;
}
