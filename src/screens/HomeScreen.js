import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import BackgroundComponent from '../services/BackgroundComponent';

const mentalHealthTips = {
  Normal: {
    icon: 'emoticon-happy-outline',
    tips: [
      "Continue maintaining a healthy lifestyle",
      "Practice regular exercise and meditation",
      "Stay connected with friends and family"
    ],
    gradient: ['#43A047', '#66BB6A']
  },
  Depression: {
    icon: 'emoticon-sad-outline',
    tips: [
      "Establish a daily routine",
      "Get regular exercise, even if it's just a short walk",
      "Reach out to friends or family members",
      "Consider talking to a mental health professional"
    ],
    gradient: ['#FB8C00', '#FFA726']
  },
  Suicidal: {
    icon: 'alert-circle',
    tips: [
      "You're not alone - help is available 24/7",
      "Call the National Suicide Prevention Lifeline: 988",
      "Reach out to a trusted friend or family member immediately",
      "Seek immediate professional help"
    ],
    gradient: ['#C62828', '#D32F2F']
  },
  Anxiety: {
    icon: 'brain',
    tips: [
      "Practice deep breathing exercises",
      "Try mindfulness meditation",
      "Limit caffeine and alcohol intake",
      "Maintain a regular sleep schedule"
    ],
    gradient: ['#5E35B1', '#7E57C2']
  },
  Stress: {
    icon: 'alert-octagon',
    tips: [
      "Take regular breaks during work",
      "Practice time management",
      "Try relaxation techniques",
      "Maintain a healthy work-life balance"
    ],
    gradient: ['#FF7043', '#FF8A65']
  },
  'Bi-Polar': {
    icon: 'sine-wave',
    tips: [
      "Maintain a consistent daily routine",
      "Track your mood changes",
      "Get regular sleep",
      "Work with a mental health professional"
    ],
    gradient: ['#5C6BC0', '#7986CB']
  },
  'Personality Disorder': {
    icon: 'account-question',
    tips: [
      "Practice self-awareness",
      "Maintain consistent therapy appointments",
      "Learn healthy coping mechanisms",
      "Build a support network"
    ],
    gradient: ['#8D6E63', '#A1887F']
  },
  fear: {
    icon: 'shield-alert',
    tips: [
      "Practice gradual exposure to fears",
      "Use relaxation techniques",
      "Challenge negative thoughts",
      "Focus on what you can control"
    ],
    gradient: ['#78909C', '#90A4AE']
  },
  anger: {
    icon: 'fire',
    tips: [
      "Practice anger management techniques",
      "Count to ten before reacting",
      "Use 'I' statements when expressing feelings",
      "Remove yourself from triggering situations"
    ],
    gradient: ['#E53935', '#EF5350']
  },
  sad: {
    icon: 'emoticon-cry',
    tips: [
      "Engage in activities you usually enjoy",
      "Spend time in nature",
      "Express your feelings through art or writing",
      "Connect with supportive people"
    ],
    gradient: ['#7986CB', '#9FA8DA']
  },
  envy: {
    icon: 'eye-plus',
    tips: [
      "Practice gratitude daily",
      "Focus on personal growth",
      "Set realistic personal goals",
      "Challenge negative comparisons"
    ],
    gradient: ['#66BB6A', '#81C784']
  }
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [mentalState, setMentalState] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will happen automatically through AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserName(userData.name || userData.displayName || '');
          if (userData.currentMentalState) {
            setMentalState(userData.currentMentalState);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').width,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  const renderMentalHealthCard = () => {
    if (!mentalState) return null;

    const stateInfo = mentalHealthTips[mentalState.stage] || mentalHealthTips.Normal;
    
    return (
      <LinearGradient
        colors={stateInfo.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statusCard}
      >
        <View style={styles.statusHeader}>
          <MaterialCommunityIcons 
            name={stateInfo.icon} 
            size={32} 
            color="#fff" 
          />
          <Text style={styles.statusTitle}>Current Mental State</Text>
        </View>
        <Text style={styles.statusText}>{mentalState.stage}</Text>
        <Text style={styles.lastUpdated}>
          Last updated: {mentalState.lastUpdate?.toDate().toLocaleDateString()}
        </Text>
      </LinearGradient>
    );
  };

  const renderTips = () => {
    if (!mentalState?.stage || !mentalHealthTips[mentalState.stage]) {
      return null;
    }

    const tips = mentalHealthTips[mentalState.stage].tips || mentalHealthTips.Normal.tips;
    
    return (
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Personalized Recommendations</Text>
        {Array.isArray(tips) && tips.map((tip, index) => (
          <View key={index} style={styles.tipContainer}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundComponent theme="vibrant"/>
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.welcomeText}>{userName || 'Friend'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={toggleMenu}
            >
              <MaterialCommunityIcons name="menu" size={28} color="#1A365D" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {renderMentalHealthCard()}
            {renderTips()}

            <View style={styles.quickAccessContainer}>
              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate('Soothing Music')}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <MaterialCommunityIcons name="music" size={30} color="white" />
                    <Text style={styles.cardText}>Soothing{'\n'}Music</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate('Diet')}
              >
                <LinearGradient
                  colors={['#FF9800', '#FFB74D']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <MaterialCommunityIcons name="food-apple" size={30} color="white" />
                    <Text style={styles.cardText}>Diet{'\n'}Plans</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {mentalState?.stage === 'Suicidal' && (
              <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={() => Linking.openURL('tel:988')}
              >
                <MaterialCommunityIcons name="phone-alert" size={24} color="#fff" />
                <Text style={styles.emergencyButtonText}>Get Immediate Help</Text>
              </TouchableOpacity>
            )}

            <View style={styles.disclaimerCard}>
              <MaterialCommunityIcons name="information" size={24} color="#805AD5" />
              <Text style={styles.disclaimerText}>
                This is an AI-assisted assessment. Always consult healthcare professionals for medical advice.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.chatButton} 
              onPress={() => navigation.navigate('Chat')}
            >
              <MaterialCommunityIcons name="chat-processing" size={24} color="#fff" />
              <Text style={styles.chatButtonText}>Talk to AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {menuVisible && (
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.menuHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              navigation.navigate('Profile');
            }}
          >
            <MaterialCommunityIcons name="account" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Your Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              navigation.navigate('Soothing Music');
            }}
          >
            <MaterialCommunityIcons name="music" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Soothing Music</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  greeting: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A365D',
  },
  menuButton: {
    padding: 12,
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
    opacity: 0.9,
  },
  statusText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  lastUpdated: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#805AD5',
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  quickAccessCard: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: 120,
  },
  cardGradient: {
    padding: 15,
    borderRadius: 20,
    height: '100%',
    justifyContent: 'center',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  disclaimerCard: {
    backgroundColor: '#FAF5FF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#553C9A',
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  chatButton: {
    backgroundColor: '#805AD5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#805AD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#1A202C',
    padding: 24,
  },
  menuHeader: {
    alignItems: 'flex-end',
    marginBottom: 40,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  closeButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
});