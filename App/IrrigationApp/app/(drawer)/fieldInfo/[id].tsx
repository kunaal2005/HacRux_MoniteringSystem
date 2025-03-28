import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { auth, db } from '../../../constants/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function FieldInfoScreen() {
  const { id } = useLocalSearchParams();
  const userId = auth.currentUser?.uid;
  const [fieldData, setFieldData] = useState({});
  const [recommendationInfo, setRecommendationInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    if (!userId || !id) return;
    try {
      const fieldInfoRef = doc(db, 'users', userId, 'fields', id, 'FieldInfo', 'Data');
      const fieldInfoSnap = await getDoc(fieldInfoRef);
      setFieldData(fieldInfoSnap.exists() ? fieldInfoSnap.data() : {});

      const recommendationRef = doc(db, 'users', userId, 'fields', id, 'RecommendationInfo', 'Data');
      const recommendationSnap = await getDoc(recommendationRef);
      setRecommendationInfo(recommendationSnap.exists() ? recommendationSnap.data() : null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {};
    }, [loadData, id])
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image source={require('../../../assets/images/background.png')} style={styles.backgroundImage} />
        <View style={styles.overlay}>
          {loading ? (
            <Text style={styles.loadingText}>Loading field data...</Text>
          ) : Object.keys(fieldData).length === 0 ? (
            <Text style={styles.noData}>No data available for this field.</Text>
          ) : (
            <>
              <Text style={styles.title}>{fieldData.FieldName || id || 'Untitled Field'}</Text>
              <View style={styles.cardContainer}>
                <Text style={styles.infoText}>📍 Location: {fieldData.Location || 'N/A'}</Text>
                <Text style={styles.infoText}>🌱 Crop Name: {fieldData.CropName || 'N/A'}</Text>
                <Text style={styles.infoText}>🗓 Month of Sowing: {fieldData.MonthOfSowing || 'N/A'}</Text>
                <Text style={styles.infoText}>🧪 Soil Type: {fieldData.SoilType || 'N/A'}</Text>
                <Text style={styles.infoText}>📏 Area: {fieldData.Area || 'N/A'} acres</Text>
                <Text style={styles.infoText}>🕒 Date of Creation: {fieldData.DateOfCreation || 'N/A'}</Text>
              </View>
              {recommendationInfo ? (
                <View style={styles.cardContainer}>
                  <Text style={styles.sectionHeader}>💧 Water Requirement</Text>
                  {Object.entries(recommendationInfo).map(([key, value]) => (
                    <Text key={key} style={styles.infoText}>{key}: {value}</Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.noData}>No water recommendation available.</Text>
              )}
            </>
          )}
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
  cardContainer: { padding: 15, backgroundColor: '#FDF5E6', borderRadius: 8, marginBottom: 20 },
  infoText: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 8 },
  sectionHeader: { fontSize: 22, fontWeight: 'bold', color: '#000000', marginBottom: 10, textAlign: 'center' },
  noData: { fontSize: 18, fontWeight: 'bold', color: 'gray', textAlign: 'center', marginTop: 10 },
  loadingText: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 20 },
});