import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const { width } = Dimensions.get('window');

const dietPlans = {
  underweight: {
    normal: {
      title: 'Weight Gain Plan - Balanced Mind',
      meals: [
        {
          name: 'Breakfast',
          description: 'Oatmeal with nuts, banana, and protein shake',
          imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-4.0.3',
          calories: '600-700',
        },
        {
          name: 'Lunch',
          description: 'Grilled chicken with brown rice and avocado',
          imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3',
          calories: '700-800',
        },
        {
          name: 'Dinner',
          description: 'Salmon with sweet potato and vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3',
          calories: '600-700',
        },
      ],
    },
    anxiety: {
      title: 'Calming Weight Gain Plan',
      meals: [
        {
          name: 'Breakfast',
          description: 'Chamomile tea, whole grain toast with almond butter',
          imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3',
          calories: '500-600',
        },
        {
          name: 'Lunch',
          description: 'Turkey wrap with avocado and calming herbs',
          imageUrl: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?ixlib=rb-4.0.3',
          calories: '600-700',
        },
        {
          name: 'Dinner',
          description: 'Magnesium-rich fish with quinoa and vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3',
          calories: '600-700',
        },
      ],
    },
  },
  normal: {
    normal: {
      title: 'Maintenance Plan - Balanced Mind',
      meals: [
        {
          name: 'Breakfast',
          description: 'Greek yogurt parfait with berries and granola',
          imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3',
          calories: '400-500',
        },
        {
          name: 'Lunch',
          description: 'Mediterranean salad with grilled chicken',
          imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3',
          calories: '500-600',
        },
        {
          name: 'Dinner',
          description: 'Stir-fried tofu with vegetables and brown rice',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3',
          calories: '500-600',
        },
      ],
    },
    depression: {
      title: 'Mood-Boosting Maintenance Plan',
      meals: [
        {
          name: 'Breakfast',
          description: 'Omega-3 rich breakfast with eggs and smoked salmon',
          imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?ixlib=rb-4.0.3',
          calories: '400-500',
        },
        {
          name: 'Lunch',
          description: 'Quinoa bowl with colorful vegetables and lean protein',
          imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3',
          calories: '500-600',
        },
        {
          name: 'Dinner',
          description: 'Grilled fish with sweet potato and green vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3',
          calories: '500-600',
        },
      ],
    },
  },
  overweight: {
    normal: {
      title: 'Healthy Weight Loss Plan',
      meals: [
        {
          name: 'Breakfast',
          description: 'Protein smoothie with spinach and berries',
          imageUrl: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?ixlib=rb-4.0.3',
          calories: '300-400',
        },
        {
          name: 'Lunch',
          description: 'Grilled chicken salad with light dressing',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3',
          calories: '400-500',
        },
        {
          name: 'Dinner',
          description: 'Baked fish with steamed vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3',
          calories: '400-500',
        },
      ],
    },
    anxiety: {
      title: 'Calming Weight Loss Plan',
      meals: [
        {
          name: 'Breakfast',
          description: 'Green tea with oatmeal and chia seeds',
          imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-4.0.3',
          calories: '300-400',
        },
        {
          name: 'Lunch',
          description: 'Tuna salad with whole grain crackers',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3',
          calories: '400-500',
        },
        {
          name: 'Dinner',
          description: 'Lean turkey with roasted vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3',
          calories: '400-500',
        },
      ],
    },
  },
};

const DietScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Calculate BMI
          const heightInMeters = data.height / 100;
          const calculatedBMI = data.weight / (heightInMeters * heightInMeters);
          setBmi(calculatedBMI.toFixed(1));
          
          // Determine BMI category
          let category;
          if (calculatedBMI < 18.5) category = 'underweight';
          else if (calculatedBMI >= 18.5 && calculatedBMI < 25) category = 'normal';
          else category = 'overweight';
          
          setBmiCategory(category);
          
          // Set diet plan based on BMI category and mental status
          const mentalStatus = data.mentalStatus?.toLowerCase() || 'normal';
          setDietPlan(dietPlans[category][mentalStatus] || dietPlans[category].normal);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6200EE', '#9C27B0']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Personalized Diet Plan</Text>
        <View style={styles.bmiContainer}>
          <Text style={styles.bmiText}>BMI: {bmi}</Text>
          <Text style={styles.bmiCategory}>
            Category: {bmiCategory.charAt(0).toUpperCase() + bmiCategory.slice(1)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.planContainer}>
        <Text style={styles.planTitle}>{dietPlan?.title}</Text>
        
        {dietPlan?.meals.map((meal, index) => (
          <View key={index} style={styles.mealCard}>
            <Image
              source={{ uri: meal.imageUrl }}
              style={styles.mealImage}
              resizeMode="cover"
            />
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDescription}>{meal.description}</Text>
              <Text style={styles.mealCalories}>{meal.calories} calories</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  bmiContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
  },
  bmiText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bmiCategory: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  planContainer: {
    padding: 15,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  mealInfo: {
    padding: 15,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mealDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  mealCalories: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
});

export default DietScreen;
