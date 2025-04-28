class WeatherWidget {
    constructor() {
        this.apiKey = ''; // OpenWeatherMap API key
        this.weather = null;
        this.forecast = null;
        this.location = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadLocation();
    }

    initializeElements() {
        this.weatherContainer = document.getElementById('weatherWidget');
        this.locationInput = document.getElementById('locationInput');
        this.searchBtn = document.getElementById('weatherSearch');
        this.currentWeather = document.getElementById('currentWeather');
        this.forecast = document.getElementById('weatherForecast');
    }

    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchLocation());
        
        this.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });
    }

    async loadLocation() {
        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherByCoords(latitude, longitude);
        } catch (error) {
            console.error('Failed to get location:', error);
            this.showError('Unable to get your location. Please search manually.');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    async searchLocation() {
        const query = this.locationInput.value.trim();
        if (!query) {
            this.showError('Please enter a location');
            return;
        }
        
        try {
            const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            
            if (data.length === 0) {
                this.showError('Location not found');
                return;
            }
            
            const { lat, lon, name, country } = data[0];
            this.location = { lat, lon, name, country };
            await this.fetchWeatherByCoords(lat, lon);
        } catch (error) {
            console.error('Failed to search location:', error);
            this.showError('Failed to search location. Please try again.');
        }
    }

    async fetchWeatherByCoords(lat, lon) {
        try {
            // Fetch current weather
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const weatherResponse = await fetch(weatherUrl);
            this.weather = await weatherResponse.json();
            
            // Fetch 5-day forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const forecastResponse = await fetch(forecastUrl);
            this.forecast = await forecastResponse.json();
            
            this.render();
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            this.showError('Failed to fetch weather data. Please try again.');
        }
    }

    render() {
        if (!this.weather || !this.forecast) {
            return;
        }
        
        this.renderCurrentWeather();
        this.renderForecast();
    }

    renderCurrentWeather() {
        const weather = this.weather;
        const temp = Math.round(weather.main.temp);
        const feelsLike = Math.round(weather.main.feels_like);
        const icon = weather.weather[0].icon;
        const description = weather.weather[0].description;
        
        this.currentWeather.innerHTML = `
            <div class="weather-current fade-scale">
                <div class="weather-header">
                    <h3>${weather.name}, ${weather.sys.country}</h3>
                    <span class="weather-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="weather-body">
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" 
                         alt="${description}" 
                         class="weather-icon">
                    <div class="weather-info">
                        <div class="weather-temp">${temp}°C</div>
                        <div class="weather-desc">${description}</div>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <i class="fas fa-thermometer-half"></i>
                        Feels like: ${feelsLike}°C
                    </div>
                    <div class="weather-detail">
                        <i class="fas fa-tint"></i>
                        Humidity: ${weather.main.humidity}%
                    </div>
                    <div class="weather-detail">
                        <i class="fas fa-wind"></i>
                        Wind: ${Math.round(weather.wind.speed * 3.6)} km/h
                    </div>
                </div>
            </div>
        `;
    }

    renderForecast() {
        const forecastData = this.forecast.list
            .filter(item => new Date(item.dt * 1000).getHours() === 12) // Get only noon forecasts
            .slice(0, 5); // Get next 5 days
        
        this.forecast.innerHTML = `
            <div class="weather-forecast fade-scale">
                ${forecastData.map(day => this.renderForecastDay(day)).join('')}
            </div>
        `;
    }

    renderForecastDay(day) {
        const date = new Date(day.dt * 1000);
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        const description = day.weather[0].description;
        
        return `
            <div class="forecast-day">
                <div class="forecast-date">
                    ${date.toLocaleDateString('default', { weekday: 'short' })}
                </div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" 
                     alt="${description}" 
                     class="forecast-icon">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-desc">${description}</div>
            </div>
        `;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message fade-scale';
        errorDiv.textContent = message;
        
        this.weatherContainer.insertBefore(errorDiv, this.weatherContainer.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    setApiKey(key) {
        this.apiKey = key;
        this.loadLocation(); // Reload weather data with new API key
    }
}

// Initialize Weather Widget
const weatherWidget = new WeatherWidget();

// Export for use in other modules
export default weatherWidget; 