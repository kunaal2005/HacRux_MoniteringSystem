import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../constants/firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AddFieldScreen() {
  const [fieldName, setFieldName] = useState('');
  const [location, setLocation] = useState('');
  const [monthOfSowing, setMonthOfSowing] = useState('');
  const [cropName, setCropName] = useState('');
  const [soilType, setSoilType] = useState('');
  const [area, setArea] = useState('');
  const [dateOfCreation, setDateOfCreation] = useState('');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const router = useRouter();

  const handleSaveField = async () => {
    if (!fieldName || !location || !monthOfSowing || !cropName || !soilType || !area || !dateOfCreation) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const fieldsCollectionRef = collection(db, 'users', userId, 'fields');
        const fieldNameQuery = query(fieldsCollectionRef, where('FieldName', '==', fieldName));
        const fieldNameQuerySnapshot = await getDocs(fieldNameQuery);

        if (!fieldNameQuerySnapshot.empty) {
          Alert.alert('Error', 'A field with that name already exists. Please choose a different name.');
          return;
        }

        const newFieldDocRef = doc(fieldsCollectionRef, fieldName);
        await setDoc(newFieldDocRef, { FieldName: fieldName });

        const fieldInfoDataRef = doc(db, 'users', userId, 'fields', fieldName, 'FieldInfo', 'Data');
        await setDoc(fieldInfoDataRef, {
          Location: location,
          MonthOfSowing: monthOfSowing,
          CropName: cropName,
          SoilType: soilType,
          Area: parseFloat(area),
          DateOfCreation: dateOfCreation,
        });

        Alert.alert('Success', 'Field added successfully!', [{ text: 'OK', onPress: () => router.push('/home') }]);
      } else {
        Alert.alert('Error', 'User not authenticated.');
      }
    } catch (error) {
      console.error('Error adding field:', error);
      Alert.alert('Error', 'Failed to add field. Please try again.');
    }
  };

  const onDayPress = (day) => {
    setDateOfCreation(day.dateString);
    setIsCalendarVisible(false); // Close the calendar after selecting a date
  };

  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Image source={require('../../assets/images/background.png')} style={styles.backgroundImage} />
        <View style={styles.overlay}>
          <Text style={styles.title}>Add New Field</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Field Name" value={fieldName} onChangeText={setFieldName} />
            <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
            <TextInput style={styles.input} placeholder="Month of Sowing" value={monthOfSowing} onChangeText={setMonthOfSowing} />
            <TextInput style={styles.input} placeholder="Crop Name" value={cropName} onChangeText={setCropName} />
            <TextInput style={styles.input} placeholder="Soil Type" value={soilType} onChangeText={setSoilType} />
            <TextInput style={styles.input} placeholder="Area (in acres)" value={area} onChangeText={setArea} keyboardType="numeric" />
            <TouchableOpacity style={styles.datePicker} onPress={toggleCalendarVisibility}>
              <Text style={styles.dateText}>{dateOfCreation || 'Select Date of Creation'}</Text>
              <Ionicons name="calendar-outline" size={24} color="#2C7865" style={styles.calendarIcon} />
            </TouchableOpacity>
            {isCalendarVisible && (
              <Calendar
                onDayPress={onDayPress}
                markedDates={dateOfCreation ? { [dateOfCreation]: { selected: true, marked: true, selectedColor: '#2C7865' } } : {}}
              />
            )}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleSaveField}>
            <Text style={styles.addButtonText}>Save Field</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1 },
  backgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  overlay: { flex: 1, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 15, margin: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, backgroundColor: '#fff', marginBottom: 10, paddingHorizontal: 10, borderRadius: 8 },
  datePicker: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dateText: { color: '#333', fontSize: 16 },
  calendarIcon: { marginRight: 10 },
  addButton: { backgroundColor: '#2C7865', padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});