import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, signInWithEmailAndPassword } from "../../constants/firebaseConfig"; // Import auth and signInWithEmailAndPassword

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Dummy user data (Replace with Firebase authentication)
  // const users = {
  //   "farmer1@gmail.com": "1234",
  //   "farmer2@gmail.com": "5678",
  //   "farmer3@gmail.com": "abcd",
  // };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    try {
      // Sign in with email and password using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await AsyncStorage.setItem("loggedInUser", email);
      Alert.alert("Success", "Login Successful!", [{ text: "OK", onPress: () => router.replace("/home") }]);
    } catch (error) {
      console.error("Error logging in with Firebase Authentication:", error);
      let errorMessage = "Login failed. Please try again.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'There is no user record corresponding to this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Wrong password. Please try again.';
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/regiserScreen")}>
        <Text style={styles.registerButtonText}>Create New Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
  input: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { width: "100%", height: 50, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerButton: { marginTop: 15 },
  registerButtonText: { color: "#007bff", fontSize: 16 },
});
