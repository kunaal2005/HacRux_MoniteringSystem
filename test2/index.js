const fs = require('fs');

// Read kcValue.json file
const rawData = fs.readFileSync('kcValue.json');
const userRawData = fs.readFileSync('UserSelection.json'); // Updated filename
const soilTypesRawData = fs.readFileSync('soilTypes.json'); // Read soilTypes.json file

const kcData = JSON.parse(rawData);
const userSelection = JSON.parse(userRawData);
const soilTypesData = JSON.parse(soilTypesRawData); // Parse soilTypes.json data

// Soil sensor data (constant)
const apiValue = userSelection.user_selection.api_value; // Fetch API value from UserSelection.json
const soilSensorData = {
    currentSoilMoistureFraction: (1024 - apiValue) / 1024 // Convert API value to decimal fraction
};

// Weather conditions data (constant)
const weatherConditions = {
    temperatureCelsius: 25, // Example temperature value
    relativeHumidityPercent: 60, // Example relative humidity value
    windSpeedMetersPerSecond: 3, //Done
    atmosphericPressureKPa: 101, //Done
    netRadiationMJPerSquareMeter: 20, //Done
    effectiveRainfallMM: 5  //Done
};

// Calculate relative humidity percentage
const userHumidity = userSelection.user_selection.humidity; // Fetch humidity value from UserSelection.json
const temperatureCelsius = weatherConditions.temperatureCelsius;

// Calculate saturation vapor pressure (es) in kPa using temperature
const saturationVaporPressure = 0.6108 * Math.exp((17.27 * temperatureCelsius) / (temperatureCelsius + 237.3));

// Calculate actual vapor pressure (ea) based on user humidity
const actualVaporPressure = userHumidity / 100 * saturationVaporPressure;

// Calculate relative humidity percentage
const relativeHumidityPercent = (actualVaporPressure / saturationVaporPressure) * 100;

// Update weather conditions with calculated relative humidity
weatherConditions.relativeHumidityPercent = relativeHumidityPercent;

// Dynamically fetch soil parameters based on user selection
const selectedSoilType = userSelection.user_selection.soil_type;
const soilParameters = soilTypesData[selectedSoilType] || {
    fieldCapacityFraction: 0.35,
    wiltingPointFraction: 0.15,
    rootZoneDepthMM: 500
};

// **Dynamically Fetching Crop Coefficient from JSON**
const selectedCrop = userSelection.user_selection.crop;
const selectedGrowthStage = userSelection.user_selection.growth_stage;
const cropCoefficient = kcData.crop_coefficients[selectedCrop]?.[selectedGrowthStage] || 1.0; 

// Crop parameters (updated dynamically)
const cropParameters = {
    cropCoefficient: cropCoefficient
};

// Field area (dynamic)
const fieldAreaSquareMeters = userSelection.user_selection.Area;

function calculateTotalWaterToRelease(soilSensorData, weatherConditions, soilParameters, cropParameters, fieldArea) {
    // Extract weather variables
    const temperature = weatherConditions.temperatureCelsius;            // °C
    const relativeHumidity = weatherConditions.relativeHumidityPercent;    // in %
    const windSpeed = weatherConditions.windSpeedMetersPerSecond;          // m/s
    const pressure = weatherConditions.atmosphericPressureKPa;             // kPa
    const netRadiation = weatherConditions.netRadiationMJPerSquareMeter;     // MJ/m²/day
    const effectiveRainfall = weatherConditions.effectiveRainfallMM || 0;    // mm
    const soilHeatFlux = 0; // Assume negligible soil heat flux

    // Extract soil variables
    const fieldCapacity = soilParameters.fieldCapacityFraction;
    const currentSoilMoisture = soilSensorData.currentSoilMoistureFraction;
    const rootZoneDepth = soilParameters.rootZoneDepthMM; // in mm

    // Extract crop variable
    const cropCoefficient = cropParameters.cropCoefficient;

    // --- Calculations ---

    // Calculate saturation vapor pressure (es) in kPa using temperature
    const saturationVaporPressure = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));

    // Calculate actual vapor pressure (ea) based on relative humidity
    const actualVaporPressure = saturationVaporPressure * (relativeHumidity / 100);

    // Calculate slope of vapor pressure curve (Delta) in kPa/°C
    const vaporPressureSlope = (4098 * saturationVaporPressure) / ((temperature + 237.3) ** 2);

    // Calculate psychrometric constant (gamma) in kPa/°C
    const psychrometricConstant = 0.000665 * pressure;

    // Calculate reference evapotranspiration (ET₀) using FAO Penman-Monteith equation (mm/day)
    const referenceEvapotranspiration = (
        (0.408 * vaporPressureSlope * (netRadiation - soilHeatFlux) +
        psychrometricConstant * (900 / (temperature + 273)) * windSpeed *
        (saturationVaporPressure - actualVaporPressure)) /
        (vaporPressureSlope + psychrometricConstant * (1 + 0.34 * windSpeed))
    );

    // Calculate crop evapotranspiration (ETc) in mm/day
    const cropEvapotranspiration = cropCoefficient * referenceEvapotranspiration;

    // Calculate soil moisture deficit (SMD) in mm
    // (The water needed to raise the current soil moisture to field capacity)
    const soilMoistureDeficit = (fieldCapacity - currentSoilMoisture) * rootZoneDepth;

    // Calculate irrigation requirement per m² (in mm)
    // Combines crop water demand, rainfall, and soil moisture deficit
    const irrigationRequirementPerSquareMeter = cropEvapotranspiration - effectiveRainfall + soilMoistureDeficit;

    // Convert the irrigation requirement to total water in liters for the field
    // (1 mm over 1 m² equals 1 liter)
    const totalWaterToReleaseLiters = irrigationRequirementPerSquareMeter * fieldArea;

    return {
        irrigationPerSquareMeter: irrigationRequirementPerSquareMeter.toFixed(2), // in mm
        totalWaterToReleaseLiters: totalWaterToReleaseLiters.toFixed(2)           // in liters
    };
}

// Calculate and print the water required for irrigation
const waterCalculation = calculateTotalWaterToRelease(
    soilSensorData,
    weatherConditions,
    soilParameters,
    cropParameters,
    fieldAreaSquareMeters
);
console.log(`Irrigation water required per m²: ${waterCalculation.irrigationPerSquareMeter} mm`);
console.log(`Total water to release for the field: ${waterCalculation.totalWaterToReleaseLiters} liters`);
