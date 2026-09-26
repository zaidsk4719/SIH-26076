import { CurrentWeather, HourlyForecastItem, DailyForecastItem, HealthData } from '../types';
import { findIndiaLocation } from '../data/indiaLocations';
import { sanitizePlaceName } from '../utils/locationFormatter';

export interface LocationCoords {
  lat: number;
  lon: number;
}

// Curated geographic coordinates for Indian cities & IMD weather stations
export const INDIA_COORDINATES: Record<string, LocationCoords> = {
  pune: { lat: 18.5204, lon: 73.8567 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  delhi: { lat: 28.6139, lon: 77.209 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  srinagar: { lat: 34.0837, lon: 74.7973 },
  shimla: { lat: 31.1048, lon: 77.1734 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  hyderabad: { lat: 17.385, lon: 78.4867 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  guwahati: { lat: 26.1445, lon: 91.7362 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  patna: { lat: 25.5941, lon: 85.1376 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  goa: { lat: 15.4909, lon: 73.8278 },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  dehradun: { lat: 30.3165, lon: 78.0322 },
  bhubaneswar: { lat: 20.2961, lon: 85.8245 },
  ranchi: { lat: 23.3441, lon: 85.3096 },
  raipur: { lat: 21.2514, lon: 81.6296 },
  agartala: { lat: 23.8315, lon: 91.2868 },
  shillong: { lat: 25.5788, lon: 91.8933 },
  imphal: { lat: 24.817, lon: 93.9368 },
  aizawl: { lat: 23.7271, lon: 92.7176 },
  kohima: { lat: 25.6751, lon: 94.1086 },
  itanagar: { lat: 27.0844, lon: 93.6053 },
  gangtok: { lat: 27.3389, lon: 88.6065 },
  port_blair: { lat: 11.6234, lon: 92.7265 },
  leh: { lat: 34.1526, lon: 77.5771 },
  varanasi: { lat: 25.3176, lon: 82.9739 },
  amritsar: { lat: 31.634, lon: 74.8723 },
  indore: { lat: 22.7196, lon: 75.8577 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  visakhapatnam: { lat: 17.6868, lon: 83.2185 },
  madurai: { lat: 9.9252, lon: 78.1198 },
  surat: { lat: 21.1702, lon: 72.8311 },
  kanpur: { lat: 26.4499, lon: 80.3319 },
  mangalore: { lat: 12.9141, lon: 74.856 },
  mysuru: { lat: 12.2958, lon: 76.6394 },
  jodhpur: { lat: 26.2389, lon: 73.0243 },
  udaipur: { lat: 24.5854, lon: 73.7125 },
  darjeeling: { lat: 27.041, lon: 88.2663 },
  nashik: { lat: 19.9975, lon: 73.7898 },
  aurangabad: { lat: 19.8762, lon: 75.3433 },
  chhatrapati_sambhajinagar: { lat: 19.8762, lon: 75.3433 },
  kolhapur: { lat: 16.705, lon: 74.2433 },
  solapur: { lat: 17.6599, lon: 75.9064 },
  // Additional comprehensive Indian cities
  thane: { lat: 19.2183, lon: 72.9781 },
  pimpri_chinchwad: { lat: 18.6279, lon: 73.8009 },
  kalyan_dombivli: { lat: 19.2403, lon: 73.1305 },
  kalyan: { lat: 19.2403, lon: 73.1305 },
  vasai_virar: { lat: 19.3919, lon: 72.8397 },
  navi_mumbai: { lat: 19.033, lon: 73.0297 },
  mira_bhayandar: { lat: 19.2952, lon: 72.8544 },
  bhiwandi: { lat: 19.3002, lon: 73.0588 },
  amravati: { lat: 20.9374, lon: 77.7796 },
  nanded: { lat: 19.1383, lon: 77.321 },
  akola: { lat: 20.7002, lon: 77.0082 },
  ulhasnagar: { lat: 19.2215, lon: 73.1645 },
  sangli: { lat: 16.8524, lon: 74.5815 },
  malegaon: { lat: 20.5579, lon: 74.5289 },
  jalgaon: { lat: 21.0077, lon: 75.5626 },
  latur: { lat: 18.4088, lon: 76.5604 },
  dhule: { lat: 20.9042, lon: 74.7749 },
  ahmednagar: { lat: 19.0948, lon: 74.748 },
  chandrapur: { lat: 19.9615, lon: 79.2961 },
  parbhani: { lat: 19.2686, lon: 76.7708 },
  jalna: { lat: 19.841, lon: 75.8864 },
  satara: { lat: 17.6805, lon: 73.9935 },
  panvel: { lat: 18.9894, lon: 73.1175 },
  ratnagiri: { lat: 16.9902, lon: 73.312 },
  shirdi: { lat: 19.7645, lon: 74.477 },
  lonavala: { lat: 18.7557, lon: 73.4091 },
  ghaziabad: { lat: 28.6692, lon: 77.4538 },
  meerut: { lat: 28.9845, lon: 77.7064 },
  bareilly: { lat: 28.367, lon: 79.4304 },
  aligarh: { lat: 27.8974, lon: 78.088 },
  moradabad: { lat: 28.8386, lon: 78.7733 },
  saharanpur: { lat: 29.964, lon: 77.546 },
  gorakhpur: { lat: 26.7606, lon: 83.3732 },
  firozabad: { lat: 27.1591, lon: 78.3957 },
  jhansi: { lat: 25.4484, lon: 78.5685 },
  muzaffarnagar: { lat: 29.4727, lon: 77.7085 },
  mathura: { lat: 27.4924, lon: 77.6737 },
  rampur: { lat: 28.8154, lon: 79.025 },
  shahjahanpur: { lat: 27.8804, lon: 79.912 },
  farrukhabad: { lat: 27.3826, lon: 79.5824 },
  hapur: { lat: 28.7306, lon: 77.7759 },
  amroha: { lat: 28.9034, lon: 78.4682 },
  raebareli: { lat: 26.2303, lon: 81.2409 },
  bahraich: { lat: 27.5705, lon: 81.5977 },
  jaunpur: { lat: 25.7464, lon: 82.6837 },
  mirzapur: { lat: 25.1337, lon: 82.5644 },
  vrindavan: { lat: 27.5806, lon: 77.7006 },
  bhavnagar: { lat: 21.7645, lon: 72.1519 },
  jamnagar: { lat: 22.4707, lon: 70.0577 },
  junagadh: { lat: 21.5222, lon: 70.4579 },
  gandhinagar: { lat: 23.2156, lon: 72.6369 },
  anand: { lat: 22.5645, lon: 72.9289 },
  navsari: { lat: 20.9507, lon: 72.9328 },
  morbi: { lat: 22.8173, lon: 70.8378 },
  bharuch: { lat: 21.7051, lon: 72.9959 },
  porbandar: { lat: 21.6417, lon: 69.6293 },
  gandhidham: { lat: 23.0753, lon: 70.1337 },
  valsad: { lat: 20.6105, lon: 72.9342 },
  mehsana: { lat: 23.588, lon: 72.3693 },
  somnath: { lat: 20.9016, lon: 70.4011 },
  dwarka: { lat: 22.2442, lon: 68.9685 },
  kalaburagi: { lat: 17.3297, lon: 76.8343 },
  belagavi: { lat: 15.8497, lon: 74.4977 },
  davanagere: { lat: 14.4644, lon: 75.9218 },
  ballari: { lat: 15.1394, lon: 76.9214 },
  vijayapura: { lat: 16.8302, lon: 75.71 },
  shivamogga: { lat: 13.9299, lon: 75.5681 },
  tumakuru: { lat: 13.3409, lon: 77.1006 },
  raichur: { lat: 16.212, lon: 77.3439 },
  bidar: { lat: 17.9104, lon: 77.5199 },
  hassan: { lat: 13.0072, lon: 76.0962 },
  udupi: { lat: 13.3409, lon: 74.7421 },
  chitradurga: { lat: 14.2251, lon: 76.398 },
  madikeri: { lat: 12.4244, lon: 75.7382 },
  hampi: { lat: 15.335, lon: 76.46 },
  gokarna: { lat: 14.5479, lon: 74.3188 },
  salem: { lat: 11.6643, lon: 78.146 },
  tirunelveli: { lat: 8.7139, lon: 77.7567 },
  tiruppur: { lat: 11.1085, lon: 77.3411 },
  vellore: { lat: 12.9165, lon: 79.1325 },
  thanjavur: { lat: 10.787, lon: 79.1378 },
  erode: { lat: 11.341, lon: 77.7172 },
  dindigul: { lat: 10.3673, lon: 77.9803 },
  cuddalore: { lat: 11.748, lon: 79.7714 },
  kanchipuram: { lat: 12.8342, lon: 79.7036 },
  tiruvannamalai: { lat: 12.2253, lon: 79.0747 },
  kumbakonam: { lat: 10.9602, lon: 79.3845 },
  thoothukudi: { lat: 8.7642, lon: 78.1348 },
  rameswaram: { lat: 9.2876, lon: 79.3129 },
  bikaner: { lat: 28.0229, lon: 73.3119 },
  ajmer: { lat: 26.4499, lon: 74.6399 },
  bhilwara: { lat: 25.3475, lon: 74.6408 },
  alwar: { lat: 27.553, lon: 76.6346 },
  bharatpur: { lat: 27.2152, lon: 77.503 },
  sriganganagar: { lat: 29.9038, lon: 73.8772 },
  sikar: { lat: 27.6094, lon: 75.1398 },
  pali: { lat: 25.7711, lon: 73.3234 },
  chittorgarh: { lat: 24.8887, lon: 74.6269 },
  mount_abu: { lat: 24.5925, lon: 72.7156 },
  pushkar: { lat: 26.4897, lon: 74.5511 },
  faridabad: { lat: 28.4089, lon: 77.3178 },
  panipat: { lat: 29.3909, lon: 76.9635 },
  ambala: { lat: 30.3782, lon: 76.7767 },
  rohtak: { lat: 28.8955, lon: 76.6066 },
  hisar: { lat: 29.1492, lon: 75.7217 },
  karnal: { lat: 29.6857, lon: 76.9905 },
  sonipat: { lat: 28.9931, lon: 77.0151 },
  panchkula: { lat: 30.6942, lon: 76.8606 },
  bathinda: { lat: 30.211, lon: 74.9455 },
  jalandhar: { lat: 31.326, lon: 75.5762 },
  patiala: { lat: 30.3398, lon: 76.3869 },
  mohali: { lat: 30.7046, lon: 76.7179 },
  pathankot: { lat: 32.2686, lon: 75.6529 },
  hoshiarpur: { lat: 31.5273, lon: 75.9149 },
  bhagalpur: { lat: 25.2425, lon: 86.9842 },
  muzaffarpur: { lat: 26.1209, lon: 85.3647 },
  purnia: { lat: 25.7771, lon: 87.4753 },
  darbhanga: { lat: 26.1542, lon: 85.8918 },
  bihar_sharif: { lat: 25.1982, lon: 85.5149 },
  arrah: { lat: 25.556, lon: 84.6603 },
  begusarai: { lat: 25.4182, lon: 86.1272 },
  bodhgaya: { lat: 24.6961, lon: 84.9869 },
  dhanbad: { lat: 23.7957, lon: 86.4304 },
  bokaro: { lat: 23.6693, lon: 86.1511 },
  deoghar: { lat: 24.4826, lon: 86.7001 },
  hazaribagh: { lat: 23.9925, lon: 85.3637 },
  sagar: { lat: 23.8388, lon: 78.7378 },
  dewas: { lat: 22.9676, lon: 76.0534 },
  satna: { lat: 24.582, lon: 80.829 },
  ratlam: { lat: 23.3315, lon: 75.0367 },
  rewa: { lat: 24.5362, lon: 81.3037 },
  khajuraho: { lat: 24.8318, lon: 79.9199 },
  bhilai: { lat: 21.1938, lon: 81.3509 },
  korba: { lat: 22.3595, lon: 82.7501 },
  rajnandgaon: { lat: 21.0974, lon: 81.0336 },
  jagdalpur: { lat: 19.0734, lon: 82.0229 },
  kollam: { lat: 8.8932, lon: 76.6141 },
  thrissur: { lat: 10.5276, lon: 76.2144 },
  kannur: { lat: 11.8745, lon: 75.3704 },
  alappuzha: { lat: 9.4981, lon: 76.3388 },
  kottayam: { lat: 9.5916, lon: 76.5222 },
  palakkad: { lat: 10.7867, lon: 76.6548 },
  wayanad: { lat: 11.6854, lon: 76.132 },
  guntur: { lat: 16.3067, lon: 80.4365 },
  nellore: { lat: 14.4426, lon: 79.9865 },
  kurnool: { lat: 15.8281, lon: 78.0373 },
  rajahmundry: { lat: 17.0005, lon: 81.804 },
  kakinada: { lat: 16.9891, lon: 82.2475 },
  anantapur: { lat: 14.6819, lon: 77.6006 },
  kadapa: { lat: 14.4673, lon: 78.8242 },
  nizamabad: { lat: 18.6725, lon: 78.0941 },
  khammam: { lat: 17.2473, lon: 80.1514 },
  karimnagar: { lat: 18.4386, lon: 79.1288 },
  ramagundam: { lat: 18.7551, lon: 79.5134 },
  howrah: { lat: 22.5958, lon: 88.2636 },
  asansol: { lat: 23.6739, lon: 86.9524 },
  durgapur: { lat: 23.5204, lon: 87.3119 },
  bardhaman: { lat: 23.2324, lon: 87.8615 },
  kharagpur: { lat: 22.346, lon: 87.232 },
  cuttack: { lat: 20.4625, lon: 85.8828 },
  rourkela: { lat: 22.2604, lon: 84.8536 },
  berhampur: { lat: 19.3149, lon: 84.7941 },
  sambalpur: { lat: 21.4669, lon: 83.9812 },
  balasore: { lat: 21.4934, lon: 86.9135 },
  rishikesh: { lat: 30.0869, lon: 78.2676 },
  mussoorie: { lat: 30.4598, lon: 78.0644 },
  almora: { lat: 29.5892, lon: 79.6467 },
  badrinath: { lat: 30.7433, lon: 79.4938 },
  kedarnath: { lat: 30.7352, lon: 79.0669 },
  kullu: { lat: 31.9579, lon: 77.1095 },
  kasauli: { lat: 30.9013, lon: 76.9649 },
  dalhousie: { lat: 32.5387, lon: 75.971 },
  gulmarg: { lat: 34.0484, lon: 74.3805 },
  pahalgam: { lat: 34.0161, lon: 75.315 },
  katra: { lat: 32.9924, lon: 74.9317 },
  kargil: { lat: 34.5539, lon: 76.1349 },
  silchar: { lat: 24.8333, lon: 92.7789 },
  jorhat: { lat: 26.7509, lon: 94.2037 },
  tezpur: { lat: 26.6528, lon: 92.7926 },
  diu: { lat: 20.7144, lon: 70.9874 },
  silvassa: { lat: 20.2763, lon: 73.0083 },
  karaikal: { lat: 10.9254, lon: 79.838 },
  // Additional major Indian cities, pilgrimage centers, and tourist destinations
  agra: { lat: 27.1767, lon: 78.0081 },
  ayodhya: { lat: 26.7922, lon: 82.1998 },
  prayagraj: { lat: 25.4358, lon: 81.8463 },
  allahabad: { lat: 25.4358, lon: 81.8463 },
  noida: { lat: 28.5355, lon: 77.391 },
  greater_noida: { lat: 28.4744, lon: 77.504 },
  gurugram: { lat: 28.4595, lon: 77.0266 },
  gurgaon: { lat: 28.4595, lon: 77.0266 },
  haridwar: { lat: 29.9457, lon: 78.1642 },
  nainital: { lat: 29.3919, lon: 79.4542 },
  manali: { lat: 32.2432, lon: 77.1892 },
  dharamshala: { lat: 32.219, lon: 76.3234 },
  jammu: { lat: 32.7266, lon: 74.857 },
  ludhiana: { lat: 30.901, lon: 75.8573 },
  kota: { lat: 25.2138, lon: 75.8648 },
  jaisalmer: { lat: 26.9157, lon: 70.9083 },
  vadodara: { lat: 22.3072, lon: 73.1812 },
  rajkot: { lat: 22.3039, lon: 70.8022 },
  bhuj: { lat: 23.242, lon: 69.6669 },
  daman: { lat: 20.4283, lon: 72.8397 },
  panaji: { lat: 15.4909, lon: 73.8278 },
  vijayawada: { lat: 16.5062, lon: 80.648 },
  tirupati: { lat: 13.6288, lon: 79.4192 },
  warangal: { lat: 17.9689, lon: 79.5941 },
  hubli: { lat: 15.3647, lon: 75.124 },
  hubballi: { lat: 15.3647, lon: 75.124 },
  kozhikode: { lat: 11.2588, lon: 75.7804 },
  calicut: { lat: 11.2588, lon: 75.7804 },
  puducherry: { lat: 11.9416, lon: 79.8083 },
  pondicherry: { lat: 11.9416, lon: 79.8083 },
  gaya: { lat: 24.7914, lon: 85.0002 },
  jamshedpur: { lat: 22.8046, lon: 86.2029 },
  puri: { lat: 19.8135, lon: 85.8312 },
  siliguri: { lat: 26.7271, lon: 88.3953 },
  gwalior: { lat: 26.2183, lon: 78.1828 },
  jabalpur: { lat: 23.1815, lon: 79.9864 },
  ujjain: { lat: 23.1765, lon: 75.7885 },
  bilaspur: { lat: 22.0797, lon: 82.1409 },
  cherrapunji: { lat: 25.2702, lon: 91.7323 },
  sohra: { lat: 25.2702, lon: 91.7323 },
  tawang: { lat: 27.5861, lon: 91.8594 },
  dibrugarh: { lat: 27.4728, lon: 94.912 },
  kavaratti: { lat: 10.5667, lon: 72.6417 },
  kanyakumari: { lat: 8.0883, lon: 77.5385 },
  tiruchirappalli: { lat: 10.7905, lon: 78.7047 },
  trichy: { lat: 10.7905, lon: 78.7047 },
  mahabaleshwar: { lat: 17.9237, lon: 73.6586 },
  alibaug: { lat: 18.6414, lon: 72.8722 },
  lavasa: { lat: 18.4093, lon: 73.5076 },
};

// State-level accurate centroids across all Indian states and Union Territories
const STATE_CENTROIDS: Record<string, LocationCoords> = {
  punjab: { lat: 31.1471, lon: 75.3412 },
  haryana: { lat: 29.0588, lon: 76.0856 },
  himachal_pradesh: { lat: 31.8, lon: 77.15 },
  uttarakhand: { lat: 30.0668, lon: 79.0193 },
  uttar_pradesh: { lat: 26.8467, lon: 80.9462 },
  rajasthan: { lat: 26.58, lon: 73.84 },
  bihar: { lat: 25.6, lon: 85.8 },
  west_bengal: { lat: 23.5, lon: 87.85 },
  odisha: { lat: 20.5, lon: 84.4 },
  jharkhand: { lat: 23.6, lon: 85.5 },
  madhya_pradesh: { lat: 23.0, lon: 78.0 },
  chhattisgarh: { lat: 21.2787, lon: 81.8661 },
  gujarat: { lat: 22.2587, lon: 71.1924 },
  maharashtra: { lat: 19.5, lon: 75.5 },
  goa: { lat: 15.2993, lon: 74.124 },
  karnataka: { lat: 14.5, lon: 75.7 },
  kerala: { lat: 10.2, lon: 76.3 },
  tamil_nadu: { lat: 11.0, lon: 78.5 },
  andhra_pradesh: { lat: 15.9129, lon: 79.74 },
  telangana: { lat: 17.8, lon: 79.0 },
  jammu_and_kashmir: { lat: 33.7782, lon: 76.5762 },
  ladakh: { lat: 34.1526, lon: 77.5771 },
  assam: { lat: 26.2006, lon: 92.9376 },
  meghalaya: { lat: 25.467, lon: 91.3662 },
  sikkim: { lat: 27.533, lon: 88.5122 },
  tripura: { lat: 23.8315, lon: 91.2868 },
  manipur: { lat: 24.817, lon: 93.9368 },
  mizoram: { lat: 23.1645, lon: 92.9376 },
  nagaland: { lat: 26.1584, lon: 94.5624 },
  arunachal_pradesh: { lat: 28.218, lon: 94.7278 },
  andaman_and_nicobar_islands: { lat: 11.6234, lon: 92.7265 },
  lakshadweep: { lat: 10.5667, lon: 72.6417 },
  puducherry: { lat: 11.9416, lon: 79.8083 },
  delhi: { lat: 28.6139, lon: 77.209 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
};

// Coordinates registry for custom user-added locations across India
const customCoordinatesRegistry = new Map<string, LocationCoords>();

export function registerLocationCoordinates(locId: string | any, coords: LocationCoords): void {
  const clean = String(locId || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  customCoordinatesRegistry.set(clean, coords);
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mausam_custom_coords');
      const obj = saved ? JSON.parse(saved) : {};
      obj[clean] = coords;
      localStorage.setItem('mausam_custom_coords', JSON.stringify(obj));
    }
  } catch {
    // Ignore
  }
}

export function getCustomCoordinates(locId: string | any): LocationCoords | null {
  const clean = String(locId || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (customCoordinatesRegistry.has(clean)) {
    return customCoordinatesRegistry.get(clean)!;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mausam_custom_coords');
      if (saved) {
        const obj = JSON.parse(saved);
        if (obj[clean]) {
          customCoordinatesRegistry.set(clean, obj[clean]);
          return obj[clean];
        }
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Resolve coordinates for any location ID or search query in India
 */
export function getLocationCoordinates(locIdOrName: string | any): LocationCoords {
  if (!locIdOrName) return INDIA_COORDINATES['delhi'];

  // Primary Path: Direct lat/lon from location object if provided
  if (typeof locIdOrName === 'object') {
    if (
      typeof locIdOrName.lat === 'number' &&
      typeof locIdOrName.lon === 'number' &&
      !isNaN(locIdOrName.lat) &&
      !isNaN(locIdOrName.lon)
    ) {
      return { lat: locIdOrName.lat, lon: locIdOrName.lon };
    }
  }

  const rawStr = typeof locIdOrName === 'object' ? (locIdOrName.id || locIdOrName.name || 'delhi') : String(locIdOrName);
  const clean = rawStr.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  // 1. Check custom saved coordinates first (e.g. from GPS auto-detection or geocoded lookup)
  const custom = getCustomCoordinates(clean);
  if (custom) {
    return custom;
  }

  // 1b. Check if ID has GPS coordinates encoded, e.g. gps_mumbai_1907_7287 or gps_mumbai_19076_72877
  const gpsParts = clean.match(/gps_.*?_(\d+)_(\d+)/);
  if (gpsParts && gpsParts[1] && gpsParts[2]) {
    let lat = Number(gpsParts[1]);
    let lon = Number(gpsParts[2]);
    // Handle * 1000, * 100, or raw float conversions safely
    while (lat > 90) lat /= 10;
    while (lon > 180) lon /= 10;
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat: Math.round(lat * 10000) / 10000, lon: Math.round(lon * 10000) / 10000 };
    }
  }

  // 2. Primary Path: Look up in standard India locations dataset
  const loc = findIndiaLocation(locIdOrName);
  if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number' && !isNaN(loc.lat) && !isNaN(loc.lon)) {
    return { lat: loc.lat, lon: loc.lon };
  }

  const cleanLocId = loc ? loc.id.toLowerCase().replace(/[^a-z0-9_]/g, '') : clean;
  const customLocMatch = getCustomCoordinates(cleanLocId);
  if (customLocMatch) {
    return customLocMatch;
  }

  // 3. Check static coordinates table for exact key
  if (INDIA_COORDINATES[clean]) {
    return INDIA_COORDINATES[clean];
  }
  if (INDIA_COORDINATES[cleanLocId]) {
    return INDIA_COORDINATES[cleanLocId];
  }

  // 4. Base city prefix if ID has state or district suffix (e.g. nashik_maharashtra -> nashik)
  const baseCity = clean.split('_')[0];
  if (baseCity && INDIA_COORDINATES[baseCity]) {
    return INDIA_COORDINATES[baseCity];
  }
  const baseLocCity = cleanLocId.split('_')[0];
  if (baseLocCity && INDIA_COORDINATES[baseLocCity]) {
    return INDIA_COORDINATES[baseLocCity];
  }

  // Exact word match on primary city name only (e.g. "Agra, Uttar Pradesh" -> "agra")
  const primaryNameToken = (loc ? loc.name : rawStr)
    .toLowerCase()
    .split(',')[0]
    .trim()
    .replace(/[^a-z0-9_]/g, '');
  if (primaryNameToken && INDIA_COORDINATES[primaryNameToken]) {
    return INDIA_COORDINATES[primaryNameToken];
  }

  // Note: Step 5 fuzzy 4+ letter word-token matching was intentionally removed to prevent incorrect city matches.

  // 5. Centroid Fallbacks with Dev Warning
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[weatherApi] Location "${String(locIdOrName)}" fell through to centroid fallback. Coordinates may be approximate.`
    );
  }

  // State-level accurate centroid fallback rather than collapsing to Delhi
  const cleanState = ((loc && loc.state) || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (STATE_CENTROIDS[cleanState]) {
    return STATE_CENTROIDS[cleanState];
  }

  for (const [sKey, sCoords] of Object.entries(STATE_CENTROIDS)) {
    if (cleanState.includes(sKey) || sKey.includes(cleanState)) {
      return sCoords;
    }
  }

  // Regional centroid fallbacks across India
  if (loc && loc.region) {
    switch (loc.region) {
      case 'North':
        return { lat: 28.6139, lon: 77.209 };
      case 'South':
        return { lat: 12.9716, lon: 77.5946 };
      case 'East':
        return { lat: 22.5726, lon: 88.3639 };
      case 'West':
        return { lat: 19.076, lon: 72.8777 };
      case 'Central':
        return { lat: 23.2599, lon: 77.4126 };
      case 'North-East':
        return { lat: 26.1445, lon: 91.7362 };
      case 'Islands':
        return { lat: 11.6234, lon: 92.7265 };
    }
  }

  return { lat: 28.6139, lon: 77.209 }; // New Delhi default
}

// Convert WMO Weather Codes to Human Conditions and Lucide Icon keys with accurate diurnal day/night support
export function mapWmoCodeToCondition(code: number, isDay: boolean = true): {
  condition: string;
  conditionHi: string;
  icon: string;
} {
  if (!isDay) {
    switch (code) {
      case 0:
        return { condition: 'Clear Night Sky', conditionHi: 'साफ रात का आकाश', icon: 'moon' };
      case 1:
        return { condition: 'Mainly Clear Night', conditionHi: 'मुख्यतः साफ रात', icon: 'moon' };
      case 2:
        return { condition: 'Partly Cloudy Night', conditionHi: 'आंशिक बादलों भरी रात', icon: 'cloud-moon' };
      case 3:
        return { condition: 'Overcast Night', conditionHi: 'घने बादल', icon: 'cloud' };
      case 45:
      case 48:
        return { condition: 'Night Fog & Mist', conditionHi: 'रात्रि कोहरा व धुंध', icon: 'cloud-fog' };
      case 51:
      case 53:
      case 55:
        return { condition: 'Night Drizzle', conditionHi: 'रात्रि बूंदाबांदी', icon: 'cloud-drizzle' };
      case 61:
      case 63:
        return { condition: 'Night Rain', conditionHi: 'रात्रि वर्षा', icon: 'cloud-rain' };
      case 65:
        return { condition: 'Heavy Night Rain', conditionHi: 'भारी रात्रि वर्षा', icon: 'cloud-rain' };
      case 71:
      case 73:
      case 75:
        return { condition: 'Night Snowfall', conditionHi: 'रात्रि बर्फबारी', icon: 'snowflake' };
      case 80:
      case 81:
      case 82:
        return { condition: 'Night Rain Showers', conditionHi: 'रात्रि वर्षा की बौछारें', icon: 'cloud-rain' };
      case 95:
        return { condition: 'Night Thunderstorm', conditionHi: 'रात्रि गरज के साथ तूफान', icon: 'cloud-lightning' };
      case 96:
      case 99:
        return { condition: 'Severe Night Storm & Hail', conditionHi: 'गंभीर रात्रि तूफान व ओलावृष्टि', icon: 'cloud-lightning' };
      default:
        return { condition: 'Partly Cloudy Night', conditionHi: 'आंशिक बादलों भरी रात', icon: 'cloud-moon' };
    }
  }

  switch (code) {
    case 0:
      return { condition: 'Clear Sky', conditionHi: 'साफ आसमान', icon: 'sun' };
    case 1:
      return { condition: 'Mainly Clear', conditionHi: 'मुख्यतः साफ', icon: 'sun' };
    case 2:
      return { condition: 'Partly Cloudy', conditionHi: 'आंशिक बादल', icon: 'cloud-sun' };
    case 3:
      return { condition: 'Overcast', conditionHi: 'घने बादल', icon: 'cloud' };
    case 45:
    case 48:
      return { condition: 'Fog & Mist', conditionHi: 'कोहरा व धुंध', icon: 'cloud-fog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', conditionHi: 'हल्की बूंदाबांदी', icon: 'cloud-drizzle' };
    case 61:
    case 63:
      return { condition: 'Moderate Rain', conditionHi: 'मध्यम बारिश', icon: 'cloud-rain' };
    case 65:
      return { condition: 'Heavy Rainfall', conditionHi: 'भारी वर्षा', icon: 'cloud-rain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', conditionHi: 'बर्फबारी', icon: 'snowflake' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', conditionHi: 'बारिश की बौछारें', icon: 'cloud-rain' };
    case 95:
      return { condition: 'Thunderstorm', conditionHi: 'गरज के साथ तूफान', icon: 'cloud-lightning' };
    case 96:
    case 99:
      return { condition: 'Severe Thunderstorm & Hail', conditionHi: 'गंभीर तूफान व ओलावृष्टि', icon: 'cloud-lightning' };
    default:
      return { condition: 'Partly Cloudy', conditionHi: 'आंशिक रूप से बादल', icon: 'cloud-sun' };
  }
}

export interface LiveWeatherData {
  locationId: string;
  currentWeather: CurrentWeather;
  hourlyForecast: HourlyForecastItem[];
  dailyForecast: DailyForecastItem[];
  airQuality?: HealthData;
  isLive: boolean;
  provider: string;
  lastSynced: string;
  sourceType: 'live_open_meteo' | 'cached' | 'fallback_procedural';
  rawPayload?: Record<string, unknown>;
  requestUrl?: string;
  latencyMs?: number;
  statusCode?: number;
  coords?: LocationCoords;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  admin2?: string;
  elevation?: number;
}

/**
 * Search locations across India and globally via Open-Meteo Free Geocoding API
 * Allows finding any city, town, or locality worldwide while ensuring rich attributes
 */
export async function searchLocationsViaApi(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const cleanQ = query.trim();
    // 1. Try search prioritized with country_code=IN first
    let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cleanQ
    )}&count=15&country_code=IN&language=en&format=json`;
    let res = await fetch(url, { headers: { Accept: 'application/json' } });
    let json = res.ok ? await res.json() : null;
    let rawList = json?.results || [];

    // 2. If no results or user is searching for any location, query globally
    if (rawList.length === 0) {
      url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cleanQ
      )}&count=15&language=en&format=json`;
      res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        json = await res.json();
        rawList = json?.results || [];
      }
    }

    // Deduplicate by sanitized name and state/country
    const seen = new Set<string>();
    const deduplicated: GeocodingResult[] = [];

    for (const r of rawList) {
      if (!r || typeof r.latitude !== 'number' || typeof r.longitude !== 'number') continue;
      const sanitizedName = sanitizePlaceName(r.name);
      const sanitizedState = sanitizePlaceName(r.admin1 || r.country || '');
      const key = `${sanitizedName.toLowerCase()}-${sanitizedState.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push({
          id: r.id,
          name: sanitizedName,
          latitude: r.latitude,
          longitude: r.longitude,
          country: r.country || 'India',
          admin1: sanitizedState,
          admin2: r.admin2 ? sanitizePlaceName(r.admin2) : undefined,
          elevation: r.elevation ? Math.round(r.elevation) : 300,
        });
      }
    }

    return deduplicated;
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}

/**
 * Computes individual pollutant sub-index based on official CPCB (Central Pollution Control Board) breakpoints.
 * Continuous interval calculation guarantees smooth mathematical interpolation across all concentration brackets.
 */
export function calculateCpcbSubIndex(
  conc: number,
  breakpoints: [number, number, number, number][]
): number {
  if (conc <= 0 || isNaN(conc)) return 0;
  for (let i = 0; i < breakpoints.length; i++) {
    const [cLow, cHigh, iLow, iHigh] = breakpoints[i];
    if (conc <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (conc - cLow) + iLow);
    }
  }
  // Above highest bracket, extrapolate smoothly up to maximum AQI 500
  const last = breakpoints[breakpoints.length - 1];
  const [cLow, cHigh, iLow, iHigh] = last;
  const extra = ((iHigh - iLow) / (cHigh - cLow)) * (conc - cLow) + iLow;
  return Math.min(500, Math.round(extra));
}

/**
 * Calculates Indian CPCB National Air Quality Index (NAQI) using official sub-indices
 * and standard CPCB pollutant rules.
 */
export function calculateIndianCpcbAqi(
  pm25: number | null,
  pm10: number | null,
  no2: number | null,
  so2: number | null,
  co: number | null,
  o3: number | null,
  nh3: number | null = null
): { aqi: number; dominantPollutant: string } {
  const subIndices: { val: number; name: string; isParticulate: boolean }[] = [];

  // PM2.5 breakpoints in µg/m³ (CPCB 24-hr standard: 0-30, 30-60, 60-90, 90-120, 120-250, 250+)
  if (pm25 != null && pm25 > 0) {
    const idx = calculateCpcbSubIndex(pm25, [
      [0, 30, 0, 50],
      [30, 60, 51, 100],
      [60, 90, 101, 200],
      [90, 120, 201, 300],
      [120, 250, 301, 400],
      [250, 500, 401, 500],
    ]);
    subIndices.push({ val: idx, name: 'PM2.5', isParticulate: true });
  }

  // PM10 breakpoints in µg/m³ (CPCB 24-hr standard: 0-50, 50-100, 100-250, 250-350, 350-430, 430+)
  if (pm10 != null && pm10 > 0) {
    const idx = calculateCpcbSubIndex(pm10, [
      [0, 50, 0, 50],
      [50, 100, 51, 100],
      [100, 250, 101, 200],
      [250, 350, 201, 300],
      [350, 430, 301, 400],
      [430, 600, 401, 500],
    ]);
    subIndices.push({ val: idx, name: 'PM10', isParticulate: true });
  }

  // NO2 breakpoints in µg/m³ (CPCB 24-hr standard: 0-40, 40-80, 80-180, 180-280, 280-400, 400+)
  if (no2 != null && no2 > 0) {
    const idx = calculateCpcbSubIndex(no2, [
      [0, 40, 0, 50],
      [40, 80, 51, 100],
      [80, 180, 101, 200],
      [180, 280, 201, 300],
      [280, 400, 301, 400],
      [400, 600, 401, 500],
    ]);
    subIndices.push({ val: idx, name: 'NO₂', isParticulate: false });
  }

  // SO2 breakpoints in µg/m³ (CPCB 24-hr standard: 0-40, 40-80, 80-380, 380-800, 800-1600, 1600+)
  if (so2 != null && so2 > 0) {
    const idx = calculateCpcbSubIndex(so2, [
      [0, 40, 0, 50],
      [40, 80, 51, 100],
      [80, 380, 101, 200],
      [380, 800, 201, 300],
      [800, 1600, 301, 400],
      [1600, 2500, 401, 500],
    ]);
    subIndices.push({ val: idx, name: 'SO₂', isParticulate: false });
  }

  // CO in mg/m³ (Open-Meteo returns µg/m³, converted to mg/m³)
  if (co != null && co > 0) {
    const coMg = co / 1000;
    const idx = calculateCpcbSubIndex(coMg, [
      [0, 1.0, 0, 50],
      [1.0, 2.0, 51, 100],
      [2.0, 10.0, 101, 200],
      [10.0, 17.0, 201, 300],
      [17.0, 34.0, 301, 400],
      [34.0, 60.0, 401, 500],
    ]);
    subIndices.push({ val: idx, name: 'CO', isParticulate: false });
  }

  // O3 (Ozone) in µg/m³
  // CPCB 1-hour standard for instantaneous atmospheric model / telemetry readings:
  // 0-100: Good (0-50), 101-180: Satisfactory (51-100), 181-280: Moderate (101-200),
  // 281-400: Poor (201-300), 401-500: Very Poor (301-400), 501-1000: Severe (401-500)
  if (o3 != null && o3 > 0) {
    const idx = calculateCpcbSubIndex(o3, [
      [0, 100, 0, 50],
      [100, 180, 51, 100],
      [180, 280, 101, 200],
      [280, 400, 201, 300],
      [400, 500, 301, 400],
      [500, 1000, 401, 500],
    ]);
    subIndices.push({ val: idx, name: 'Ozone (O₃)', isParticulate: false });
  }

  // NH3 in µg/m³ (CPCB 24-hr standard: 0-200, 200-400, 400-800, 800-1200, 1200-1800, 1800+)
  if (nh3 != null && nh3 > 0) {
    const idx = calculateCpcbSubIndex(nh3, [
      [0, 200, 0, 50],
      [200, 400, 51, 100],
      [400, 800, 101, 200],
      [800, 1200, 201, 300],
      [1200, 1800, 301, 400],
      [1800, 2500, 401, 500],
    ]);
    subIndices.push({ val: idx, name: 'NH₃', isParticulate: false });
  }

  if (subIndices.length === 0) {
    return { aqi: 75, dominantPollutant: 'PM2.5' };
  }

  // CPCB Rule: Overall AQI is the maximum of all pollutant sub-indices
  subIndices.sort((a, b) => b.val - a.val);
  const maxItem = subIndices[0];

  // Particulate priority: in Indian ambient air, particulate matter (PM2.5/PM10)
  // is the principal health driver; if PM sub-index is close to max, highlight PM.
  const particulateItem = subIndices.find((s) => s.isParticulate && s.val >= maxItem.val - 12);
  const dominantPollutant = particulateItem ? particulateItem.name : maxItem.name;

  return { aqi: maxItem.val, dominantPollutant };
}

/**
 * Aerobiological Pollen Model calibrated for Indian bioclimatic seasons & weather factors
 */
export function calculateIndianPollen(
  humidity: number,
  uvIndex: number,
  windSpeed: number = 12
): {
  count: number;
  level: 'Low' | 'Moderate' | 'High' | 'Very High';
  levelHi: string;
  dominantType: string;
  dominantTypeHi: string;
} {
  const month = new Date().getMonth(); // 0 = Jan, 8 = Sep, etc.

  // Seasonal baseline pollen in India (grains/m³)
  let basePollen = 38;
  let dominantType = 'Congress Grass & Weeds (Parthenium, Cynodon)';
  let dominantTypeHi = 'गाजर घास व खरपतवार (पार्थेनियम, दूब)';

  if (month >= 1 && month <= 3) {
    // Feb - Apr: Spring tree bloom
    basePollen = 58;
    dominantType = 'Tree Pollen (Holoptelea, Neem, Gulmohar)';
    dominantTypeHi = 'वृक्ष परागकण (चिल्बिल, नीम, गुलमोहर)';
  } else if (month >= 4 && month <= 5) {
    // May - Jun: Summer dry dispersal
    basePollen = 42;
    dominantType = 'Grass & Shrub Pollen (Prosopis, Grasses)';
    dominantTypeHi = 'झाड़ी व घास परागकण (विलायती बबूल, घास)';
  } else if (month >= 6 && month <= 7) {
    // Jul - Aug: Active monsoon washout
    basePollen = 18;
    dominantType = 'Fungal Spores & Rain Washout (Alternaria)';
    dominantTypeHi = 'फफूंद बीजाणु व मानसूनी धुलाई (अल्टरनेरिया)';
  } else if (month >= 8 && month <= 10) {
    // Sep - Nov: Post-monsoon weed & grass flowering
    basePollen = 46;
    dominantType = 'Congress Grass & Weeds (Parthenium, Amaranthus)';
    dominantTypeHi = 'गाजर घास व खरपतवार (पार्थेनियम, चौलाई)';
  } else {
    // Dec - Jan: Winter atmospheric settling
    basePollen = 28;
    dominantType = 'Winter Grasses & Agricultural Residue';
    dominantTypeHi = 'शीतकालीन घास व कृषि अवशेष';
  }

  // Meteorological adjustments
  let pollen = basePollen;
  if (humidity > 80) {
    pollen = Math.round(pollen * 0.45); // Washout / rain condensation
  } else if (humidity > 65) {
    pollen = Math.round(pollen * 0.75);
  } else if (humidity < 40) {
    pollen = Math.round(pollen * 1.3); // Dry suspension
  }

  if (windSpeed > 18) {
    pollen = Math.round(pollen * 1.25); // Wind transport
  } else if (windSpeed < 6) {
    pollen = Math.round(pollen * 0.85);
  }

  pollen = Math.max(8, Math.min(120, pollen));

  let level: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
  let levelHi = 'कम';
  if (pollen > 75) {
    level = 'Very High';
    levelHi = 'अति उच्च';
  } else if (pollen > 50) {
    level = 'High';
    levelHi = 'उच्च';
  } else if (pollen > 25) {
    level = 'Moderate';
    levelHi = 'मध्यम';
  }

  return {
    count: pollen,
    level,
    levelHi,
    dominantType,
    dominantTypeHi,
  };
}

/**
 * Builds standard HealthData and clinical interpretations from atmospheric pollutant readings
 */
export function buildHealthDataFromPollutants(
  aqi: number,
  pm25: number | null,
  pm10: number | null,
  co: number | null,
  no2: number | null,
  so2: number | null,
  o3: number | null,
  nh3: number | null,
  isLive: boolean = true,
  humidity: number = 65,
  uvIndex: number = 6
): HealthData {
  let effectiveAqi = aqi;
  let primary = 'PM2.5';

  if (isLive && (pm25 != null || pm10 != null)) {
    // If live sensor concentrations are available, recalculate true Indian CPCB NAQI
    const cpcbResult = calculateIndianCpcbAqi(pm25, pm10, no2, so2, co, o3, nh3);
    effectiveAqi = cpcbResult.aqi;
    primary = cpcbResult.dominantPollutant;
  } else {
    // Keep modeled/selected location AQI strictly consistent across all views
    effectiveAqi = aqi;
    primary = aqi > 150 ? 'PM2.5' : aqi > 90 ? 'PM10' : 'PM2.5';
  }

  // Official CPCB categories & Hindi translations
  let aqiCategory: HealthData['aqiCategory'] = 'Good';
  let aqiCategoryHi = 'अच्छा';
  if (effectiveAqi > 400) {
    aqiCategory = 'Severe';
    aqiCategoryHi = 'गंभीर';
  } else if (effectiveAqi > 300) {
    aqiCategory = 'Very Poor';
    aqiCategoryHi = 'बहुत खराब';
  } else if (effectiveAqi > 200) {
    aqiCategory = 'Poor';
    aqiCategoryHi = 'खराब';
  } else if (effectiveAqi > 100) {
    aqiCategory = 'Moderate';
    aqiCategoryHi = 'मध्यम';
  } else if (effectiveAqi > 50) {
    aqiCategory = 'Satisfactory';
    aqiCategoryHi = 'संतोषजनक';
  }

  // Official CPCB Health Statements
  let general = 'Air quality is good. Minimal health impact; optimal for all outdoor workouts and fresh air.';
  let generalHi = 'वायु गुणवत्ता अच्छी है। स्वास्थ्य पर न्यूनतम प्रभाव; सभी बाहरी गतिविधियों व व्यायाम के लिए आदर्श।';

  if (effectiveAqi > 400) {
    general = 'Severe air quality emergency. Affects healthy people and seriously impacts those with existing diseases. Strictly avoid outdoor exertion; wear N95 respirators.';
    generalHi = 'गंभीर वायु गुणवत्ता आपातकाल। स्वस्थ लोगों पर भी प्रतिकूल प्रभाव और रोगियों पर गंभीर असर। बाहर जाने से बिल्कुल बचें; N95 मास्क पहनें।';
  } else if (effectiveAqi > 300) {
    general = 'Very poor air quality. Causes respiratory illness on prolonged exposure. Significant risk for children, elderly, and cardiac patients. Remain indoors with air purifiers.';
    generalHi = 'बहुत खराब वायु गुणवत्ता। लंबे समय तक संपर्क से श्वसन संबंधी बीमारियां हो सकती हैं। बच्चे और बुजुर्ग घर के अंदर रहें।';
  } else if (effectiveAqi > 200) {
    general = 'Poor air quality. Breathing discomfort to most people on prolonged outdoor exposure. Avoid strenuous outdoor activities; mask recommended.';
    generalHi = 'खराब वायु गुणवत्ता। लंबे समय तक बाहर रहने पर अधिकांश लोगों को सांस की तकलीफ। भारी बाहरी व्यायाम सीमित करें और मास्क लगाएं।';
  } else if (effectiveAqi > 100) {
    general = 'Moderate air quality. May cause breathing discomfort to people with asthma, heart, or lung diseases. Sensitive groups should reduce heavy exertion outdoors.';
    generalHi = 'मध्यम वायु गुणवत्ता। अस्थमा, हृदय या फेफड़ों के रोगियों को सांस लेने में कठिनाई हो सकती है। बाहरी श्रम कम करें।';
  } else if (effectiveAqi > 50) {
    general = 'Air quality is satisfactory. Minor breathing discomfort to sensitive individuals on prolonged exposure. Generally safe for daily activities.';
    generalHi = 'वायु गुणवत्ता संतोषजनक है। लंबे समय तक बाहर रहने पर संवेदनशील लोगों को हल्की सांस की तकलीफ हो सकती है। दैनिक गतिविधियों के लिए सुरक्षित।';
  }

  const sensitive =
    effectiveAqi <= 50
      ? 'Clean atmospheric conditions. Ideal for children, seniors, and active workouts outdoors.'
      : effectiveAqi <= 100
      ? 'Normal outdoor activities recommended. Stay well hydrated and take standard precautions.'
      : effectiveAqi <= 200
      ? 'People with heart or lung disease should reduce heavy exertion outdoors during peak hours.'
      : 'High health risk for individuals with cardiopulmonary conditions. Remain indoors with air purification.';

  const sensitiveHi =
    effectiveAqi <= 50
      ? 'स्वच्छ वायु वातावरण। बच्चों, बुजुर्गों व व्यायाम के लिए पूरी तरह आदर्श।'
      : effectiveAqi <= 100
      ? 'सामान्य बाहरी गतिविधियों की सिफारिश की जाती है। पर्याप्त पानी पिएं।'
      : effectiveAqi <= 200
      ? 'हृदय व फेफड़ों के रोगियों को व्यस्त समय में भारी बाहरी श्रम सीमित करना चाहिए।'
      : 'हृदय व फेफड़ों के रोगियों के लिए उच्च जोखिम। एयर प्यूरीफायर के साथ घर के अंदर रहें।';

  const currentPm = pm25 ?? Math.round((effectiveAqi / 1.5) * 10) / 10;
  const asthma =
    effectiveAqi > 200 || currentPm > 60
      ? `Elevated fine particulates (PM2.5: ${currentPm} µg/m³). Keep rescue inhalers accessible; strictly avoid high-traffic corridors.`
      : effectiveAqi > 100
      ? `Moderate particulate presence (PM2.5: ${currentPm} µg/m³). Asthmatic individuals should carry prescribed inhalers.`
      : `Particulate levels well within safe thresholds (PM2.5: ${currentPm} µg/m³). Low trigger risk for bronchial spasms.`;

  const asthmaHi =
    effectiveAqi > 200 || currentPm > 60
      ? `बढ़े हुए महीन कण (PM2.5: ${currentPm} µg/m³)। इनहेलर पास रखें और व्यस्त सड़कों से दूर रहें।`
      : effectiveAqi > 100
      ? `मध्यम कण स्तर (PM2.5: ${currentPm} µg/m³)। अस्थमा रोगी एहतियात के तौर पर इनहेलर साथ रखें।`
      : `कण सुरक्षित स्तर में हैं (PM2.5: ${currentPm} µg/m³)। श्वसन संबंधी ऐंठन का कम जोखिम।`;

  const elderly =
    effectiveAqi > 200
      ? 'Elderly citizens and young children should avoid morning walks and intense outdoor play; wear masks if stepping out.'
      : effectiveAqi > 100
      ? 'Senior citizens with hypertension or asthma should schedule walks during late morning or early evening.'
      : 'Safe and pleasant for children and senior citizens to partake in regular outdoor strolls and exercise.';

  const elderlyHi =
    effectiveAqi > 200
      ? 'बुजुर्गों और बच्चों को सुबह की सैर व खुले में खेलकूद से बचना चाहिए; बाहर जाते समय मास्क लगाएं।'
      : effectiveAqi > 100
      ? 'बुजुर्ग व संवेदनशील लोग सुबह की तेज ठंड या प्रदूषण के बजाय धूप निकलने पर ही टहलें।'
      : 'बच्चों और वरिष्ठ नागरिकों के लिए बाहरी सैर व व्यायाम पूरी तरह सुरक्षित और सुखद है।';

  // Dynamic Indian aerobiological pollen calculation
  const pollenResult = calculateIndianPollen(humidity, uvIndex);

  return {
    aqi: effectiveAqi,
    aqiCategory,
    aqiCategoryHi,
    primaryPollutant: primary,
    pollenCount: pollenResult.count,
    pollenLevel: pollenResult.level,
    pollenLevelHi: pollenResult.levelHi,
    dominantPollenType: pollenResult.dominantType,
    dominantPollenTypeHi: pollenResult.dominantTypeHi,
    uvIndex,
    humidity,
    healthAdvisory: general,
    healthAdvisoryHi: generalHi,
    pm25: pm25 !== null && !isNaN(pm25) ? Math.round(pm25 * 10) / 10 : undefined,
    pm10: pm10 !== null && !isNaN(pm10) ? Math.round(pm10 * 10) / 10 : undefined,
    co: co !== null && !isNaN(co) ? Math.round(co * 10) / 10 : undefined,
    no2: no2 !== null && !isNaN(no2) ? Math.round(no2 * 10) / 10 : undefined,
    so2: so2 !== null && !isNaN(so2) ? Math.round(so2 * 10) / 10 : undefined,
    o3: o3 !== null && !isNaN(o3) ? Math.round(o3 * 10) / 10 : undefined,
    nh3: nh3 !== null && !isNaN(nh3) ? Math.round(nh3 * 10) / 10 : undefined,
    isLiveAqi: isLive,
    dataSourceNotice: isLive ? 'Open-Meteo Air Quality (CPCB NAQI)' : 'Mock data (Offline Model)',
    interpretations: {
      general,
      sensitive,
      asthma,
      elderly,
    },
    interpretationsHi: {
      general: generalHi,
      sensitive: sensitiveHi,
      asthma: asthmaHi,
      elderly: elderlyHi,
    },
  };
}

/**
 * Fetch Live Weather from Open-Meteo Free API by Coordinates
 */
export async function fetchLiveWeatherByCoords(
  lat: number,
  lon: number,
  locName: string = 'Current Coordinates',
  stateName: string = 'Live GPS'
): Promise<LiveWeatherData | null> {
  const startTime = performance.now();
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,is_day&hourly=temperature_2m,precipitation_probability,uv_index,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia,european_aqi,us_aqi&timezone=auto`;

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl, { headers: { Accept: 'application/json' } }),
      fetch(aqiUrl, { headers: { Accept: 'application/json' } }).catch(() => null),
    ]);

    const latencyMs = Math.round(performance.now() - startTime);

    if (!weatherRes.ok) {
      throw new Error(`Open-Meteo HTTP ${weatherRes.status}`);
    }

    const weatherJson = await weatherRes.json();
    let liveAqi = 68;
    let pm25Val: number | null = null;
    let pm10Val: number | null = null;
    let coVal: number | null = null;
    let no2Val: number | null = null;
    let so2Val: number | null = null;
    let o3Val: number | null = null;
    let nh3Val: number | null = null;
    let hasLiveAqi = false;

    if (aqiRes && aqiRes.ok) {
      const aqiJson = await aqiRes.json();
      const aqiCur = aqiJson?.current;
      if (aqiCur) {
        hasLiveAqi = true;
        if (aqiCur.us_aqi != null) liveAqi = Math.round(aqiCur.us_aqi);
        else if (aqiCur.european_aqi != null) liveAqi = Math.round(aqiCur.european_aqi * 4);

        pm25Val = aqiCur.pm2_5 != null ? aqiCur.pm2_5 : null;
        pm10Val = aqiCur.pm10 != null ? aqiCur.pm10 : null;
        coVal = aqiCur.carbon_monoxide != null ? aqiCur.carbon_monoxide : null;
        no2Val = aqiCur.nitrogen_dioxide != null ? aqiCur.nitrogen_dioxide : null;
        so2Val = aqiCur.sulphur_dioxide != null ? aqiCur.sulphur_dioxide : null;
        o3Val = aqiCur.ozone != null ? aqiCur.ozone : null;
        nh3Val = aqiCur.ammonia != null ? aqiCur.ammonia : null;
      }
    }

    const cur = weatherJson.current;
    const isDay = cur.is_day !== undefined ? cur.is_day === 1 : (new Date().getHours() >= 6 && new Date().getHours() < 19);
    const cond = mapWmoCodeToCondition(cur.weather_code, isDay);
    const liveHumidity = Math.round(cur.relative_humidity_2m ?? 65);
    const liveUv = isDay ? Math.round(weatherJson.hourly?.uv_index?.[12] ?? 6) : 0;

    const airQuality = buildHealthDataFromPollutants(
      liveAqi,
      pm25Val,
      pm10Val,
      coVal,
      no2Val,
      so2Val,
      o3Val,
      nh3Val,
      hasLiveAqi,
      liveHumidity,
      liveUv
    );

    const currentWeather: CurrentWeather = {
      location: locName,
      state: stateName,
      temperature: Math.round(cur.temperature_2m),
      feelsLike: Math.round(cur.apparent_temperature),
      condition: cond.condition,
      conditionHi: cond.conditionHi,
      icon: cond.icon,
      humidity: Math.round(cur.relative_humidity_2m),
      windSpeed: Math.round(cur.wind_speed_10m),
      windDirection: `${Math.round(cur.wind_direction_10m)}°`,
      visibility: 9.0,
      cloudCover: Math.round(cur.cloud_cover ?? 30),
      tempHigh: Math.round(weatherJson.daily?.temperature_2m_max?.[0] ?? cur.temperature_2m + 3),
      tempLow: Math.round(weatherJson.daily?.temperature_2m_min?.[0] ?? cur.temperature_2m - 4),
      rainProbability: Math.round(weatherJson.daily?.precipitation_probability_max?.[0] ?? (cur.precipitation > 0 ? 80 : 15)),
      airPressure: Math.round(cur.surface_pressure ?? 1013),
      uvIndex: isDay ? Math.round(weatherJson.hourly?.uv_index?.[12] ?? 6) : 0,
      aqi: airQuality.aqi,
      lastUpdated: `Live API (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      isDay,
    };

    const hourlyForecast: HourlyForecastItem[] = [];
    const hourlyData = weatherJson.hourly;
    if (hourlyData?.time) {
      const nowIdx = new Date().getHours();
      for (let i = 0; i < 24; i++) {
        const idx = (nowIdx + i) % hourlyData.time.length;
        const timeStr = new Date(hourlyData.time[idx]).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const hourDate = new Date(hourlyData.time[idx]);
        const hourVal = !isNaN(hourDate.getHours()) ? hourDate.getHours() : ((nowIdx + i) % 24);
        const isHourDay = hourVal >= 6 && hourVal < 19;
        const hCode = hourlyData.weather_code?.[idx] ?? 0;
        const hCond = mapWmoCodeToCondition(hCode, isHourDay);
        hourlyForecast.push({
          time: i === 0 ? 'Now' : timeStr,
          temp: Math.round(hourlyData.temperature_2m?.[idx] ?? 24),
          condition: hCond.condition,
          rainProb: Math.round(hourlyData.precipitation_probability?.[idx] ?? 10),
          uv: isHourDay ? Math.round(hourlyData.uv_index?.[idx] ?? 0) : 0,
          icon: hCond.icon,
        });
      }
    }

    const dailyForecast: DailyForecastItem[] = [];
    const dailyData = weatherJson.daily;
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const DAY_NAMES_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

    if (dailyData?.time) {
      for (let i = 0; i < Math.min(7, dailyData.time.length); i++) {
        const dDate = new Date(dailyData.time[i]);
        const dayIdx = dDate.getDay();
        const dCode = dailyData.weather_code?.[i] ?? 0;
        const dCond = mapWmoCodeToCondition(dCode);
        dailyForecast.push({
          day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[dayIdx],
          dayHi: i === 0 ? 'आज' : i === 1 ? 'कल' : DAY_NAMES_HI[dayIdx],
          date: dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tempMax: Math.round(dailyData.temperature_2m_max?.[i] ?? 29),
          tempMin: Math.round(dailyData.temperature_2m_min?.[i] ?? 19),
          condition: dCond.condition,
          conditionHi: dCond.conditionHi,
          rainProb: Math.round(dailyData.precipitation_probability_max?.[i] ?? 20),
          humidity: Math.round(cur.relative_humidity_2m),
          windSpeed: Math.round(cur.wind_speed_10m),
        });
      }
    }

    return {
      locationId: locName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      currentWeather,
      hourlyForecast,
      dailyForecast,
      airQuality,
      isLive: true,
      provider: 'Open-Meteo High-Resolution Global API',
      lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sourceType: 'live_open_meteo',
      requestUrl: weatherUrl,
      latencyMs,
      statusCode: 200,
      coords: { lat, lon },
      rawPayload: {
        latitude: weatherJson.latitude,
        longitude: weatherJson.longitude,
        elevation: weatherJson.elevation,
        timezone: weatherJson.timezone,
        current: weatherJson.current,
        current_units: weatherJson.current_units,
        air_quality: {
          us_aqi: liveAqi,
          pm2_5: pm25Val,
          pm10: pm10Val,
          carbon_monoxide: coVal,
          nitrogen_dioxide: no2Val,
          sulphur_dioxide: so2Val,
          ozone: o3Val,
          ammonia: nh3Val,
        },
      },
    };
  } catch (err) {
    console.warn('Live API fetch error:', err);
    return null;
  }
}

// In-flight deduplication cache to prevent redundant concurrent API calls
const inFlightWeatherRequests = new Map<string, Promise<LiveWeatherData | null>>();

/**
 * Fetch Live Weather from Open-Meteo Free API (Zero API key required)
 * Uses in-flight deduplication to prevent redundant requests across components
 */
export async function fetchLiveWeatherForLocation(
  locIdOrName: string
): Promise<LiveWeatherData | null> {
  const loc = findIndiaLocation(locIdOrName);
  const cacheKey = loc.id;

  if (inFlightWeatherRequests.has(cacheKey)) {
    return inFlightWeatherRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    const coords = getLocationCoordinates(loc.id);

    try {
      // 1. Fetch live meteorological forecast from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,is_day&hourly=temperature_2m,precipitation_probability,uv_index,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

      // 2. Fetch live atmospheric quality (AQI, PM2.5, PM10, CO, NO2, SO2, O3, NH3) from Open-Meteo Air Quality API
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia,european_aqi,us_aqi&timezone=auto`;

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(weatherUrl, { headers: { Accept: 'application/json' } }),
        fetch(aqiUrl, { headers: { Accept: 'application/json' } }).catch(() => null),
      ]);

      if (!weatherRes.ok) {
        throw new Error(`Open-Meteo HTTP ${weatherRes.status}`);
      }

      const weatherJson = await weatherRes.json();
      let liveAqi = 75;
      let pm25Val: number | null = null;
      let pm10Val: number | null = null;
      let coVal: number | null = null;
      let no2Val: number | null = null;
      let so2Val: number | null = null;
      let o3Val: number | null = null;
      let nh3Val: number | null = null;
      let hasLiveAqi = false;

      if (aqiRes && aqiRes.ok) {
        const aqiJson = await aqiRes.json();
        const aqiCur = aqiJson?.current;
        if (aqiCur) {
          hasLiveAqi = true;
          if (aqiCur.us_aqi != null) liveAqi = Math.round(aqiCur.us_aqi);
          else if (aqiCur.european_aqi != null) liveAqi = Math.round(aqiCur.european_aqi * 4);

          pm25Val = aqiCur.pm2_5 != null ? aqiCur.pm2_5 : null;
          pm10Val = aqiCur.pm10 != null ? aqiCur.pm10 : null;
          coVal = aqiCur.carbon_monoxide != null ? aqiCur.carbon_monoxide : null;
          no2Val = aqiCur.nitrogen_dioxide != null ? aqiCur.nitrogen_dioxide : null;
          so2Val = aqiCur.sulphur_dioxide != null ? aqiCur.sulphur_dioxide : null;
          o3Val = aqiCur.ozone != null ? aqiCur.ozone : null;
          nh3Val = aqiCur.ammonia != null ? aqiCur.ammonia : null;
        }
      }

      const cur = weatherJson.current;
      const isDay = cur.is_day !== undefined ? cur.is_day === 1 : (new Date().getHours() >= 6 && new Date().getHours() < 19);
      const cond = mapWmoCodeToCondition(cur.weather_code, isDay);
      const liveHumidity = Math.round(cur.relative_humidity_2m ?? 65);
      const liveUv = isDay ? Math.round(weatherJson.hourly?.uv_index?.[12] ?? 6) : 0;

      const airQuality = buildHealthDataFromPollutants(
        liveAqi,
        pm25Val,
        pm10Val,
        coVal,
        no2Val,
        so2Val,
        o3Val,
        nh3Val,
        hasLiveAqi,
        liveHumidity,
        liveUv
      );

      // Build CurrentWeather
      const currentWeather: CurrentWeather = {
        location: loc.name,
        state: loc.state,
        temperature: Math.round(cur.temperature_2m),
        feelsLike: Math.round(cur.apparent_temperature),
        condition: cond.condition,
        conditionHi: cond.conditionHi,
        icon: cond.icon,
        humidity: Math.round(cur.relative_humidity_2m),
        windSpeed: Math.round(cur.wind_speed_10m),
        windDirection: `${Math.round(cur.wind_direction_10m)}°`,
        visibility: 8.5,
        cloudCover: Math.round(cur.cloud_cover ?? 40),
        tempHigh: Math.round(weatherJson.daily?.temperature_2m_max?.[0] ?? cur.temperature_2m + 3),
        tempLow: Math.round(weatherJson.daily?.temperature_2m_min?.[0] ?? cur.temperature_2m - 5),
        rainProbability: Math.round(weatherJson.daily?.precipitation_probability_max?.[0] ?? (cur.precipitation > 0 ? 80 : 20)),
        airPressure: Math.round(cur.surface_pressure ?? 1012),
        uvIndex: isDay ? Math.round(weatherJson.hourly?.uv_index?.[12] ?? 6) : 0,
        aqi: airQuality.aqi,
        lastUpdated: `Live Open-Meteo (${loc.stationCode} • Free API)`,
        isDay,
      };

      // Build 24-hour Hourly Forecast
      const hourlyForecast: HourlyForecastItem[] = [];
      const hourlyData = weatherJson.hourly;
      if (hourlyData?.time) {
        const nowIdx = new Date().getHours();
        for (let i = 0; i < 24; i++) {
          const idx = (nowIdx + i) % hourlyData.time.length;
          const timeStr = new Date(hourlyData.time[idx]).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          const hourDate = new Date(hourlyData.time[idx]);
          const hourVal = !isNaN(hourDate.getHours()) ? hourDate.getHours() : ((nowIdx + i) % 24);
          const isHourDay = hourVal >= 6 && hourVal < 19;
          const hCode = hourlyData.weather_code?.[idx] ?? 0;
          const hCond = mapWmoCodeToCondition(hCode, isHourDay);
          hourlyForecast.push({
            time: i === 0 ? 'Now' : timeStr,
            temp: Math.round(hourlyData.temperature_2m?.[idx] ?? 25),
            condition: hCond.condition,
            rainProb: Math.round(hourlyData.precipitation_probability?.[idx] ?? 10),
            uv: isHourDay ? Math.round(hourlyData.uv_index?.[idx] ?? 0) : 0,
            icon: hCond.icon,
          });
        }
      }

      // Build 7-day Daily Forecast
      const dailyForecast: DailyForecastItem[] = [];
      const dailyData = weatherJson.daily;
      const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const DAY_NAMES_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

      if (dailyData?.time) {
        for (let i = 0; i < Math.min(7, dailyData.time.length); i++) {
          const dDate = new Date(dailyData.time[i]);
          const dayIdx = dDate.getDay();
          const dCode = dailyData.weather_code?.[i] ?? 0;
          const dCond = mapWmoCodeToCondition(dCode);
          dailyForecast.push({
            day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[dayIdx],
            dayHi: i === 0 ? 'आज' : i === 1 ? 'कल' : DAY_NAMES_HI[dayIdx],
            date: dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            tempMax: Math.round(dailyData.temperature_2m_max?.[i] ?? 30),
            tempMin: Math.round(dailyData.temperature_2m_min?.[i] ?? 20),
            condition: dCond.condition,
            conditionHi: dCond.conditionHi,
            rainProb: Math.round(dailyData.precipitation_probability_max?.[i] ?? 30),
            humidity: Math.round(cur.relative_humidity_2m),
            windSpeed: Math.round(cur.wind_speed_10m),
          });
        }
      }

      const result: LiveWeatherData = {
        locationId: loc.id,
        currentWeather,
        hourlyForecast,
        dailyForecast,
        airQuality,
        isLive: true,
        provider: 'Open-Meteo Live API (Free & Keyless)',
        lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceType: 'live_open_meteo',
        requestUrl: weatherUrl,
        latencyMs: 140,
        statusCode: 200,
        coords,
        rawPayload: {
          latitude: weatherJson.latitude,
          longitude: weatherJson.longitude,
          elevation: weatherJson.elevation,
          timezone: weatherJson.timezone,
          current: weatherJson.current,
          current_units: weatherJson.current_units,
          air_quality: {
            us_aqi: liveAqi,
            pm2_5: pm25Val,
            pm10: pm10Val,
            carbon_monoxide: coVal,
            nitrogen_dioxide: no2Val,
            sulphur_dioxide: so2Val,
            ozone: o3Val,
            ammonia: nh3Val,
          },
        },
      };

      // Cache locally with 20-minute expiry timestamp
      try {
        const cacheEntry = {
          data: result,
          cachedAt: Date.now(),
        };
        localStorage.setItem(`mausam_live_${loc.id}`, JSON.stringify(cacheEntry));
      } catch {
        // ignore
      }

      return result;
    } catch (err) {
      console.warn('Open-Meteo live fetch failed, checking local cache:', err);
      try {
        const cachedRaw = localStorage.getItem(`mausam_live_${loc.id}`);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          const cachedData = parsed?.data ? parsed.data : parsed;
          const cachedAt = typeof parsed?.cachedAt === 'number' ? parsed.cachedAt : 0;
          const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes (within 15-30 min window)

          if (cachedAt && Date.now() - cachedAt > CACHE_TTL_MS) {
            console.warn(`Cached weather for ${loc.id} is stale (> 20 min old). Ignoring.`);
            localStorage.removeItem(`mausam_live_${loc.id}`);
            return null;
          }

          cachedData.sourceType = 'cached';
          return cachedData;
        }
      } catch {
        // ignore
      }
      return null;
    } finally {
      inFlightWeatherRequests.delete(cacheKey);
    }
  })();

  inFlightWeatherRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}
