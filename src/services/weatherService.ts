import * as Location from 'expo-location';
import type { WeatherInfo } from '@/src/types';

const FALLBACK_WEATHER: WeatherInfo = {
  temperature: 18,
  condition: 'partly_cloudy',
  description: 'Partly cloudy, mild',
};

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
}

function weatherCodeToDescription(code: number): { condition: string; description: string } {
  if (code === 0) return { condition: 'clear', description: 'Clear sky' };
  if (code <= 3) return { condition: 'partly_cloudy', description: 'Partly cloudy' };
  if (code <= 48) return { condition: 'foggy', description: 'Foggy' };
  if (code <= 57) return { condition: 'drizzle', description: 'Light drizzle' };
  if (code <= 67) return { condition: 'rain', description: 'Rainy' };
  if (code <= 77) return { condition: 'snow', description: 'Snowy' };
  if (code <= 82) return { condition: 'showers', description: 'Rain showers' };
  if (code <= 86) return { condition: 'snow_showers', description: 'Snow showers' };
  if (code <= 99) return { condition: 'thunderstorm', description: 'Thunderstorm' };
  return { condition: 'unknown', description: 'Variable conditions' };
}

export async function fetchWeather(useLocation: boolean): Promise<WeatherInfo> {
  if (!useLocation) return FALLBACK_WEATHER;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return FALLBACK_WEATHER;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) return FALLBACK_WEATHER;

    const data = (await response.json()) as OpenMeteoResponse;
    const temp = data.current?.temperature_2m ?? FALLBACK_WEATHER.temperature;
    const code = data.current?.weather_code ?? 2;
    const { condition, description } = weatherCodeToDescription(code);

    return {
      temperature: Math.round(temp),
      condition,
      description,
    };
  } catch {
    return FALLBACK_WEATHER;
  }
}
