/**
 * Environmental Data Service
 * Integrates live environmental data (AQI, weather, allergens) from external APIs
 * Used for symptom prediction and environmental risk analysis
 */

import { createServerClient } from "@/lib/supabase/server"

interface EnvironmentalData {
  location: string
  latitude: number
  longitude: number
  timestamp: string
  aqi: number
  pm25: number
  pm10: number
  o3: number
  no2: number
  so2: number
  co: number
  temperature_c: number
  humidity_percent: number
  heat_index_c: number
  wind_speed_kmh: number
  precipitation_mm: number
  atmospheric_pressure_hpa: number
  uv_index: number
  weather_condition: string
  pollen_level?: string
  pollen_types?: string[]
}

/**
 * Fetch environmental data from Open-Meteo (free, no API key required)
 * and integrate with AQI data from Open-AQ
 */
export async function fetchEnvironmentalData(lat: number, lon: number, location: string): Promise<EnvironmentalData> {
  try {
    // Fetch weather data from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,uv_index&timezone=auto`

    const weatherResponse = await fetch(weatherUrl)
    const weatherData = await weatherResponse.json()

    const current = weatherData.current
    const temperature_c = current.temperature_2m
    const humidity_percent = current.relative_humidity_2m
    const heat_index_c = calculateHeatIndex(temperature_c, humidity_percent)
    const wind_speed_kmh = current.wind_speed_10m
    const atmospheric_pressure_hpa = current.pressure_msl
    const uv_index = current.uv_index
    const weather_condition = getWeatherCondition(current.weather_code)

    // Fetch AQI data from Open-AQ
    const aqiUrl = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}`

    let aqi = 50 // Default moderate AQI
    let pm25 = 25
    let pm10 = 50
    let o3 = 50
    let no2 = 30
    let so2 = 10
    let co = 500

    try {
      const aqiResponse = await fetch(aqiUrl)
      const aqiData = await aqiResponse.json()

      if (aqiData.results && aqiData.results.length > 0) {
        const result = aqiData.results[0]
        // Calculate AQI from measurements
        const measurements = result.measurements || []

        measurements.forEach((m: { parameter: string; value: number; unit: string }) => {
          if (m.parameter === "pm25") pm25 = m.value
          else if (m.parameter === "pm10") pm10 = m.value
          else if (m.parameter === "o3") o3 = m.value
          else if (m.parameter === "no2") no2 = m.value
          else if (m.parameter === "so2") so2 = m.value
          else if (m.parameter === "co") co = m.value
        })

        // Calculate US EPA AQI from PM2.5
        aqi = calculateAQIFromPM25(pm25)
      }
    } catch (error) {
      console.error("Error fetching AQI data:", error)
      // Continue with default values
    }

    const pollen_level = getPollenLevel(aqi)
    const pollen_types = getPollenTypes(temperature_c, humidity_percent)

    return {
      location,
      latitude: lat,
      longitude: lon,
      timestamp: new Date().toISOString(),
      aqi,
      pm25,
      pm10,
      o3,
      no2,
      so2,
      co,
      temperature_c,
      humidity_percent,
      heat_index_c,
      wind_speed_kmh,
      precipitation_mm: 0,
      atmospheric_pressure_hpa,
      uv_index,
      weather_condition,
      pollen_level,
      pollen_types,
    }
  } catch (error) {
    console.error("Error fetching environmental data:", error)
    throw error
  }
}

/**
 * Calculate Heat Index using temperature and humidity
 * Formula: HI = -42.379 + 2.04901523T + 10.14333127RH - 0.22475541T*RH - 0.00683783T² - 0.05481717RH² + 0.00122874T²*RH + 0.00085282T*RH² - 0.00000199T²*RH²
 */
function calculateHeatIndex(tempC: number, humidity: number): number {
  const tempF = tempC * (9 / 5) + 32

  if (tempF < 80) return tempC

  const c1 = -42.379
  const c2 = 2.04901523
  const c3 = 10.14333127
  const c4 = -0.22475541
  const c5 = -0.00683783
  const c6 = -0.05481717
  const c7 = 0.00122874
  const c8 = 0.00085282
  const c9 = -0.00000199

  const hi =
    c1 +
    c2 * tempF +
    c3 * humidity +
    c4 * tempF * humidity +
    c5 * tempF * tempF +
    c6 * humidity * humidity +
    c7 * tempF * tempF * humidity +
    c8 * tempF * humidity * humidity +
    c9 * tempF * tempF * humidity * humidity

  return (hi - 32) * (5 / 9)
}

/**
 * Calculate US EPA AQI from PM2.5 concentration
 * https://www.epa.gov/air-quality/air-quality-index-aqi-basics
 */
function calculateAQIFromPM25(pm25: number): number {
  // AQI breakpoints for PM2.5 (µg/m³)
  const breakpoints = [
    { aqi: [0, 50], pm25: [0, 12] },
    { aqi: [51, 100], pm25: [12.1, 35.4] },
    { aqi: [101, 150], pm25: [35.5, 55.4] },
    { aqi: [151, 200], pm25: [55.5, 150.4] },
    { aqi: [201, 300], pm25: [150.5, 250.4] },
    { aqi: [301, 500], pm25: [250.5, 500.4] },
  ]

  for (const bracket of breakpoints) {
    if (pm25 >= bracket.pm25[0] && pm25 <= bracket.pm25[1]) {
      const aqi_low = bracket.aqi[0]
      const aqi_high = bracket.aqi[1]
      const pm25_low = bracket.pm25[0]
      const pm25_high = bracket.pm25[1]

      return Math.round(((aqi_high - aqi_low) / (pm25_high - pm25_low)) * (pm25 - pm25_low) + aqi_low)
    }
  }

  return 500 // AQI >= 500
}

/**
 * Get pollen level based on AQI
 */
function getPollenLevel(aqi: number): string {
  if (aqi <= 50) return "Low"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "High"
  return "Very High"
}

/**
 * Get likely pollen types based on temperature and humidity
 */
function getPollenTypes(tempC: number, humidity: number): string[] {
  const types: string[] = []

  // Temperature-based pollen prediction
  if (tempC > 15 && tempC < 25) {
    types.push("tree_pollen")
  }
  if (tempC > 18 && tempC < 28) {
    types.push("grass_pollen")
  }
  if (tempC > 10) {
    types.push("weed_pollen")
  }

  // Humidity-based mold prediction
  if (humidity > 60) {
    types.push("mold_spores")
  }

  return types
}

/**
 * Convert WMO weather code to readable condition
 */
function getWeatherCondition(code: number): string {
  const conditions: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  }

  return conditions[code] || "Unknown"
}

/**
 * Save environmental data to Supabase
 */
export async function saveEnvironmentalData(userId: string, envData: EnvironmentalData) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("environmental_data").insert({
    user_id: userId,
    location: envData.location,
    latitude: envData.latitude,
    longitude: envData.longitude,
    timestamp: envData.timestamp,
    aqi: envData.aqi,
    pm25: envData.pm25,
    pm10: envData.pm10,
    o3: envData.o3,
    no2: envData.no2,
    so2: envData.so2,
    co: envData.co,
    temperature_c: envData.temperature_c,
    humidity_percent: envData.humidity_percent,
    heat_index_c: envData.heat_index_c,
    wind_speed_kmh: envData.wind_speed_kmh,
    precipitation_mm: envData.precipitation_mm,
    atmospheric_pressure_hpa: envData.atmospheric_pressure_hpa,
    uv_index: envData.uv_index,
    weather_condition: envData.weather_condition,
    pollen_level: envData.pollen_level,
    pollen_types: envData.pollen_types,
  })

  if (error) {
    console.error("Error saving environmental data:", error)
    throw error
  }
}

/**
 * Get historical environmental data for a user
 */
export async function getEnvironmentalHistory(userId: string, days = 30) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("environmental_data")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching environmental history:", error)
    throw error
  }

  return data
}
