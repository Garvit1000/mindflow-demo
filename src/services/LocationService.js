import * as Location from 'expo-location';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Alert, Linking, Platform } from 'react-native';

class LocationService {
  static async openSettings() {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }

  static async requestPermissions() {
    try {
      // First check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => this.openSettings() }
          ]
        );
        return false;
      }

      // Request foreground permissions
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => this.openSettings() }
          ]
        );
        return false;
      }

      // Request background permissions
      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        // Background permission denied, but we can still use foreground
        console.log('Background location permission denied');
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  static async getCurrentLocation() {
    try {
      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        throw new Error('Location services are disabled');
      }

      // Get last known location first (faster)
      let location = await Location.getLastKnownPositionAsync({
        maxAge: 60000, // Accept locations not older than 1 minute
      });

      // If no last known location, get current position
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Minimum time to wait between updates (5 seconds)
          distanceInterval: 10, // Minimum distance between updates (10 meters)
        });
      }

      if (!location) {
        throw new Error('Could not get location');
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please make sure location services are enabled and you have granted the necessary permissions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => this.openSettings() }
        ]
      );
      return null;
    }
  }

  static async startLocationTracking(userId) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // Start watching position
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 300000, // Update every 5 minutes
          distanceInterval: 100, // Or when user moves 100 meters
        },
        async (location) => {
          // Update Firebase with new location
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: location.coords.accuracy,
          };

          await this.updateUserLocation(userId, locationData);
        }
      );

      // Initial location update
      const initialLocation = await this.getCurrentLocation();
      if (initialLocation) {
        await this.updateUserLocation(userId, initialLocation);
      }

      return locationSubscription;
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }

  static async updateUserLocation(userId, location) {
    try {
      if (!location) return;

      const userDoc = doc(db, 'users', userId);
      const userData = await getDoc(userDoc);

      if (userData.exists()) {
        const currentData = userData.data();
        let frequentLocations = currentData.frequentLocations || [];
        
        // Add current location to frequent locations array
        frequentLocations.push({
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          accuracy: location.accuracy,
        });

        // Keep only last 10 locations for frequency calculation
        if (frequentLocations.length > 10) {
          frequentLocations = frequentLocations.slice(-10);
        }

        // Calculate most frequent location
        const frequentLocation = this.calculateMostFrequentLocation(frequentLocations);

        await updateDoc(userDoc, {
          lastLocation: location,
          frequentLocations,
          frequentLocation,
          lastUpdated: new Date().toISOString(),
        });

        return location;
      }
    } catch (error) {
      console.error('Error updating user location:', error);
      return null;
    }
  }

  static calculateMostFrequentLocation(locations) {
    if (!locations || locations.length === 0) return null;

    // Group locations by approximate area (0.001 degree ≈ 111 meters)
    const locationGroups = {};
    const precision = 3; // 3 decimal places ≈ 111 meters

    locations.forEach(loc => {
      const key = `${loc.latitude.toFixed(precision)},${loc.longitude.toFixed(precision)}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          count: 0,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamps: [],
        };
      }
      locationGroups[key].count++;
      locationGroups[key].timestamps.push(loc.timestamp);
    });

    // Find the location with highest frequency
    let maxCount = 0;
    let mostFrequent = null;

    Object.values(locationGroups).forEach(group => {
      if (group.count > maxCount) {
        maxCount = group.count;
        mostFrequent = {
          latitude: group.latitude,
          longitude: group.longitude,
          frequency: group.count,
          lastVisited: new Date(Math.max(...group.timestamps.map(t => new Date(t)))).toISOString(),
        };
      }
    });

    return mostFrequent;
  }
}

export default LocationService;
