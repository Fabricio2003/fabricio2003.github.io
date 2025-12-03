
// Configuration setup
const API_KEY = "978bcefe88946e88075492ed34be88bd"; 
const API_BASE = "https://api.openweathermap.org/data/2.5";
const ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

// This is the DOM elements section
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

// These are the utilities  that the program will use.
function formatTemp(kelvin) {
  const c = kelvin - 273.15;
  const f = c * 9/5 + 32;
  return `${Math.round(f)}°F`;
}

function formatWind(mps) {
  const mph = mps * 2.23694;
  return `${Math.round(mph)} mph`;
}

function timestamp() {
  const d = new Date();
  return d.toLocaleString();
}

function setThemeByWeather(main, iconCode, tempK) {
  const f = (tempK - 273.15) * 9/5 + 32;
  const m = (main || "").toLowerCase();
  let gradient, cardBg, cardBorder, cardText;

  if (m.includes("clear")) {
    if (f >= 90) {
      gradient = "linear-gradient(180deg, rgba(255,140,0,0.4), rgba(255,69,0,0.6))";
      cardBg = "#f2a641"; // orange
      cardBorder = "#fb923c";
      cardText = "#1f2937"; // dark text for readability
    } else if (f < 50) {
      gradient = "linear-gradient(180deg, rgba(173,216,230,0.4), rgba(135,206,250,0.6))";
      cardBg = "#90c0e0"; // sky blue
      cardBorder = "#38bdf8";
      cardText = "#1f2937"; // 
    } else {
      gradient = "linear-gradient(180deg, rgba(250,204,21,0.3), rgba(255,255,0,0.4))";
      cardBg = "#ded037"; // bright yellow
      cardBorder = "#facc15";
      cardText = "#1f2937"; // dark text
    }
  } else if (m.includes("cloud")) {
    gradient = "linear-gradient(180deg, rgba(148,163,184,0.3), rgba(100,116,139,0.5))";
    cardBg = "#e5e7eb";
    cardBorder = "#9ca3af";
    cardText = "#1f2937"; // dark text
  } else if (m.includes("rain")) {
    gradient = "linear-gradient(180deg, rgba(96,165,250,0.3), rgba(30,64,175,0.5))";
    cardBg = "#1e3a8a"; // dark blue
    cardBorder = "#60a5fa";
    cardText = "#e5e7eb"; // light text
  } else if (m.includes("snow")) {
    gradient = "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(200,200,255,0.5))";
    cardBg = "#f8fafc"; // very light
    cardBorder = "#cbd5e1";
    cardText = "#1f2937"; // dark text
  } else if (m.includes("thunder")) {
    gradient = "linear-gradient(180deg, rgba(147,51,234,0.3), rgba(88,28,135,0.5))";
    cardBg = "#4c1d95"; // dark purple
    cardBorder = "#a855f7";
    cardText = "#e5e7eb"; // light text
  } else {
    gradient = "linear-gradient(180deg, rgba(96,165,250,0.25), rgba(255,255,255,0.05))";
    cardBg = "#121826";
    cardBorder = "#1f2937";
    cardText = "#e5e7eb"; // default light text
  }

  document.documentElement.style.setProperty("--theme-gradient", gradient);
  document.documentElement.style.setProperty("--card-bg", cardBg);
  document.documentElement.style.setProperty("--card-border", cardBorder);
  document.documentElement.style.setProperty("--card-text", cardText);
}



function showError(msg) {
  errorMessageEl.textContent = msg;
  errorMessageEl.classList.remove("hidden");
}

function clearError() {
  errorMessageEl.textContent = "";
  errorMessageEl.classList.add("hidden");
}
function getFlavorText(main, tempK) {
  const c = tempK - 273.15;
  const f = c * 9/5 + 32;

  const m = (main || "").toLowerCase();

  if (m.includes("clear")) {
    if (f > 85) return "Looks like it is going to be a little hot today. Don't forget your sunscreen!";
    if (f < 50) return "Looks like it's a beautiful but chilly day. Layer up!";
    return "A beautiful, clear day awaits.";
  }

  if (m.includes("cloud")) {
    return f > 70 ? "Huh? Warm and cloudy? Now that is strange." : "Ah man, I don't want to leave the warmth and comfort of my bed.";
  }

  if (m.includes("rain")) {
    return f > 60 ? "Ah, the rain. Now my car got a free carwash!" : "Make sure you cook up your favorite soup and huddle up under your favorite blanket.";
  }

  if (m.includes("snow")) {
    return "In the lane, snow is glistening. A beautiful sight, we're happy tonight. Walking in a winter wonderland";
  }

  if (m.includes("thunder")) {
    return "It's too dangerous to go alone, remember to wear your Thunder Helm";
  }
  if (m.includes("fog")) {
    return "Wow, I can't even see anything! I think I might be a little lost...";
  }
  if (m.includes("smoke")){
    return "Hey, who just burned our dinner?!";
  }
  if (m.includes("wind")){
    return "Sometimes, all I need is the air that I breathe. And to love you!";
  }

  return "Weather’s doing its thing—make the most of it!";
}
// ===== Favorites (localStorage) =====
const FAVORITES_KEY = "weather:favorites";
function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}
function renderFavorites() {
  favoritesListEl.innerHTML = "";
  const favs = loadFavorites();
  favs.forEach(city => {
    const chip = document.createElement("div");
    chip.className = "chip";
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.addEventListener("click", () => fetchByCity(city));
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.title = "Remove";
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
      const next = favs.filter(c => c.toLowerCase() !== city.toLowerCase());
      saveFavorites(next);
      renderFavorites();
    });
    chip.appendChild(btn);
    chip.appendChild(remove);
    favoritesListEl.appendChild(chip);
  });
}

// ===== API calls =====
async function fetchCurrentByCity(city) {
  const url = `${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City not found or API error.");
  return res.json();
}

async function fetchForecastByCity(city) {
  const url = `${API_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast not available.");
  return res.json();
}

async function fetchCurrentByCoords(lat, lon) {
  const url = `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Location not available.");
  return res.json();
}

async function fetchForecastByCoords(lat, lon) {
  const url = `${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast not available.");
  return res.json();
}

// ===== Rendering =====
function renderCurrent(data) {
  const name = `${data.name}, ${data.sys?.country ?? ""}`.trim();
  const w = data.weather?.[0];
  locationNameEl.textContent = name;
  lastUpdatedEl.textContent = `Updated ${timestamp()}`;
  iconEl.src = ICON_URL(w.icon);
  iconEl.alt = w.description || "Weather icon";
  tempEl.textContent = formatTemp(data.main.temp);
  conditionEl.textContent = w.main;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = formatWind(data.wind.speed);
  feelsLikeEl.textContent = formatTemp(data.main.feels_like);
  setThemeByWeather(w.main, w.icon, data.main.temp);
  const flavorEl = document.getElementById("flavor-text");
  flavorEl.textContent = getFlavorText(w.main, data.main.temp);
}

function groupForecastByDay(list) {
  // list is 3-hour slices; group by local date
  const byDay = {};
  list.forEach(item => {
    const dt = new Date(item.dt * 1000);
    const dayKey = dt.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
    if (!byDay[dayKey]) byDay[dayKey] = [];
    byDay[dayKey].push(item);
  });
  return byDay;
}

function summarizeDay(items) {
  let min = Infinity, max = -Infinity;
  const counts = {};
  let icon = items[0].weather[0].icon;

  items.forEach(i => {
    const t = i.main.temp;
    min = Math.min(min, t);
    max = Math.max(max, t);
    const main = i.weather[0].main;
    counts[main] = (counts[main] || 0) + 1;
  });

  const dominant = Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
  return { min, max, dominant, icon };
}

function renderForecast(forecastData) {
  forecastGrid.innerHTML = "";
  const days = groupForecastByDay(forecastData.list);
  const entries = Object.entries(days).slice(0, 5);
  entries.forEach(([date, items]) => {
    const sum = summarizeDay(items);
    const div = document.createElement("div");
    div.className = "forecast-day";
    div.innerHTML = `
      <div class="date">${date}</div>
      <img src="${ICON_URL(sum.icon)}" alt="${sum.dominant}" />
      <div class="temps">
        <strong>High:</strong> ${formatTemp(sum.max)}<br/>
        <strong>Low:</strong> ${formatTemp(sum.min)}
      </div>
      <div class="cond">${sum.dominant}</div>
    `;
    forecastGrid.appendChild(div);
  });
}

function renderTrendChart(forecastData) {
  const labels = forecastData.list.slice(0, 16).map(i =>
    new Date(i.dt * 1000).toLocaleString(undefined, { weekday: "short", hour: "2-digit" })
  );
  const tempsF = forecastData.list.slice(0, 16).map(i => {
    const c = i.main.temp - 273.15;
    return Math.round(c * 9/5 + 32);
  });

  if (trendChart) {
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = tempsF;
    trendChart.update();
    return;
  }

  trendChart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Forecast temp (°F)",
        data: tempsF,
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.2)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.05)" } }
      },
      plugins: {
        legend: { labels: { color: "#e5e7eb" } }
      }
    }
  });
}

// Orchestration 
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

// Event listeners 
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city.length === 0) return;
  fetchByCity(city);
});

geoBtn.addEventListener("click", () => {
  fetchByGeolocation();
});

addFavoriteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = favoriteInput.value.trim();
  if (!city) return;
  const favs = loadFavorites();
  if (!favs.find(c => c.toLowerCase() === city.toLowerCase())) {
    favs.push(city);
    saveFavorites(favs);
    renderFavorites();
  }
  favoriteInput.value = "";
});

// Initial load 
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
