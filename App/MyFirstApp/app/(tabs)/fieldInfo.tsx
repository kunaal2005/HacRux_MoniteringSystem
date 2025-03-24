import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker"; // ✅ Picker for dropdowns
import { useRouter, useLocalSearchParams } from "expo-router"; 

export default function FieldInfo() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams(); // ✅ Get field details from navigation params

  // ✅ State variables for dropdowns and input field
  const [cropType, setCropType] = useState("Wheat");
  const [soilType, setSoilType] = useState("Loamy");
  const [growthLevel, setGrowthLevel] = useState("Early Stage");
  const [fieldArea, setFieldArea] = useState("");

  // ✅ Constant message (Later fetch from Firebase)
  const waterRequirementMessage = `💧 Water Supply Needed: 30 liters per square meter`;

  const handleSubmit = () => {
    console.log("Field Updated:", { cropType, soilType, growthLevel, fieldArea });
    alert("Field Information Updated Successfully!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Field Title at the Top */}
      <Text style={styles.header}>Field Information - {title}</Text>

      {/* ✅ Water Requirement Message */}
      <View style={styles.waterInfo}>
        <Text style={styles.waterText}>{waterRequirementMessage}</Text>
      </View>

      <Text style={styles.subHeader}>Modify Field Details (if required)</Text>

      {/* ✅ Field Area Input */}
      <Text style={styles.label}>Enter Field Area (in acres):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 5 acres"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={fieldArea}
        onChangeText={setFieldArea}
      />

      {/* ✅ Crop Type Dropdown */}
      <Text style={styles.label}>Select Crop Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={cropType}
          dropdownIconColor="#fff" // ✅ White dropdown arrow
          onValueChange={(itemValue) => setCropType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Wheat" value="Wheat" />
          <Picker.Item label="Rice" value="Rice" />
          <Picker.Item label="Corn" value="Corn" />
          <Picker.Item label="Soybean" value="Soybean" />
        </Picker>
      </View>

      {/* ✅ Soil Type Dropdown */}
      <Text style={styles.label}>Select Soil Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={soilType}
          dropdownIconColor="#fff"
          onValueChange={(itemValue) => setSoilType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Loamy" value="Loamy" />
          <Picker.Item label="Clayey" value="Clayey" />
          <Picker.Item label="Sandy" value="Sandy" />
          <Picker.Item label="Peaty" value="Peaty" />
        </Picker>
      </View>

      {/* ✅ Growth Level Dropdown */}
      <Text style={styles.label}>Select Growth Level:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={growthLevel}
          dropdownIconColor="#fff"
          onValueChange={(itemValue) => setGrowthLevel(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Early Stage" value="Early Stage" />
          <Picker.Item label="Vegetative Stage" value="Vegetative Stage" />
          <Picker.Item label="Flowering Stage" value="Flowering Stage" />
          <Picker.Item label="Maturity Stage" value="Maturity Stage" />
        </Picker>
      </View>

      {/* ✅ Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Update Field Information</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#000" }, // ✅ Black Background
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, marginTop: 50, textAlign: "center", color: "#fff" }, // ✅ White Title
  subHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#ddd", textAlign: "center" }, // ✅ Light Grey Subheader
  label: { fontSize: 16, fontWeight: "bold", marginTop: 15, color: "#ddd" }, // ✅ Light Grey Labels
  pickerContainer: { backgroundColor: "#222", borderRadius: 10, paddingHorizontal: 10, marginTop: 5 },
  picker: { color: "#fff" }, // ✅ White text inside dropdown
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#888", // ✅ Grey Border
    color: "#fff", // ✅ White Text
  },
  waterInfo: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#222", // ✅ Dark background for contrast
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#29b6f6", // ✅ Blue Accent
    alignItems: "center",
  },
  waterText: { fontSize: 18, color: "#29b6f6", fontWeight: "bold" }, // ✅ Blue text for visibility
  button: { marginTop: 20, backgroundColor: "#29b6f6", padding: 15, borderRadius: 10, alignItems: "center",marginBottom:100 }, // ✅ Blue Button
  buttonText: { color: "#000", fontSize: 18, fontWeight: "bold" }, // ✅ Black Text for Contrast
});

