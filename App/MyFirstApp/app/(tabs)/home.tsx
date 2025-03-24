import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

// Dummy user data (Replace this with Firebase authentication)
const loggedInUser = "farmer1@gmail.com"; // Assume this is fetched dynamically

// All fields data (Modify to fetch from Firebase later)
const allFields = [
    { id: "1", title: "Field 1", subtitle: "Wheat", location: "Village A", users: ["farmer1@gmail.com"] },
    { id: "2", title: "Field 2", subtitle: "Rice", location: "Village B", users: ["farmer1@gmail.com", "farmer2@gmail.com"] },
    { id: "3", title: "Field 3", subtitle: "Corn", location: "Village C", users: ["farmer3@gmail.com"] },
    { id: "4", title: "Field 4", subtitle: "Soybean", location: "Village D", users: ["farmer1@gmail.com"] },
];

export default function HomeScreen() {
  const router = useRouter();
  const [fields, setFields] = useState([]);

  useEffect(() => {
    // Filter fields based on logged-in farmer
    const userFields = allFields.filter(field => field.users.includes(loggedInUser));
    setFields(userFields);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Fields</Text>
      </View>

      {/* Field List */}
      <FlatList
        data={fields}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/fieldInfo?id=${item.id}&title=${encodeURIComponent(item.title)}`)}
          >
            <Image source={require("../../assets/images/Field.jpg")} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.fieldTitle}>{item.title}</Text>
              <Text style={styles.fieldSubtitle}>🌱 Crop: {item.subtitle}</Text>
              <Text style={styles.location}>📍 {item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "#1E1E1E",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    margin: 10,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 100,
  },
  cardContent: {
    padding: 15,
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  fieldSubtitle: {
    fontSize: 14,
    color: "#bbb",
  },
  location: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 5,
  },
});
