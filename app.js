// ===== Configuration =====
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
  if (!factEl) return;
  const randomIndex = Math.floor(Math.random() * weatherFacts.length);
  factEl.textContent = weatherFacts[randomIndex];
}

// ===== Flavor Text =====
function getFlavorText(main, tempK) {
  const tempF = (tempK - 273.15) * 9/5 + 32;
  const m = (main || "").toLowerCase();

  if (m.includes("rain")) return "It's dangerous to go alone — take your umbrella!";
  if (m.includes("snow")) return "Bundle up!
