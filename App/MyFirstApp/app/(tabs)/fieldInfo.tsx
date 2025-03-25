import React, { useState, useEffect} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker"; // ✅ Picker for dropdowns
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc} from "@firebase/firestore"; // Import Firestore functions 
import { auth, db, rtdb, ref, onValue, collection, addDoc } from "../../constants/firebaseConfig";

export default function FieldInfo() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = auth.currentUser;

  // const { id, title } = useLocalSearchParams(); // ✅ Get field details from navigation params

  // ✅ State variables for dropdowns and input field
  const [uniqueSensorId, setUniqueSensorId] = useState(""); // State for UniqueSensorId
  const [cropType, setCropType] = useState("Wheat");
  const [soilType, setSoilType] = useState("Loamy");
  const [growthLevel, setGrowthLevel] = useState("Early Stage");
  const [fieldArea, setFieldArea] = useState("");
  const [waterRequirementMessage, setWaterRequirementMessage] = useState(""); // State for dynamic message
  const [isEditing, setIsEditing] = useState(false);
  const [fieldTitle, setFieldTitle] = useState("Add New Field");

  useEffect(() => {
    const waterRef = ref(rtdb, '/irrigationRecommendation/totalWaterToReleaseLiters');
    const unsubscribeWater = onValue(waterRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setWaterRequirementMessage(`💧 Water Supply Needed: ${data} liters per square meter`);
      } else {
        setWaterRequirementMessage("💧 Water Supply Needed: Information not available.");
      }
    }, (error) => {
      console.error("Error fetching water requirement:", error);
      Alert.alert("Error", "Failed to fetch water requirement information.");
    });
    return () => unsubscribeWater();
  },);
  useEffect(() => {
    if (id && user) {
      setIsEditing(true);
      setFieldTitle("Edit Field Information");
      const fieldDocRef = doc(db, "users", user.uid, "fields", id as string);
      getDoc(fieldDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUniqueSensorId(data.UniqueSensorId || "");
            setCropType(data.cropName || "Wheat");
            setSoilType(data.SoilType || "Loamy");
            setGrowthLevel(data.cropGrowthLevel || "Early Stage");
            setFieldArea(String(data.fieldArea) || "");
          } else {
            Alert.alert("Error", "Field not found.");
            router.push("/home");
          }
        })
        .catch((error) => {
          console.error("Error fetching field data:", error);
          Alert.alert("Error", "Failed to fetch field information.");
        });
    } else {
      setIsEditing(false);
      setFieldTitle("Add New Field");
      // Reset form fields for adding a new field if needed
      setUniqueSensorId("");
      setCropType("Wheat");
      setSoilType("Loamy");
      setGrowthLevel("Early Stage");
      setFieldArea("");
    }
  }, [id, user, router]);

    
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    if (!uniqueSensorId || !fieldArea) {
      Alert.alert("Error", "Please enter the Unique Sensor ID and Field Area.");
      return;
    }

    try {
      const fieldData = {
        UniqueSensorId: uniqueSensorId,
        location: { latitude: 0, longitude: 0 }, // You'll likely want to get actual location
        fieldArea: parseFloat(fieldArea),
        cropName: cropType,
        cropGrowthLevel: growthLevel,
        SoilType: soilType,
      };

      if (isEditing && id) {
        const fieldDocRef = doc(db, "users", user.uid, "fields", id as string);
        await updateDoc(fieldDocRef, fieldData);
        Alert.alert("Success", "Field Information Updated Successfully!", [
          { text: "OK", onPress: () => router.push("/home") },
        ]);
      } else {
        const fieldsCollectionRef = collection(db, "users", user.uid, "fields");
        await addDoc(fieldsCollectionRef, fieldData);
        Alert.alert("Success", "Field Information Added Successfully!", [
          { text: "OK", onPress: () => router.push("/home") },
        ]);
      }
    } catch (error) {
      console.error("Error saving field to Firestore:", error);
      Alert.alert("Error", `Failed to ${isEditing ? 'update' : 'add'} field information.`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Dynamic Field Title at the Top */}
      <Text style={styles.header}>{fieldTitle}</Text>

      {/* Water Requirement Message */}
      <View style={styles.waterInfo}>
        <Text style={styles.waterText}>{waterRequirementMessage}</Text>
      </View>

      <Text style={styles.subHeader}>Enter Field Details</Text>

      {/* Unique Sensor ID Input */}
      <Text style={styles.label}>Unique Sensor ID:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Sensor ID"
        placeholderTextColor="#aaa"
        value={uniqueSensorId}
        onChangeText={setUniqueSensorId}
      />

      {/* Field Area Input */}
      <Text style={styles.label}>Enter Field Area (in acres):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 5 acres"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={fieldArea}
        onChangeText={setFieldArea}
      />

      {/* Crop Type Dropdown */}
      <Text style={styles.label}>Select Crop Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={cropType}
          dropdownIconColor="#fff"
          onValueChange={(itemValue) => setCropType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Wheat" value="Wheat" />
          <Picker.Item label="Rice" value="Rice" />
          <Picker.Item label="Corn" value="Corn" />
          <Picker.Item label="Soybean" value="Soybean" />
        </Picker>
      </View>

      {/* Soil Type Dropdown */}
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

      {/* Growth Level Dropdown */}
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

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isEditing ? "Update Field Information" : "Add Field Information"}</Text>
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

