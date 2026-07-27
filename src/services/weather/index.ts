/**
 * Weather abstraction. Maps conditions to a WeatherTag the matching engine
 * uses (rainy -> indoor missions, sunny -> outdoor, windy -> kites/leaves).
 * Real impl would call Open-Meteo with the device location. Stub returns a
 * pleasant default and is offline-safe.
 */
import type { WeatherTag } from '@/types/domain';
import { config } from '../config';

export interface WeatherService {
  current(): Promise<WeatherTag>;
}

class StubWeatherService implements WeatherService {
  async current(): Promise<WeatherTag> {
    return 'sunny';
  }
}

let instance: WeatherService | null = null;
export function getWeatherService(): WeatherService {
  if (!instance) {
    // Live weather is enabled alongside real sync/AI (needs network anyway).
    if (config.useRealAI || config.useRealSync) {
      const { OpenMeteoWeatherService } = require('./openmeteo');
      instance = new OpenMeteoWeatherService();
    } else {
      instance = new StubWeatherService();
    }
  }
  return instance!;
}

/** Map an Open-Meteo weather code to our tag (used by the real impl). */
export function weatherCodeToTag(code: number, tempC: number): WeatherTag {
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'cold';
  if (code >= 95) return 'rainy';
  if (tempC <= 5) return 'cold';
  if (tempC >= 28) return 'hot';
  return 'sunny';
}
