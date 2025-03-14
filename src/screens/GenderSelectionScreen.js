import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Animated, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const GenderOption = ({ gender, icon, isSelected, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(gender)}
    style={[styles.tile, isSelected && styles.selectedTile]}
  >
    <LinearGradient
      colors={isSelected ? ['#5352ed', '#4834d4'] : ['#fff', '#f7f7f7']}
      style={styles.tileGradient}
    >
      <Icon
        name={icon}
        size={40}
        color={isSelected ? '#fff' : '#5352ed'}
        style={styles.genderIcon}
      />
      <Text style={[styles.tileText, isSelected && styles.selectedText]}>
        {gender}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function GenderSelectionScreen({ navigation }) {
  const [selectedGender, setSelectedGender] = useState(null);
  const { user, updateUserData } = useAuth();

  const handleContinue = async () => {
    if (selectedGender) {
      try {
        await updateUserData(user.uid, {
          gender: selectedGender,
          updatedAt: new Date(),
        });
        navigation.navigate('UserInfo');
      } catch (error) {
        Alert.alert('Error', 'Failed to save gender selection');
      }
    } else {
      Alert.alert('Error', 'Please select a gender to continue');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/gradientbg.png')}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Gender</Text>
        <Text style={styles.subtitle}>This helps us personalize your experience</Text>
        
        <View style={styles.tilesContainer}>
          <GenderOption
            gender="Male"
            icon="gender-male"
            isSelected={selectedGender === 'Male'}
            onSelect={setSelectedGender}
          />
          <GenderOption
            gender="Female"
            icon="gender-female"
            isSelected={selectedGender === 'Female'}
            onSelect={setSelectedGender}
          />
          <GenderOption
            gender="Others"
            icon="gender-non-binary"
            isSelected={selectedGender === 'Others'}
            onSelect={setSelectedGender}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !selectedGender && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedGender}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 40,
  },
  tile: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectedTile: {
    transform: [{ scale: 1.05 }],
  },
  genderIcon: {
    marginBottom: 10,
  },
  tileText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#5352ed',
    padding: 18,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#5352ed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
