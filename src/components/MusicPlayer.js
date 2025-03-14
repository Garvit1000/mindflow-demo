import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const MusicPlayer = ({ 
  currentTrack, 
  isPlaying, 
  position, 
  duration, 
  onPlayPause, 
  onSeek,
  onSlidingComplete 
}) => {
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const [isSeeking, setIsSeeking] = useState(false);
  const [localPosition, setLocalPosition] = useState(position);
  const rotationRef = useRef(null);
  const scaleRef = useRef(null);

  useEffect(() => {
    if (!isSeeking) {
      setLocalPosition(position);
    }
  }, [position, isSeeking]);

  useEffect(() => {
    if (isPlaying && !isSeeking) {
      startAnimation();
    } else {
      pauseAnimation();
    }
    return () => {
      pauseAnimation();
    };
  }, [isPlaying, isSeeking]);

  const startAnimation = useCallback(() => {
    pauseAnimation();

    rotationRef.current = Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );

    scaleRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    );

    rotationRef.current.start();
    scaleRef.current.start();
  }, []);

  const pauseAnimation = useCallback(() => {
    if (rotationRef.current) {
      rotationRef.current.stop();
    }
    if (scaleRef.current) {
      scaleRef.current.stop();
    }
  }, []);

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const formatTime = useCallback((milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekComplete = useCallback((value) => {
    setIsSeeking(false);
    setLocalPosition(value);
    onSlidingComplete(value);
  }, [onSlidingComplete]);

  const handleSeek = useCallback((value) => {
    setLocalPosition(value);
    onSeek(value);
  }, [onSeek]);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.albumArtContainer,
        {
          transform: [
            { rotate: spin },
            { scale: scaleAnimation }
          ]
        }
      ]}>
        {currentTrack?.thumbnail ? (
          <Animated.Image
            source={{ uri: currentTrack.thumbnail }}
            style={styles.albumArt}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderArt}>
            <Icon name="music-note" size={50} color="#fff" />
          </View>
        )}
      </Animated.View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack?.title || 'No track playing'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack?.artist || 'Unknown artist'}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <Slider
          style={styles.slider}
          value={isSeeking ? localPosition : position}
          maximumValue={duration}
          minimumValue={0}
          onValueChange={handleSeek}
          onSlidingStart={handleSeekStart}
          onSlidingComplete={handleSeekComplete}
          minimumTrackTintColor="#6200ee"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#6200ee"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(isSeeking ? localPosition : position)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
        <View style={styles.controls}>
          <Icon
            name={isPlaying ? "pause-circle-filled" : "play-circle-filled"}
            size={64}
            color="#6200ee"
            onPress={onPlayPause}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  albumArtContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    elevation: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 30,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.35,
  },
  placeholderArt: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#000',
  },
  artist: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  time: {
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MusicPlayer;
