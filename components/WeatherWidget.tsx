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
          setError('S/ Sinal');
          setLoading(false);
        }
      },
      (err) => {
        // console.error("GPS Error: ", err); 
        // Silently fail or show simple msg
        setError('GPS Off');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  // WMO Weather interpretation code
  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️'; 
    if (code >= 1 && code <= 3) return '⛅'; 
    if (code >= 45 && code <= 48) return '🌫️'; 
    if (code >= 51 && code <= 67) return '🌧️'; 
    if (code >= 71 && code <= 77) return '❄️'; 
    if (code >= 80 && code <= 82) return '🌦️'; 
    if (code >= 95) return '⛈️'; 
    return '🌡️';
  };

  // Date Formatting
  const dayName = currentTime.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dateStr = currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  
  // Clean day name (remove -feira)
  const cleanDay = dayName.split('-')[0];
  const formattedDay = cleanDay.charAt(0).toUpperCase() + cleanDay.slice(1);

  return (
    <div className="flex flex-col items-end justify-center leading-none select-none">
      {/* Date Row */}
      <div className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 drop-shadow-sm">
        {formattedDay}, {dateStr}
      </div>

      {/* Weather Row - Compacted */}
      {loading ? (
        <div className="text-[10px] text-slate-400 animate-pulse">Carregando...</div>
      ) : error ? (
        <div className="text-[10px] text-red-400 font-bold">{error}</div>
      ) : weather ? (
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 shadow-sm">
           <span className="text-base mr-2 filter drop-shadow-sm">{getWeatherIcon(weather.code)}</span>
           <span className="text-sm font-black text-white mr-3 drop-shadow-md">{weather.temp}°</span>
           
           <div className="h-3 w-px bg-white/20 mx-1"></div>
           
           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-200">
              <span className="flex items-center" title="Máxima"><span className="text-red-400 mr-px">↑</span>{weather.max}°</span>
              <span className="flex items-center" title="Mínima"><span className="text-blue-400 mr-px">↓</span>{weather.min}°</span>
              {weather.rainProb > 0 && (
                <span className="flex items-center text-blue-300 ml-0.5" title="Chuva">
                   ☔ {weather.rainProb}%
                </span>
              )}
           </div>
        </div>
      ) : null}
    </div>
  );
};