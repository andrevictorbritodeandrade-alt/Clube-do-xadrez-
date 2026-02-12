import React, { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  min: number;
  max: number;
  rainProb: number;
  code: number;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualiza relógio a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('GPS n/a');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Using Open-Meteo API (Free, no key required)
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`
          );
          
          if (!response.ok) throw new Error('Erro API');

          const data = await response.json();
          
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
            max: Math.round(data.daily.temperature_2m_max[0]),
            min: Math.round(data.daily.temperature_2m_min[0]),
            rainProb: data.daily.precipitation_probability_max[0] || 0
          });
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError('Erro Clima');
          setLoading(false);
        }
      },
      (err) => {
        console.error("GPS Error: ", err);
        setError('GPS Negado');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  // WMO Weather interpretation code
  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️'; // Clear
    if (code >= 1 && code <= 3) return '⛅'; // Cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 67) return '🌧️'; // Drizzle/Rain
    if (code >= 71 && code <= 77) return '❄️'; // Snow
    if (code >= 80 && code <= 82) return '🌦️'; // Showers
    if (code >= 95) return '⛈️'; // Thunderstorm
    return '🌡️';
  };

  // Date Formatting
  const dayName = currentTime.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dateStr = currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  
  // Capitalize first letter of day
  const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <div className="flex flex-col items-end justify-center text-right leading-tight">
      {/* Date Row */}
      <div className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wide mb-1">
        {formattedDay}, {dateStr}
      </div>

      {/* Weather Row */}
      {loading ? (
        <div className="text-[10px] text-slate-500 animate-pulse">Buscando clima...</div>
      ) : error ? (
        <div className="text-[10px] text-red-400 font-medium">{error}</div>
      ) : weather ? (
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-1">
             <span className="text-lg md:text-xl">{getWeatherIcon(weather.code)}</span>
             <span className="text-base md:text-lg font-black text-slate-700">{weather.temp}°C</span>
           </div>
           
           <div className="flex gap-2 text-[10px] md:text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
              <span className="text-red-400">max {weather.max}°</span>
              <span className="text-blue-400">min {weather.min}°</span>
              {weather.rainProb > 0 && (
                <span className="text-blue-600 flex items-center gap-0.5">
                   ☔ {weather.rainProb}%
                </span>
              )}
           </div>
        </div>
      ) : null}
    </div>
  );
};