import {
  PreferenceId,
  TimeOfDay,
  UserPreferences,
  WeatherAlert,
  CurrentWeather,
  HealthData,
  FitnessData,
  CardScoreResult,
} from '../types';

export type CardScoringResult = CardScoreResult;

/**
 * Rule-Based Personalization Engine for Mausam Mobile App
 * As specified in SIH 2026 Problem Statement 26076:
 * - Severe Weather Alert = +100
 * - Rain Alert = +90
 * - AQI/Health Alert = +80
 * - UV Alert = +70
 * - User's primary interest = +50
 * - Location relevance = +40
 * - Time relevance = +30
 */
export function calculatePersonalizedCardOrder(
  preferences: UserPreferences,
  currentWeather: CurrentWeather,
  alerts: WeatherAlert[],
  healthData: HealthData,
  fitnessData: FitnessData,
  simulatedTimeOfDay?: TimeOfDay
): CardScoringResult[] {
  // Determine current effective time of day
  const effectiveTime = getEffectiveTimeOfDay(simulatedTimeOfDay);

  const activePreferences = preferences.preferences;
  const cards: PreferenceId[] = [
    'fitness',
    'health',
    'travel',
    'marine',
    'family',
    'agriculture',
    'commute',
    'events',
  ];

  // Check alert triggers
  const safeAlerts = alerts || [];
  const hasSevereWeatherAlert = safeAlerts.some(
    (a) => a.severity === 'red' || a.severity === 'orange'
  );
  const hasRainAlert =
    currentWeather.rainProbability >= 60 ||
    safeAlerts.some((a) => a.type.toLowerCase().includes('rain') || a.type.toLowerCase().includes('storm'));
  const hasAqiAlert =
    currentWeather.aqi > 150 ||
    healthData.aqiCategory === 'Poor' ||
    healthData.aqiCategory === 'Very Poor' ||
    healthData.aqiCategory === 'Severe';
  const hasUvAlert =
    currentWeather.uvIndex >= 7 ||
    safeAlerts.some((a) => a.type.toLowerCase().includes('uv'));
  const hasHeatAlert = Boolean(fitnessData?.heatAlert?.active);

  const results: CardScoringResult[] = cards.map((cardId) => {
    let base = 20; // Base baseline score
    let preferenceBonus = 0;
    let alertBonus = 0;
    let timeBonus = 0;
    const reasonsEn: string[] = [];
    const reasonsHi: string[] = [];

    // 1. User Preference Relevance (+50 for primary selected interest)
    const prefIndex = activePreferences.indexOf(cardId);
    if (prefIndex !== -1) {
      // First selected gets +50, second +45, third +40
      const boost = Math.max(30, 50 - prefIndex * 5);
      preferenceBonus += boost;
      reasonsEn.push(`User interest selected (+${boost})`);
      reasonsHi.push(`उपयोगकर्ता द्वारा चुनी गई प्राथमिकता (+${boost})`);
    } else {
      // Not selected by user - still available but with lower priority
      base = 10;
    }

    // 2. Alert Relevance Scoring
    switch (cardId) {
      case 'fitness':
        if (hasHeatAlert) {
          alertBonus += 70; // Heat Alert
          reasonsEn.push('Active heat hazard advisory (+70)');
          reasonsHi.push('सक्रिय हीट वेव चेतावनी (+70)');
        }
        if (hasUvAlert) {
          alertBonus += 40;
          reasonsEn.push('High UV radiation warning (+40)');
          reasonsHi.push('उच्च यूवी विकिरण चेतावनी (+40)');
        }
        break;

      case 'health':
        if (hasAqiAlert) {
          alertBonus += 80; // AQI/Health Alert
          reasonsEn.push('Elevated AQI / Respiratory alert (+80)');
          reasonsHi.push('उच्च वायु प्रदूषण चेतावनी (+80)');
        }
        if (hasUvAlert) {
          alertBonus += 70; // UV Alert
          reasonsEn.push('Severe UV radiation alert (+70)');
          reasonsHi.push('तीव्र यूवी विकिरण चेतावनी (+70)');
        }
        break;

      case 'commute':
        if (hasSevereWeatherAlert) {
          alertBonus += 90;
          reasonsEn.push('Severe thunderstorm road hazard (+90)');
          reasonsHi.push('आंधी-तूफान सड़क जोखिम (+90)');
        }
        if (hasRainAlert) {
          alertBonus += 80;
          reasonsEn.push('Rain / waterlogging slowdown alert (+80)');
          reasonsHi.push('बारिश व जलभराव धीमा ट्रैफिक चेतावनी (+80)');
        }
        break;

      case 'family':
        if (hasRainAlert) {
          alertBonus += 85;
          reasonsEn.push('School commute rain forecast (+85)');
          reasonsHi.push('स्कूल आवागमन में बारिश का जोखिम (+85)');
        }
        if (hasSevereWeatherAlert) {
          alertBonus += 75;
          reasonsEn.push('Severe weather child safety advisory (+75)');
          reasonsHi.push('मौसम सुरक्षा चेतावनी (+75)');
        }
        break;

      case 'agriculture':
        if (hasRainAlert) {
          alertBonus += 80;
          reasonsEn.push('Rainfall & soil moisture advisory (+80)');
          reasonsHi.push('वर्षा व मृदा नमी परामर्श (+80)');
        }
        break;

      case 'marine':
        if (hasSevereWeatherAlert) {
          alertBonus += 95;
          reasonsEn.push('Coastal squall / Fishermen warning (+95)');
          reasonsHi.push('तटीय तूफान / मछुआरा चेतावनी (+95)');
        }
        break;

      case 'travel':
        if (hasSevereWeatherAlert) {
          alertBonus += 75;
          reasonsEn.push('Flight delay / highway hazard warning (+75)');
          reasonsHi.push('उड़ान व राजमार्ग मौसम चेतावनी (+75)');
        }
        break;

      case 'events':
        if (hasRainAlert) {
          alertBonus += 75;
          reasonsEn.push('Rain probability impact on outdoor venue (+75)');
          reasonsHi.push('आयोजन स्थल पर वर्षा का प्रभाव (+75)');
        }
        break;
    }

    // 3. Time-Aware Personalization (+30 for high time match)
    if (effectiveTime === 'morning') {
      // Morning: Prioritize Sunrise, morning running, school commute, AQI
      if (cardId === 'fitness') {
        timeBonus += 30;
        reasonsEn.push('Peak morning running window (+30)');
        reasonsHi.push('सुबह दौड़ने का सर्वोत्तम समय (+30)');
      } else if (cardId === 'family') {
        timeBonus += 30;
        reasonsEn.push('Morning school transit time (+30)');
        reasonsHi.push('सुबह स्कूल जाने का समय (+30)');
      } else if (cardId === 'health') {
        timeBonus += 25;
        reasonsEn.push('Early morning AQI inspection (+25)');
        reasonsHi.push('प्रातःकालीन वायु गुणवत्ता जांच (+25)');
      }
    } else if (effectiveTime === 'afternoon') {
      // Afternoon: Prioritize Heat, UV, Rain, Traffic, Visibility, School pick-up
      if (cardId === 'health' || cardId === 'fitness') {
        timeBonus += 30;
        reasonsEn.push('Peak afternoon UV/heat index (+30)');
        reasonsHi.push('दोपहर का चरम तापमान व यूवी स्तर (+30)');
      } else if (cardId === 'family') {
        timeBonus += 30;
        reasonsEn.push('Afternoon school return window (+30)');
        reasonsHi.push('दोपहर स्कूल वापसी का समय (+30)');
      } else if (cardId === 'commute') {
        timeBonus += 25;
        reasonsEn.push('Afternoon traffic & road conditions (+25)');
        reasonsHi.push('दोपहर ट्रैफिक व सड़क स्थिति (+25)');
      }
    } else if (effectiveTime === 'evening') {
      // Evening: Sunset, evening commute, outdoor events, marine
      if (cardId === 'commute') {
        timeBonus += 30;
        reasonsEn.push('Evening rush hour commute window (+30)');
        reasonsHi.push('शाम का पीक ट्रैफिक समय (+30)');
      } else if (cardId === 'events') {
        timeBonus += 30;
        reasonsEn.push('Evening outdoor gathering comfort (+30)');
        reasonsHi.push('शाम के आउटडोर कार्यक्रम की स्थिति (+30)');
      } else if (cardId === 'fitness') {
        timeBonus += 20;
        reasonsEn.push('Post-sunset workout opportunity (+20)');
        reasonsHi.push('सूर्यास्त के बाद व्यायाम का अवसर (+20)');
      }
    } else if (effectiveTime === 'night') {
      // Night: Overnight travel, air inversion, dew & crop cooling
      if (cardId === 'travel') {
        timeBonus += 30;
        reasonsEn.push('Overnight highway & airport transit (+30)');
        reasonsHi.push('रात्रि राजमार्ग व हवाई यात्रा (+30)');
      } else if (cardId === 'health') {
        timeBonus += 25;
        reasonsEn.push('Overnight air inversion & ventilation (+25)');
        reasonsHi.push('रात्रि वायु गुणवत्ता व वेंटिलेशन (+25)');
      } else if (cardId === 'agriculture') {
        timeBonus += 20;
        reasonsEn.push('Nighttime dew & ground radiative cooling (+20)');
        reasonsHi.push('रात्रि ओस व तापमान गिरावट (+20)');
      }
    }

    const totalScore = base + preferenceBonus + alertBonus + timeBonus;

    return {
      cardId,
      score: totalScore,
      breakdown: {
        baseScore: base,
        userInterestBonus: preferenceBonus,
        alertBonus,
        severeAlertBonus: alertBonus >= 100 ? 100 : 0,
        timeBonus,
        locationBonus: 0,
      },
      scoreBreakdown: {
        base,
        preferenceBonus,
        alertBonus,
        timeBonus,
      },
      explanation:
        reasonsEn.length > 0
          ? reasonsEn.join(' • ')
          : 'Standard background weather monitoring',
      explanationHi:
        reasonsHi.length > 0
          ? reasonsHi.join(' • ')
          : 'सामान्य मौसमी निगरानी',
    };
  });

  // Sort strictly in descending order of total score
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Determine time of day from system or simulation
 */
export function getEffectiveTimeOfDay(simulated?: TimeOfDay): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (simulated && simulated !== 'auto') {
    return simulated;
  }
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}
