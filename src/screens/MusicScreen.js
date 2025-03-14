import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Text,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { fetchAllMusic, fetchMusicByCategory } from '../services/musicService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import MusicPlayer from '../components/MusicPlayer';

const MusicScreen = () => {
  const [tracks, setTracks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const positionUpdateInterval = useRef(null);

  const categories = [
    'All',
    'Meditation',
    'Nature Sounds',
    'Sleep',
    'Relaxation'
  ];

  useEffect(() => {
    loadMusic();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, []);

  const loadMusic = async () => {
    setLoading(true);
    try {
      const musicData = selectedCategory === 'All'
        ? await fetchAllMusic()
        : await fetchMusicByCategory(selectedCategory);
      setTracks(musicData);
    } catch (error) {
      console.error('Error loading music:', error);
      Alert.alert('Error', 'Failed to load music. Please try again.');
    }
    setLoading(false);
  };

  const onPlaybackStatusUpdate = async (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        if (positionUpdateInterval.current) {
          clearInterval(positionUpdateInterval.current);
        }
      }
    }
  };

  const startPositionUpdate = () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }
    positionUpdateInterval.current = setInterval(async () => {
      if (sound && isPlaying) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
        }
      }
    }, 100);
  };

  const stopPositionUpdate = () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
      positionUpdateInterval.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startPositionUpdate();
    } else {
      stopPositionUpdate();
    }
    return () => stopPositionUpdate();
  }, [isPlaying]);

  const playTrack = async (track) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      stopPositionUpdate();

      setIsLoading(true);
      setCurrentTrack(track);
      setPlayerVisible(true);

      const audioUrl = track.streamUrl || track.previewUrl;
      if (!audioUrl) {
        throw new Error('No audio URL available for this track');
      }

      console.log('Loading audio:', audioUrl);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing track:', error);
      Alert.alert('Error', 'Failed to play track. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const handleSeek = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const renderTrackItem = ({ item }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={1000}
      delay={200}
    >
      <TouchableOpacity
        style={styles.trackItem}
        onPress={() => playTrack(item)}
      >
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{item.title}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
        </View>
        <Icon
          name={currentTrack?.id === item.id && isPlaying ? "pause" : "play-arrow"}
          size={24}
          color="#6200ee"
        />
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            decelerationRate="fast"
            snapToAlignment="center"
            bounces={false}
          />
        </View>

        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={tracks}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              style={styles.trackList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.trackListContent}
              bounces={true}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tracks found</Text>
                </View>
              )}
            />
          )}
        </View>

        <Modal
          visible={playerVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setPlayerVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPlayerVisible(false)}
            >
              <Icon name="keyboard-arrow-down" size={36} color="#000" />
            </TouchableOpacity>
            
            <MusicPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              position={position}
              duration={duration}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSlidingComplete={handleSeek}
            />
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1,
  },
  categoryList: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedCategory: {
    backgroundColor: '#6200ee',
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackList: {
    flex: 1,
  },
  trackListContent: {
    padding: 10,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  trackInfo: {
    flex: 1,
    marginRight: 10,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 15,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MusicScreen;
