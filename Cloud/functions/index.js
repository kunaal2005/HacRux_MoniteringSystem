/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const f = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Replace with your weather API endpoint and key
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = "a18251df6fb44f48a2d123718252103";
const LOCATION = "Ajmer";
exports.fetchWeatherData=f.pubsub.schedule("every 30 minutes").onRun(async(context)=>{
  try {
    const url =`${WEATHER_API_URL}?q=${LOCATION}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    const weatherData = response.data;

    // Structure the data as needed
    const data = {
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    const db = admin.firestore();
    await db.collection("weatherData").add(data);

    console.log("Weather data fetched and stored successfully.");
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
});
