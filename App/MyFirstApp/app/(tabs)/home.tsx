import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../constants/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function HomeScreen() {
  const router = useRouter();
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "fields"));
        const fieldData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFields([...fieldData, { id: "add-button", isAddButton: true }]);
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };
    fetchFields();
  }, []);

  const handleDeleteField = async (fieldId) => {
    Alert.alert("Delete Field", "Are you sure you want to delete this field?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteDoc(doc(db, "fields", fieldId));
            setFields(fields.filter(field => field.id !== fieldId));
            Alert.alert("Success", "Field deleted successfully!");
          } catch (error) {
            console.error("Error deleting field:", error);
            Alert.alert("Error", "Failed to delete field.");
          }
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Fields</Text>
      </View>

      <FlatList
        data={fields}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.isAddButton) {
            return (
              <TouchableOpacity style={styles.addCard} onPress={() => router.push("/(tabs)/AddFieldScreen")}>
                <Ionicons name="add" size={50} color="#aaa" />
              </TouchableOpacity>
            );
          }
          return (
            <View style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/fieldInfo?id=${item.id}`)}
              >
                <Image source={require("../../assets/images/Field.jpg")} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.fieldTitle}>{item.title}</Text>
                  <Text style={styles.fieldSubtitle}>🌱 Crop: {item.crop}</Text>
                  <Text style={styles.location}>📍 {item.location}</Text>
                </View>
              </TouchableOpacity>

              {/* Three Dots Menu for Delete */}
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteField(item.id)}>
                <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { marginTop: 40, padding: 20, backgroundColor: "#1E1E1E" },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  cardContainer: { flexDirection: "row", alignItems: "center" },
  card: { backgroundColor: "#1E1E1E", borderRadius: 10, margin: 10, overflow: "hidden", flex: 1 },
  cardImage: { width: "100%", height: 100 },
  cardContent: { padding: 15 },
  fieldTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  fieldSubtitle: { fontSize: 14, color: "#bbb" },
  location: { fontSize: 14, color: "#bbb", marginTop: 5 },
  deleteButton: { padding: 10, marginRight: 10 },
  addCard: { backgroundColor: "#1E1E1E", borderRadius: 10, margin: 10, marginBottom: 100, height: 150, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#555", borderStyle: "dashed" },
});
