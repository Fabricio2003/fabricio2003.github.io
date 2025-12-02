
const API_KEY = "978bcefe88946e88075492ed34be88bd";
const API_BASE = "https://api.openweathermap.org/data/2.5";
const ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;



// ===== DOM elements =====
const cityInput = document.getElementById("city-input");
const searchForm = document.getElementById("search-form");
const geoBtn = document.getElementById("geo-btn");

const locationNameEl = document.getElementById("location-name");
const lastUpdatedEl = document.getElementById("last-updated");
const iconEl = document.getElementById("weather-icon");
const tempEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const feelsLikeEl = document.getElementById("feels-like");
const errorMessageEl = document.getElementById("error-message");

const forecastGrid = document.getElementById("forecast-grid");
const favoritesListEl = document.getElementById("favorites-list");
const addFavoriteForm = document.getElementById("add-favorite-form");
const favoriteInput = document.getElementById("favorite-input");

const chartCanvas = document.getElementById("trend-chart");
let trendChart = null;

// ... (all your existing functions remain unchanged)

// ===== Orchestration =====
async function fetchByCity(city) {
  clearError();
  try {
    const [current, forecast] = await Promise.all([
      fetchCurrentByCity(city),
      fetchForecastByCity(city)
    ]);
    renderCurrent(current);
    renderForecast(forecast);
    renderTrendChart(forecast);
    localStorage.setItem("weather:lastCity", city);
  } catch (err) {
    showError(err.message || "Unable to fetch weather.");
  }
}

async function fetchByGeolocation() {
  clearError();
  if (!("geolocation" in navigator)) {
    showError("Geolocation not supported on this device.");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const [current, forecast] = await Promise.all([
        fetchCurrentByCoords(latitude, longitude),
        fetchForecastByCoords(latitude, longitude)
      ]);
      renderCurrent(current);
      renderForecast(forecast);
      renderTrendChart(forecast);
  
      localStorage.setItem("weather:lastCoords", JSON.stringify({ latitude, longitude }));
    } catch (err) {
      showError(err.message || "Unable to fetch location weather.");
    }
  }, (err) => {
    showError("Location permission denied. You can search by city instead.");
  }, { enableHighAccuracy: true, timeout: 10000 });
}

// ===== Initial load =====
(function init() {
  renderFavorites();

  const lastCity = localStorage.getItem("weather:lastCity");
  if (lastCity) {
    fetchByCity(lastCity);
    return;
  }

  const lastCoords = localStorage.getItem("weather:lastCoords");
  if (lastCoords) {
    const { latitude, longitude } = JSON.parse(lastCoords);
    Promise.all([
      fetchCurrentByCoords(latitude, longitude),
      fetchForecastByCoords(latitude, longitude),
    ]).then(([current, forecast]) => {
      renderCurrent(current);
      renderForecast(forecast);
      renderTrendChart(forecast);
    
    }).catch(() => {
      fetchByCity("Hayward");
    });
    return;
  }

  // Default start
  fetchByCity("Hayward");
})();
