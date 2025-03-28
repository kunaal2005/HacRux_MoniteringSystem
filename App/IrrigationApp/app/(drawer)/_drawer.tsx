import React, { useState, useCallback, useEffect } from 'react';
import { auth, db, collection, getDocs } from '../../constants/firebaseConfig';
import { TouchableOpacity, Text, View, StyleSheet, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDrawerStatus } from '@react-navigation/drawer';

export default function CustomDrawerContent({ Navigation }) {
  const router = useRouter();
  const userId = auth.currentUser?.uid;
  const [fields, setFields] = useState([]);
  const drawerStatus = useDrawerStatus();

  const loadFields = useCallback(async () => {
    if (userId) {
      const fieldsCollectionRef = collection(db, 'users', userId, 'fields');
      try {
        const querySnapshot = await getDocs(fieldsCollectionRef);
        const fieldList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFields(fieldList);
      } catch (error) {
        console.error('Error fetching fields for drawer:', error);
      }
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadFields();
      return () => {};
    }, [loadFields])
  );

  useEffect(() => {
    if (drawerStatus === 'open') {
      loadFields();
    }
  }, [drawerStatus, loadFields]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderFieldItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: `/fieldInfo/${item.id}`,
          params: item,
        });
      }}
    >
      <Text style={styles.cardText}>{item.FieldName || 'Untitled Field'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Field Manual</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: 'home' })}
      >
        <Ionicons name="home-outline" size={22} color="black" style={{ marginRight: 15 }} />
        <Text style={styles.cardText}>Home Page</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 10, flex: 1 }}>
        <Text style={styles.sectionHeader}>Your Fields</Text>
        <FlatList
          data={fields}
          keyExtractor={(item) => item.id}
          renderItem={renderFieldItem}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 20 }}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="red" style={{ marginRight: 15 }} />
          <Text style={[styles.cardText, { color: 'red' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 21,
    marginLeft: 10,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF5E6',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
