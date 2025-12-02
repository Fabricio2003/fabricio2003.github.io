
const API_KEY = "978bcefe88946e88075492ed34be88bd";
const API_BASE = "https://api.openweathermap.org/data/2.5";
const ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

// ===== Fun Facts =====
const weatherFacts = [
  "The highest temperature ever recorded on Earth was 134°F in Death Valley, California.",
  "Raindrops can fall at speeds of up to 22 miles per hour.",
  "Snowflakes always have six sides, but no two are exactly alike.",
  "Lightning strikes the Earth about 100 times every second.",
  "Fog is actually a cloud that touches the ground.",
  "The Sahara Desert can get below freezing at night despite scorching daytime heat.",
  "The fastest winds ever recorded were over 250 mph during a tornado in Oklahoma.",
  "The coldest inhabited place on Earth is Oymyakon, Russia, with temps below -90°F."
];

function showRandomFact() {
  const factEl = document.getElementById("fact-text");
  const randomIndex = Math.floor(Math.random() * weatherFacts.length);
  factEl.textContent = weatherFacts[randomIndex];
}

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
    showRandomFact(); // <-- show a new fact after each search
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
      showRandomFact(); // <-- show a new fact when using geolocation
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
  showRandomFact(); // <-- show a fact on page load

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
      showRandomFact();
    }).catch(() => {
      fetchByCity("Hayward");
    });
    return;
  }

  // Default start
  fetchByCity("Hayward");
})();
