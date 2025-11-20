const WEATHER_EMOJIS = [
  { match: /thunder|storm|lightning|tstorm/i, icon: '⚡️' },
  { match: /snow|sleet|blizzard/i, icon: '❄️' },
  { match: /hail/i, icon: '🧊' },
  { match: /rain|shower|drizzle/i, icon: '🌧️' },
  { match: /mist|fog|haze/i, icon: '🌫️' },
  { match: /cloud|overcast/i, icon: '☁️' },
  { match: /sun|clear/i, icon: '☀️' },
];

export function emojiForDescription(description) {
  if (!description) return '🌍';
  const match = WEATHER_EMOJIS.find((entry) => entry.match.test(description));
  return match?.icon || '🌈';
}
