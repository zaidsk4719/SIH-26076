/**
 * Formats data freshness / last updated timestamp into clean, plain-language text.
 * - Under 1 min: "Updated just now" / "अभी अपडेट हुआ"
 * - Under 60 mins: "Updated 5 min ago" / "5 मिनट पहले अपडेट"
 * - Over 60 mins: "Updated at 10:42 AM" / "10:42 AM पर अपडेट"
 */
export function formatLastUpdated(
  timestampOrString?: number | string | null,
  language: string = 'en',
  compact = false
): string {
  const isHi = language === 'hi';

  if (!timestampOrString) {
    return isHi ? 'अभी अपडेट हुआ' : (compact ? 'Just now' : 'Updated just now');
  }

  let dateObj: Date | null = null;

  if (typeof timestampOrString === 'number') {
    dateObj = new Date(timestampOrString);
  } else if (typeof timestampOrString === 'string') {
    const parsed = Date.parse(timestampOrString);
    if (!isNaN(parsed)) {
      dateObj = new Date(parsed);
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    if (typeof timestampOrString === 'string' && timestampOrString.includes(':')) {
      const cleanTime = timestampOrString
        .replace(/^(Live API|Live Open-Meteo|Mock data|Cached Offline|Offline Cache)\s*\(?|\)?$/gi, '')
        .trim();
      return isHi ? `${cleanTime} पर अपडेट` : (compact ? cleanTime : `Updated at ${cleanTime}`);
    }
    return isHi ? 'अभी अपडेट हुआ' : (compact ? 'Just now' : 'Updated just now');
  }

  const diffMs = Date.now() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return isHi ? 'अभी अपडेट हुआ' : (compact ? 'Just now' : 'Updated just now');
  }

  if (diffMins < 60) {
    return isHi
      ? `${diffMins} मिनट पहले अपडेट`
      : (compact ? `${diffMins}m ago` : `Updated ${diffMins} min ago`);
  }

  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isHi
    ? `${timeString} पर अपडेट`
    : (compact ? timeString : `Updated at ${timeString}`);
}
