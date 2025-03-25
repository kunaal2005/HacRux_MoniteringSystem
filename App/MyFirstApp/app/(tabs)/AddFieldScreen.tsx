import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { db, collection, addDoc, getDocs } from "../../constants/firebaseConfig"; // Firebase functions

export default function AddFieldScreen() {
  const router = useRouter();
  const [fieldName, setFieldName] = useState("");
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState("");
  const [fieldCount, setFieldCount] = useState(1); // Count fields for default naming

  useEffect(() => {
    // Fetch existing fields count to name the new field correctly
    const fetchFieldCount = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "fields"));
        setFieldCount(querySnapshot.size + 1); // Field count + 1 for new field
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };
    fetchFieldCount();
  }, []);

  const handleAddField = async () => {
    if (!location || !crop) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const newField = {
      title: fieldName || `Field ${fieldCount}`,
      location,
      crop,
      users: ["farmer1@gmail.com"], // Modify this based on logged-in user
    };

    try {
      await addDoc(collection(db, "fields"), newField);
      Alert.alert("Success", "Field added successfully!", [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);
    } catch (error) {
      console.error("Error adding field:", error);
      Alert.alert("Error", "Failed to add field.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Field</Text>

      <TextInput
        style={styles.input}
        placeholder={`Field ${fieldCount}`}
        placeholderTextColor="#aaa"
        value={fieldName}
        onChangeText={setFieldName}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor="#aaa"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Crop Type"
        placeholderTextColor="#aaa"
        value={crop}
        onChangeText={setCrop}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddField}>
        <Text style={styles.buttonText}>Add Field</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },
  input: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { width: "100%", height: 50, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
