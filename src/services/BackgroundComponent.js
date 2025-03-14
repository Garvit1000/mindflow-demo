import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMemo } from 'react';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const { width, height } = Dimensions.get('window');

const BackgroundComponent = ({ theme = 'light' }) => {
  const animations = {
    fade: useRef(new Animated.Value(0)).current,
    translate1: useRef(new Animated.Value(0)).current,
    translate2: useRef(new Animated.Value(0)).current,
    translate3: useRef(new Animated.Value(0)).current,
    rotate1: useRef(new Animated.Value(0)).current,
    rotate2: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(1)).current,
  };

  // Enhanced color themes with higher opacity and contrast
  const themes = {
    light: {
      primary: ['#E8EFFF', '#F5F8FF'],
      accent1: ['rgba(128, 90, 213, 0.25)', 'rgba(128, 90, 213, 0.15)'],
      accent2: ['rgba(99, 179, 237, 0.3)', 'rgba(99, 179, 237, 0.2)'],
      accent3: ['rgba(144, 205, 244, 0.25)', 'rgba(144, 205, 244, 0.15)'],
      patterns: 'rgba(128, 90, 213, 0.12)',
      overlay: 'rgba(255, 255, 255, 0.4)',
    },
    calm: {
      primary: ['#E6F4F1', '#F2F9F9'],
      accent1: ['rgba(154, 230, 180, 0.35)', 'rgba(154, 230, 180, 0.25)'],
      accent2: ['rgba(129, 230, 217, 0.3)', 'rgba(129, 230, 217, 0.2)'],
      accent3: ['rgba(144, 224, 239, 0.35)', 'rgba(144, 224, 239, 0.25)'],
      patterns: 'rgba(154, 230, 180, 0.15)',
      overlay: 'rgba(255, 255, 255, 0.3)',
    },
    vibrant: {
      primary: ['#F0E7FF', '#FAF5FF'],
      accent1: ['rgba(159, 122, 234, 0.35)', 'rgba(159, 122, 234, 0.25)'],
      accent2: ['rgba(236, 201, 75, 0.25)', 'rgba(236, 201, 75, 0.15)'],
      accent3: ['rgba(237, 137, 54, 0.25)', 'rgba(237, 137, 54, 0.15)'],
      patterns: 'rgba(159, 122, 234, 0.15)',
      overlay: 'rgba(255, 255, 255, 0.25)',
    },
  };

  const currentTheme = themes[theme] || themes.light;

  // Generate larger, more visible pattern elements
  const patternElements = useMemo(() => {
    const elements = [];
    const numElements = 20;
    
    for (let i = 0; i < numElements; i++) {
      const size = Math.random() * 100 + 40; // Increased size
      elements.push({
        size,
        x: Math.random() * width,
        y: Math.random() * height,
        opacity: Math.random() * 0.4 + 0.2, // Increased opacity
        shape: Math.random() > 0.5 ? 'circle' : 'square',
        rotation: Math.random() * 360,
      });
    }
    return elements;
  }, []);

  useEffect(() => {
    const startAnimations = () => {
      // Faster fade in
      Animated.timing(animations.fade, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      // More pronounced movements
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(animations.translate1, {
              toValue: 30,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(animations.translate1, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(animations.translate2, {
              toValue: -30,
              duration: 5000,
              useNativeDriver: true,
            }),
            Animated.timing(animations.translate2, {
              toValue: 0,
              duration: 5000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(animations.translate3, {
              toValue: 25,
              duration: 6000,
              useNativeDriver: true,
            }),
            Animated.timing(animations.translate3, {
              toValue: -25,
              duration: 6000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // Slower rotations for better visibility
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(animations.rotate1, {
              toValue: 1,
              duration: 20000,
              useNativeDriver: true,
            }),
            Animated.timing(animations.rotate1, {
              toValue: 0,
              duration: 20000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(animations.rotate2, {
              toValue: 1,
              duration: 25000,
              useNativeDriver: true,
            }),
            Animated.timing(animations.rotate2, {
              toValue: 0,
              duration: 25000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // More pronounced breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animations.scale, {
            toValue: 1.08,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(animations.scale, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimations();
  }, []);

  const rotate1 = animations.rotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotate2 = animations.rotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Base gradient with more contrast */}
      <LinearGradient
        colors={currentTheme.primary}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Enhanced pattern elements */}
      {patternElements.map((element, index) => (
        <View
          key={index}
          style={[
            styles.patternElement,
            {
              width: element.size,
              height: element.size,
              left: element.x,
              top: element.y,
              opacity: element.opacity,
              backgroundColor: currentTheme.patterns,
              borderRadius: element.shape === 'circle' ? element.size / 2 : element.size / 6,
              transform: [{ rotate: `${element.rotation}deg` }],
            },
          ]}
        />
      ))}

      {/* Larger animated shapes */}
      <Animated.View
        style={[
          styles.shape,
          {
            transform: [
              { translateY: animations.translate1 },
              { rotate: rotate1 },
              { scale: animations.scale },
            ],
            opacity: animations.fade,
          },
        ]}
      >
        <LinearGradient
          colors={currentTheme.accent1}
          style={[styles.gradient, { borderRadius: 80 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.shape,
          styles.shapeTwo,
          {
            transform: [
              { translateY: animations.translate2 },
              { rotate: rotate2 },
              { scale: animations.scale },
            ],
            opacity: animations.fade,
          },
        ]}
      >
        <LinearGradient
          colors={currentTheme.accent2}
          style={[styles.gradient, { borderRadius: 100 }]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.shape,
          styles.shapeThree,
          {
            transform: [
              { translateY: animations.translate3 },
              { rotate: rotate1 },
              { scale: animations.scale },
            ],
            opacity: animations.fade,
          },
        ]}
      >
        <LinearGradient
          colors={currentTheme.accent3}
          style={[styles.gradient, { borderRadius: 120 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Enhanced depth effect */}
      <BlurView 
        intensity={60} 
        style={[
          styles.blur,
          { backgroundColor: currentTheme.overlay }
        ]} 
        tint="light" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.5,
    overflow: 'hidden',
  },
  shapeTwo: {
    bottom: -height * 0.1,
    right: -width * 0.2,
  },
  shapeThree: {
    top: height * 0.3,
    left: -width * 0.2,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  patternElement: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
});

export default BackgroundComponent;