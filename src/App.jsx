import React, { useEffect, useState } from 'react';
import Citydata from './Citydata';

export default function App() {
  const url = 'https://api.openweathermap.org/data/2.5/weather';
  const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';
  
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [theme, setTheme] = useState('light');
  const [unit, setUnit] = useState('metric');

  const fetchWeather = (cityName, unitSystem = unit) => {
    if (!cityName) return;
    
    setIsLoading(true);
    setError(null);
    
    fetch(`${url}?q=${cityName}&appid=${apiKey}&units=${unitSystem}`)
      .then((response) => response.json())
      .then((res) => {
        setIsLoading(false);
        if (res.cod === 200) {
          setWeatherData(res);
          // Add to recent searches if not already there
          if (!recentSearches.includes(cityName)) {
            const updatedSearches = [cityName, ...recentSearches.slice(0, 4)];
            setRecentSearches(updatedSearches);
            localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
          }
        } else {
          setWeatherData(null);
          setError(`Could not find weather for "${cityName}". Please check the city name.`);
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError("Network error. Please try again.");
        setWeatherData(null);
      });
  };

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    // Check for user's preferred theme
    const userPrefersDark = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (userPrefersDark) {
      setTheme('dark');
    }
    
    // Check for saved location
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
      setCity(savedCity);
    }
  }, []);

  useEffect(() => {
    if (city) {
      fetchWeather(city);
      localStorage.setItem('lastCity', city);
    }
  }, [city, unit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setCity(input.trim());
      setInput('');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (city) {
      fetchWeather(city, newUnit);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-100 to-blue-200'} p-4 flex justify-center items-center transition-colors duration-300`}>
      <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-8 m-4 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            GetWeather
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={toggleUnit} 
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              title={unit === 'metric' ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
            >
              {unit === 'metric' ? '°C' : '°F'}
            </button>
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter city name..."
              className={`w-full p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border border-gray-300 text-gray-900'
              }`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              list="city-suggestions"
            />
            <datalist id="city-suggestions">
              {recentSearches.map((search, index) => (
                <option key={index} value={search} />
              ))}
            </datalist>
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white p-2 rounded-lg transition-colors`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              )}
            </button>
          </div>
        </form>
        
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setCity(search)}
                  className={`text-sm px-3 py-1 rounded-full ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } transition-colors`}
                >
                  {search}
                </button>
              ))}
              <button
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem('recentSearches');
                }}
                className={`text-sm px-3 py-1 rounded-full ${
                  theme === 'dark'
                    ? 'bg-red-900 hover:bg-red-800 text-gray-300'
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                } transition-colors`}
                title="Clear recent searches"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className={`mb-6 p-3 rounded-lg ${
            theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className={`w-12 h-12 border-4 ${
              theme === 'dark' ? 'border-blue-700 border-t-blue-400' : 'border-blue-400 border-t-blue-600'
            } rounded-full animate-spin`}></div>
          </div>
        ) : weatherData ? (
          <div className="animate-fade-in">
            <Citydata data={weatherData} theme={theme} unit={unit} />
          </div>
        ) : (
          <div className={`text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          } p-8`}>
            <svg className="mx-auto h-16 w-16 mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            <p>Enter a city name to see the current weather</p>
          </div>
        )}
        
        <div className={`mt-8 text-center ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Made with ❤️</p>
        </div>
      </div>
    </div>
  );
}