const fs = require("fs");
const {getFirestore} = require("firebase-admin/firestore");
const {onValueWritten} = require("firebase-functions/v2/database");
const {getDatabase} = require("firebase-admin/database");

// Read JSON files
const kcData = JSON.parse(fs.readFileSync("kcValue.json"));
const userSelection = JSON.parse(fs.readFileSync("UserSelection.json"));
const soilTypesData = JSON.parse(fs.readFileSync("soilTypes.json"));

exports.calculateAdjustedMoisture = onValueWritten(
    {region: "asia-southeast1", ref: "/sensor/moisture"},
    async (event) => {
      const moistureLevel = event.data.after.val();
      console.log("The moisture level is", moistureLevel);
      const weatherSnapshot = await getFirestore()
          .collection("weatherData")
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();
      if (weatherSnapshot.empty) {
        console.log("No weather data found!");
        return;
      }

      const weatherDataFirestore = weatherSnapshot.docs[0].data();

      // Soil sensor data
      const soilSensorData = {
        currentSoilMoistureFraction: (1024 - moistureLevel) / 1024,
      };
      // Dynamically fetch soil parameters based on user selection
      const selectedSoilType = userSelection.user_selection.soil_type;
      const soilParameters = soilTypesData[selectedSoilType] || {
        fieldCapacityFraction: 0.35,
        wiltingPointFraction: 0.15,
        rootZoneDepthMM: 500,
      };

      // Dynamically Fetching Crop Coefficient from JSON
      const selectedCrop = userSelection.user_selection.crop;
      const selectedGrowthStage = userSelection.user_selection.growth_stage;
      const selectedCropCoefficients =
        kcData.crop_coefficients && kcData.crop_coefficients[selectedCrop];
      const cropCoefficient =
        selectedCropCoefficients &&
        selectedCropCoefficients[selectedGrowthStage]?
        selectedCropCoefficients[selectedGrowthStage]:
        1.0;
      const cropParameters = {
        cropCoefficient: cropCoefficient,
      };
      // Field area (dynamic)
      const fieldAreaSquareMeters = userSelection.user_selection.Area;

      // Weather conditions data from Firestore
      const temperatureCelsius = weatherDataFirestore.temperature;
      const rawHumidity = weatherDataFirestore.humidity;
      const windSpeedMetersPerSecond = weatherDataFirestore.windspeed;
      const atmosphericPressureKPa = weatherDataFirestore.pressure;
      const effectiveRainfallMM = weatherDataFirestore.rain || 0;
      const netRadiationMJPerSquareMeter = 20; // Static value as per your note
      // const soilHeatFlux = 0; // Assume negligible soil heat flux
      // Calculate saturation vapor pressure (es) in kPa using temperature
      const saturationVaporPressure =
        0.6108 * Math.exp((17.27 * temperatureCelsius) /
        (temperatureCelsius + 237.3));

      // Calculate actual vapor pressure (ea) based on raw humidity
      const actualVaporPressure =
        (rawHumidity / 100) * saturationVaporPressure;

      // Calculate relative humidity percentage
      const relativeHumidityPercent = (actualVaporPressure /
        saturationVaporPressure) * 100;

      const weatherConditions = {
        relativeHumidityPercent: relativeHumidityPercent,
        temperatureCelsius: temperatureCelsius,
        windSpeedMetersPerSecond: windSpeedMetersPerSecond,
        atmosphericPressureKPa: atmosphericPressureKPa,
        netRadiationMJPerSquareMeter: netRadiationMJPerSquareMeter,
        effectiveRainfallMM: effectiveRainfallMM,
      };

      /**
      * Calculates the total wat based on various parameters.
      * @param {object} soilSensorData - Data frsture sensor.
      * @param {object} weatherConditions - Currconditions.
      * @param {object} soilParameters - Paramehe soil type.
      * @param {object} cropParameters - Parameterop.
      * @param {number} fieldArea - The area of theeters.
      * @return {object} An objecttal water to release.
      **/
      function calculateTotalWaterToRelease(soilSensorData, weatherConditions,
          soilParameters, cropParameters, fieldArea) {
        const temperature = weatherConditions.temperatureCelsius;
        // Extract weather variables
        const relativeHumidity = weatherConditions.relativeHumidityPercent;
        const windSpeed = weatherConditions.windSpeedMetersPerSecond;
        const pressure = weatherConditions.atmosphericPressureKPa;
        const netRadiation = weatherConditions.netRadiationMJPerSquareMeter;
        const effectiveRainfall = weatherConditions.effectiveRainfallMM || 0;
        const soilHeatFlux = 0;
        // Extract soil variables
        const fieldCapacity = soilParameters.fieldCapacityFraction;
        const currentSoilMoisture = soilSensorData.currentSoilMoistureFraction;
        const rootZoneDepth = soilParameters.rootZoneDepthMM;
        // Extract crop variable
        const cropCoefficient = cropParameters.cropCoefficient;
        // --- Calculations ---
        const svp = 0.6108 * Math.exp((17.27 * temperature) /
        (temperature + 237.3));
        const avp = svp * (relativeHumidity / 100);
        const delta = (4098 * svp) / Math.pow(temperature + 237.3, 2);
        const gamma = 0.000665 * pressure;
        const et0 = (0.408 * delta * (netRadiation - soilHeatFlux) +
        gamma * (900 / (temperature + 273)) * windSpeed * (svp - avp)) /
        (delta + gamma * (1 + 0.34 * windSpeed));
        const etc = cropCoefficient * et0;
        const smd = (fieldCapacity - currentSoilMoisture) * rootZoneDepth;
        const irrigationRequirementPerSquareMeter =
        etc - effectiveRainfall + smd;
        const totalWaterToReleaseLiters =
        irrigationRequirementPerSquareMeter * fieldArea;
        return {
          irrigationPerSquareMeter:
          irrigationRequirementPerSquareMeter.toFixed(2),
          totalWaterToReleaseLiters: totalWaterToReleaseLiters.toFixed(2),
        };
      }
      // Call the calculation function
      const waterCalculation = calculateTotalWaterToRelease(
          soilSensorData,
          weatherConditions,
          soilParameters,
          cropParameters,
          fieldAreaSquareMeters,
      );
      console.log("Irrigation Calculation Result:", waterCalculation);
      const db = getDatabase();
      const irrigationRecommendationRef = db.ref("irrigationRecommendation");
      await irrigationRecommendationRef.set(waterCalculation);
      return;
    },
);
