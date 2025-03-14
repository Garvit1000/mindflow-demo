import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const PROFILE_FIELDS = [
  { label: 'Name', key: 'name', icon: 'account', keyboardType: 'default', required: true },
  { label: 'Gender', key: 'gender', icon: 'gender-male-female', keyboardType: 'default' },
  { label: 'Birthday', key: 'birthday', icon: 'calendar', keyboardType: 'default' },
  { label: 'Email', key: 'email', icon: 'email', keyboardType: 'email-address', required: true },
  { label: 'Phone', key: 'phone', icon: 'phone', keyboardType: 'phone-pad' },
];

export default function ProfileScreen({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const scrollY = new Animated.Value(0);

  const { user, updateUserData, signOut } = useAuth();

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.dateOfBirth) {
          data.dateOfBirth = data.dateOfBirth.toDate();
        }
        setUserData(data);
        setEditedData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    }
  };

  const validateForm = () => {
    const errors = {};
    PROFILE_FIELDS.forEach(field => {
      if (field.required && !editedData[field.key]) {
        errors[field.key] = `${field.label} is required`;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }
    setLoading(true);
    try {
      await updateUserData(user.uid, { ...editedData, lastUpdated: new Date() });
      setUserData(editedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, index) => {
    const { label, key, icon, keyboardType } = field;
    return (
      <Animatable.View
        key={key}
        animation="fadeInUp"
        delay={index * 100}
        style={styles.fieldContainer}
      >
        <View style={styles.labelContainer}>
          <Icon name={icon} size={20} color="#555" style={styles.fieldIcon} />
          <Text style={styles.label}>{label}</Text>
        </View>
        {isEditing ? (
          <TextInput
            style={[
              styles.input,
              validationErrors[key] && styles.inputError
            ]}
            value={String(editedData[key] || '')}
            onChangeText={(text) => {
              setEditedData(prev => ({ ...prev, [key]: text }));
              if (validationErrors[key]) {
                setValidationErrors(prev => ({ ...prev, [key]: null }));
              }
            }}
            keyboardType={keyboardType}
            placeholderTextColor="#999"
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <Text style={styles.value}>{editedData[key] || 'Not set'}</Text>
        )}
        {validationErrors[key] && (
          <Text style={styles.errorText}>{validationErrors[key]}</Text>
        )}
      </Animatable.View>
    );
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Icon name={isEditing ? "close" : "pencil"} size={24} color="#333" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animatable.View animation="fadeIn" style={styles.profileSection}>
          <LinearGradient
            colors={['#a8c0ff', '#3f2b96']}
            style={styles.avatarContainer}
          >
            <Icon name="account" size={60} color="#fff" />
          </LinearGradient>
          <Animatable.Text animation="fadeInUp" style={styles.email}>
            {user.email}
          </Animatable.Text>
        </Animatable.View>

        <View style={styles.cardContainer}>
          {PROFILE_FIELDS.map((field, index) => renderField(field, index))}
        </View>

        {isEditing && (
          <Animatable.View animation="fadeInUp">
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </Animatable.View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: signOut, style: 'destructive' }
              ]
            );
          }}
        >
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={editedData.dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setEditedData(prev => ({
                ...prev,
                dateOfBirth: selectedDate
              }));
            }
          }}
          maximumDate={new Date()}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    padding: 16,
    margin: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b',
    padding: 16,
    margin: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c5ce7',
    fontSize: 16,
  },
});