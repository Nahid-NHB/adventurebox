/**
 * Real weather via Open-Meteo (no API key). Uses the device location when
 * permission is granted; falls back to a pleasant default so the matching
 * engine always gets a usable tag.
 */
import * as Location from 'expo-location';
import type { WeatherService } from './index';
import type { WeatherTag } from '@/types/domain';
import { weatherCodeToTag } from './index';

export class OpenMeteoWeatherService implements WeatherService {
  async current(): Promise<WeatherTag> {
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted) {
        const req = await Location.requestForegroundPermissionsAsync();
        if (!req.granted) return 'any';
      }
      const loc = await Location.getLastKnownPositionAsync();
      const pos = loc ?? (await Location.getCurrentPositionAsync({}));
      const { latitude, longitude } = pos.coords;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
      const res = await fetch(url);
      if (!res.ok) return 'any';
      const json = (await res.json()) as {
        current?: { temperature_2m?: number; weather_code?: number };
      };
      const code = json.current?.weather_code ?? 0;
      const temp = json.current?.temperature_2m ?? 18;
      return weatherCodeToTag(code, temp);
    } catch {
      return 'any';
    }
  }
}
