import React from 'react';

const Citydata = ({ weatherData, theme }) => { //destructure props, weatherData and theme
    if (!weatherData) {
        return null;  // Or return a loading state
    }

    return (
        <div>
            {/* Your detailed weather data display here, using weatherData and theme */}
            {/* Example:  */}
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Coordinates: Latitude {weatherData.coord.lat}, Longitude {weatherData.coord.lon}
            </p>
        </div>
    );
};

export default Citydata;