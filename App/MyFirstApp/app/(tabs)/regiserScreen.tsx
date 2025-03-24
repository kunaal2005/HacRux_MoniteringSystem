import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { db, collection, addDoc } from "../../constants/firebaseConfig";

export default function RegisterScreen() {
  const [sensorNumber, setSensorNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!sensorNumber || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        sensorNumber,
        email,
        password, // ⚠️ Ideally, use Firebase Authentication and hash the password
      });

      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("../index") },
      ]);
    } catch (error) {
      console.error("Error adding user to Firebase:", error);
      Alert.alert("Error", "Failed to create an account.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Sensor Number"
        placeholderTextColor="#aaa"
        value={sensorNumber}
        onChangeText={setSensorNumber}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginRedirect} onPress={() => router.replace("../index")}>
        <Text style={styles.loginRedirectText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
  input: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { width: "100%", height: 50, backgroundColor: "#28a745", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginRedirect: { marginTop: 15 },
  loginRedirectText: { color: "#007bff", fontSize: 16 },
});
