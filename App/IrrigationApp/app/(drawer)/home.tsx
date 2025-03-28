import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, Image, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { auth, db } from '../../constants/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [fields, setFields] = useState([]);
  const userId = auth.currentUser?.uid;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFields = useCallback(async () => {
    setIsRefreshing(true);
    if (userId) {
      const fieldsCollectionRef = collection(db, 'users', userId, 'fields');
      try {
        const querySnapshot = await getDocs(fieldsCollectionRef);
        const fieldList = [];

        for (const docSnapshot of querySnapshot.docs) {
          const fieldData = docSnapshot.data();
          const fieldId = docSnapshot.id;
          fieldList.push({ id: fieldId, ...fieldData });
        }

        setFields(fieldList);
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setIsRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadFields();
      return () => {};
    }, [loadFields])
  );

  const onRefresh = useCallback(() => {
    loadFields();
  }, [loadFields]);

  const handleDeleteField = async (fieldId) => {
    Alert.alert(
      'Delete Field',
      'Are you sure you want to delete this field?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (userId) {
              try {
                const fieldDocRef = doc(db, 'users', userId, 'fields', fieldId);
                await deleteDoc(fieldDocRef);
                setFields(currentFields => currentFields.filter(field => field.id !== fieldId));
              } catch (error) {
                console.error('Error deleting field:', error);
                Alert.alert('Error', 'Failed to delete field. Please try again.');
              }
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteField(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity style={styles.fieldCard} onPress={() => router.push(`/fieldInfo/${item.id}`)}>
        <Image source={item.image ? { uri: item.image } : require('../../assets/images/img.jpg')} style={styles.fieldImage} />
        <View style={styles.cardContent}>
          <Text style={styles.fieldTitle}>{item.FieldName || 'Untitled Field'}</Text>
          <Text style={styles.fieldDescription}>{item.Location || ' '}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/background.png')} style={styles.backgroundImage} />
      <FlatList
        data={fields}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No fields added yet.</Text>}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(drawer)/addField')}>
        <Text style={styles.addButtonText}>+ Add Field</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  fieldImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 10,
  },
  fieldTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  fieldDescription: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: width * 0.25,
    right: width * 0.25,
    backgroundColor: '#2C7865',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#BF3131',
    borderRadius: 8,
    marginTop: 10,
  },
});
