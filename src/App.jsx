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
  const [notification, setNotification] = useState(null); // Added notification state

  // Get weather icon based on weather condition code
  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Get dynamic background based on weather and time of day
  const getDynamicBackground = () => {
    if (!weatherData) return theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-100 to-blue-200';

    const weatherId = weatherData.weather[0].id;
    const isDay = weatherData.weather[0].icon.includes('d');

    if (weatherId >= 200 && weatherId < 300) {
      // Thunderstorm
      return theme === 'dark'
        ? 'bg-gradient-to-b from-gray-900 to-indigo-900'
        : 'bg-gradient-to-b from-gray-400 to-indigo-300';
    } else if (weatherId >= 300 && weatherId < 400 || (weatherId >= 500 && weatherId < 600)) {
      // Rain
      return theme === 'dark'
        ? 'bg-gradient-to-b from-gray-900 to-blue-900'
        : 'bg-gradient-to-b from-gray-300 to-blue-200';
    } else if (weatherId >= 600 && weatherId < 700) {
      // Snow
      return theme === 'dark'
        ? 'bg-gradient-to-b from-gray-800 to-blue-800'
        : 'bg-gradient-to-b from-blue-50 to-gray-100';
    } else if (weatherId >= 700 && weatherId < 800) {
      // Atmosphere (fog, mist, etc.)
      return theme === 'dark'
        ? 'bg-gradient-to-b from-gray-800 to-gray-700'
        : 'bg-gradient-to-b from-gray-300 to-gray-200';
    } else if (weatherId === 800) {
      // Clear sky
      return isDay
        ? (theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-blue-800' : 'bg-gradient-to-b from-blue-300 to-blue-100')
        : (theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-indigo-900' : 'bg-gradient-to-b from-indigo-500 to-purple-300');
    } else {
      // Clouds
      return theme === 'dark'
        ? 'bg-gradient-to-b from-gray-900 to-gray-700'
        : 'bg-gradient-to-b from-gray-200 to-blue-100';
    }
  };


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
          showNotification(`Weather updated for ${cityName}`, 'success'); // Show notification

          // Add to recent searches if not already there
          if (!recentSearches.includes(cityName)) {
            const updatedSearches = [cityName, ...recentSearches.slice(0, 4)];
            setRecentSearches(updatedSearches);
            localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
          }
        } else {
          setWeatherData(null);
          setError(`Could not find weather for "${cityName}". Please check the city name.`);
          showNotification(`City not found: ${cityName}`, 'error'); // Show notification
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError("Network error. Please try again.");
        showNotification("Network error. Please try again later.", 'error'); // Show notification
        setWeatherData(null);
      });
  };


  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Notification disappears after 3 seconds
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
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    showNotification(`Switched to ${newTheme} theme`, 'info'); // Show notification
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    showNotification(`Switched to ${newUnit === 'metric' ? 'Celsius' : 'Fahrenheit'}`, 'info'); // Show notification
    if (city) {
      fetchWeather(city, newUnit);
    }
  };

  return (
    <div className={`min-h-screen ${getDynamicBackground()} p-4 flex justify-center items-center transition-all duration-500`}>
      {/* Notification component */}
      {notification && (
        <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg transition-opacity duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white'} rounded-xl shadow-xl p-6 m-4 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <svg className={`w-8 h-8 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              GetWeather
            </h1>
          </div>
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
          <div className="relative flex">
            <input
              type="text"
              placeholder="Enter city name..."
              className={`flex-grow p-3 pr-12 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className={`px-4 py-3 rounded-r-lg ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
              disabled={isLoading}
              aria-label="Search"
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
            <div className="flex justify-between items-center mb-2">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Recent searches:</p>
              <button
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem('recentSearches');
                  showNotification("Recent searches cleared", 'info'); // Show notification
                }}
                className={`text-xs px-2 py-1 rounded ${
                  theme === 'dark'
                    ? 'bg-red-900 hover:bg-red-800 text-gray-300'
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                } transition-colors`}
                title="Clear recent searches"
              >
                Clear All
              </button>
            </div>
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
            </div>
          </div>
        )}

        {error && (
          <div className={`mb-6 p-3 rounded-lg ${
            theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          } flex items-center`}>
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
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
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
            } mb-4 transition-all duration-300 transform hover:scale-102`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{weatherData.name}, {weatherData.sys.country}</h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={getWeatherIcon(weatherData.weather[0].icon)}
                    alt={weatherData.weather[0].description}
                    className="w-24 h-24"
                    title={weatherData.weather[0].description}
                  />
                  <div className="ml-4">
                    <div className="text-4xl font-bold">
                      {Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                    </div>
                    <div className="capitalize">{weatherData.weather[0].description}</div>
                  </div>
                </div>
                <div className={`text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-center justify-end mb-1">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Feels like: {Math.round(weatherData.main.feels_like)}°</span>
                  </div>
                  <div className="flex items-center justify-end mb-1">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>High: {Math.round(weatherData.main.temp_max)}°</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>Low: {Math.round(weatherData.main.temp_min)}°</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex flex-col items-center`}>
                  <svg className="w-6 h-6 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Humidity</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{weatherData.main.humidity}%</span>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex flex-col items-center`}>
                  <svg className="w-6 h-6 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Wind</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'm/s' : 'mph'}</span>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex flex-col items-center`}>
                  <svg className="w-6 h-6 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.048m1.517 10.072a11.952 11.952 0 000 3.71m5.618-4.016A11.955 11.955 0 0112 21.056a11.955 11.955 0 01-8.618-3.048m1.517-10.072a11.952 11.952 0 000-3.71" />
                  </svg>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pressure</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{weatherData.main.pressure} hPa</span>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex flex-col items-center`}>
                  <svg className="w-6 h-6 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Visibility</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{weatherData.visibility / 1000} km</span>
                </div>
              </div>
            </div>
            <Citydata weatherData={weatherData} theme={theme} />
          </div>
        ) : (
          <div className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>Enter a city to see the weather.</p>
          </div>
        )}
      </div>
    </div>
  );
}