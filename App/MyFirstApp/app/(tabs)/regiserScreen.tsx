import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { db, collection, addDoc } from "../../constants/firebaseConfig"; // Keep these for Firestore later
import { auth, createUserWithEmailAndPassword } from "../../constants/firebaseConfig"; // Import auth and the function

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
  
    try {
      // Create user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Now that the user is created with Firebase Auth,
      // you might want to store additional user information (like sensorNumber) in Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid, // Store the Firebase Auth UID
        email,
        // Do NOT store the password in Firestore
      });
  
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("../index") },
      ]);
    } catch (error) {
      console.error("Error creating user with Firebase Authentication:", error);
      let errorMessage = "Failed to create an account.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      Alert.alert("Error", errorMessage);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

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
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
  input: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { width: "100%", height: 50, backgroundColor: "#28a745", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginRedirect: { marginTop: 15 },
  loginRedirectText: { color: "#007bff", fontSize: 16 },
});
