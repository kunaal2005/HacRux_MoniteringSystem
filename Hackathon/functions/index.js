const {initializeApp} = require("firebase-admin/app");
initializeApp();

const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const axios = require("axios");

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
const LOCATION = "Ajmer";
// Change this to take Location from Users/{UID}/FieldList/{FieldID}/FieldInfo/Data/.location

exports.fetchWeatherData = onSchedule(
    "every 2 hours",
    async () => {
      try {
        console.log("Function started!");
        const API_KEY = process.env.WEATHER_API_KEY;
        console.log("process.env", process.env);
        console.log("APK;", API_KEY);
        const url =
          `${WEATHER_API_URL}?q=${LOCATION}&appid=${API_KEY}&units=metric}`;

        console.log("URL:", url);

        const response = await axios.get(url);
        const weatherData = response.data;
        const {lat, lon} = weatherData.coord;
        const forecastUrl =
          `${FORECAST_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}` +
          `&units=metric`;
        console.log("Weather Data:", weatherData);
        const forecastResponse = await axios.get(forecastUrl);
        const forecastData = forecastResponse.data;
        console.log("Forecast Data:", forecastData);

        const db = admin.firestore();
        let rain = 0;
        for (let i = 0; i < Math.min(2, forecastData.list.length); i++) {
          const forecast = forecastData.list[i];
          if (forecast.rain && forecast.rain["3h"]) {
            rain = forecast.rain["3h"];
            break;
          }
        }
        const data = {
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          windspeed: weatherData.wind.speed,
          rain: rain,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };
// Change below path to write data in Users/{UID}/FieldList/{FieldID}/WeatherInfo/Data/
        await db.collection("weatherData").add(data);
        console.log("Weather data stored successfully.");
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    });
const calculateAdjustedMoisture = require("./calculate-adjusted-moisture");
exports.calculateAdjustedMoisture =
  calculateAdjustedMoisture.calculateAdjustedMoisture;


