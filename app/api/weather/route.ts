/**
 * Wetter-API (keyless) über Open-Meteo.
 *
 * Ablauf: Stadtname -> Geocoding (Open-Meteo) -> aktuelle Wetterdaten.
 * Keine API-Keys nötig, kostenlos. Antwort ist bewusst schlank und
 * sprachausgabe-freundlich, damit sie später auch als Vapi-Tool taugt.
 *
 *   GET /api/weather?city=Berlin
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/** WMO-Wettercode -> deutsche Beschreibung + Emoji. */
const WEATHER_CODES: Record<number, { text: string; emoji: string }> = {
  0: { text: 'Klarer Himmel', emoji: '☀️' },
  1: { text: 'Überwiegend klar', emoji: '🌤️' },
  2: { text: 'Teilweise bewölkt', emoji: '⛅' },
  3: { text: 'Bedeckt', emoji: '☁️' },
  45: { text: 'Nebel', emoji: '🌫️' },
  48: { text: 'Reifnebel', emoji: '🌫️' },
  51: { text: 'Leichter Nieselregen', emoji: '🌦️' },
  53: { text: 'Nieselregen', emoji: '🌦️' },
  55: { text: 'Starker Nieselregen', emoji: '🌧️' },
  61: { text: 'Leichter Regen', emoji: '🌦️' },
  63: { text: 'Regen', emoji: '🌧️' },
  65: { text: 'Starker Regen', emoji: '🌧️' },
  71: { text: 'Leichter Schneefall', emoji: '🌨️' },
  73: { text: 'Schneefall', emoji: '🌨️' },
  75: { text: 'Starker Schneefall', emoji: '❄️' },
  77: { text: 'Schneegriesel', emoji: '🌨️' },
  80: { text: 'Leichte Regenschauer', emoji: '🌦️' },
  81: { text: 'Regenschauer', emoji: '🌧️' },
  82: { text: 'Heftige Regenschauer', emoji: '⛈️' },
  85: { text: 'Leichte Schneeschauer', emoji: '🌨️' },
  86: { text: 'Starke Schneeschauer', emoji: '❄️' },
  95: { text: 'Gewitter', emoji: '⛈️' },
  96: { text: 'Gewitter mit Hagel', emoji: '⛈️' },
  99: { text: 'Schweres Gewitter mit Hagel', emoji: '⛈️' },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get('city') || '').trim();

  if (!city) {
    return Response.json({ error: 'Bitte eine Stadt angeben.' }, { status: 400 });
  }

  try {
    // 1) Geocoding: Stadt -> Koordinaten
    const geoUrl =
      'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(city) +
      '&count=1&language=de&format=json';
    const geoRes = await fetch(geoUrl, { cache: 'no-store' });
    if (!geoRes.ok) throw new Error('geocoding failed');
    const geo = await geoRes.json();
    const place = geo?.results?.[0];
    if (!place) {
      return Response.json({ error: `Ort „${city}“ wurde nicht gefunden.` }, { status: 404 });
    }

    // 2) Aktuelle Wetterdaten
    const wUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=' +
      place.latitude +
      '&longitude=' +
      place.longitude +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
      '&timezone=auto';
    const wRes = await fetch(wUrl, { cache: 'no-store' });
    if (!wRes.ok) throw new Error('forecast failed');
    const w = await wRes.json();
    const cur = w?.current;
    if (!cur) throw new Error('no current data');

    const code = Number(cur.weather_code);
    const meta = WEATHER_CODES[code] ?? { text: 'Unbekannt', emoji: '🌡️' };

    const label = [place.name, place.admin1, place.country]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ');

    return Response.json({
      city: place.name,
      location: label,
      temperature: Math.round(cur.temperature_2m),
      feelsLike: Math.round(cur.apparent_temperature),
      humidity: Math.round(cur.relative_humidity_2m),
      wind: Math.round(cur.wind_speed_10m),
      description: meta.text,
      emoji: meta.emoji,
      summary: `In ${place.name} sind es ${Math.round(cur.temperature_2m)}°C, ${meta.text.toLowerCase()}, Wind ${Math.round(cur.wind_speed_10m)} km/h.`,
    });
  } catch {
    return Response.json(
      { error: 'Die Wetterdaten sind gerade nicht erreichbar. Bitte gleich noch einmal versuchen.' },
      { status: 502 }
    );
  }
}
