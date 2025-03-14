// API Configuration
const fetch = require('node-fetch');

const API_BASE_URL = 'https://api.jamendo.com/v3.0';
const CLIENT_ID = '0678019f'; // Jamendo Client ID - Replace with your own

// Cache for API responses
let apiCache = {
  Meditation: null,
  'Nature Sounds': null,
  Sleep: null,
  Relaxation: null
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;
let lastApiCall = null;

// Search queries for different categories
const searchQueries = {
  'Meditation': 'tags=meditation+ambient&mood=relaxed',
  'Nature Sounds': 'tags=nature+ambient&mood=peaceful',
  'Sleep': 'tags=sleep+ambient&mood=peaceful',
  'Relaxation': 'tags=relaxation+ambient&mood=relaxed'
};

// Format duration from milliseconds to MM:SS
const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Check if we should use cache
const shouldUseCache = () => {
  if (!lastApiCall) return false;
  return Date.now() - lastApiCall < CACHE_EXPIRATION;
};

// Transform Jamendo track to our format
const transformTrack = (track, category) => {
  if (!track) return null;
  
  return {
    id: track.id,
    title: track.name,
    duration: formatDuration(track.duration * 1000), // Convert to milliseconds
    category,
    thumbnail: track.image,
    url: track.shareurl,
    artist: track.artist_name,
    previewUrl: track.audio, // Full audio stream URL
    streamUrl: track.audiodownload // Direct audio download URL for streaming
  };
};

export const fetchMusicByCategory = async (category) => {
  console.log(`Attempting to fetch ${category} tracks...`);

  // Check if category exists in searchQueries
  if (!searchQueries[category]) {
    console.log(`Category "${category}" not found in searchQueries, using fallback`);
    return fallbackMusic[category] || [];
  }

  // Check cache first
  if (shouldUseCache() && apiCache[category]) {
    console.log(`Using cached data for ${category}`);
    return apiCache[category];
  }

  try {
    const url = `${API_BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&limit=10&include=musicinfo&${searchQueries[category]}&boost=popularity_month`;
    
    console.log(`Searching for "${category}" tracks...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results) {
      throw new Error('No results found');
    }

    const tracks = data.results
      .map(track => transformTrack(track, category))
      .filter(track => track !== null && track.streamUrl);

    console.log(`Found ${tracks.length} tracks for ${category}`);
    
    if (tracks.length === 0) {
      console.log('No tracks found, using fallback data');
      return fallbackMusic[category] || [];
    }

    // Cache the successful response
    apiCache[category] = tracks;
    return tracks;

  } catch (error) {
    console.error(`Error fetching ${category} tracks:`, error.message);
    return fallbackMusic[category] || [];
  }
};

export const fetchAllMusic = async () => {
  console.log('Fetching all music...');

  try {
    // If we have complete cached data and it's still valid, use it
    if (shouldUseCache()) {
      const cachedCategories = Object.keys(searchQueries);
      const allCached = cachedCategories.every(category => apiCache[category]);
      
      if (allCached) {
        console.log('Using cached data for all categories');
        const allTracks = cachedCategories
          .map(category => apiCache[category])
          .filter(tracks => Array.isArray(tracks))
          .flat();
        return allTracks;
      }
    }

    console.log('Fetching all music categories...');
    
    // Fetch each category sequentially to avoid rate limits
    const allTracks = [];
    const categories = Object.keys(searchQueries);
    
    for (const category of categories) {
      try {
        const tracks = await fetchMusicByCategory(category);
        if (Array.isArray(tracks) && tracks.length > 0) {
          allTracks.push(...tracks);
        } else {
          console.log(`No tracks found for category: ${category}, using fallback`);
          const fallbackTracks = fallbackMusic[category];
          if (Array.isArray(fallbackTracks)) {
            allTracks.push(...fallbackTracks);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${category} tracks:`, error.message);
        // Use fallback data for this category
        const fallbackTracks = fallbackMusic[category];
        if (Array.isArray(fallbackTracks)) {
          allTracks.push(...fallbackTracks);
        }
      }
    }

    // Remove duplicates
    const uniqueTracks = Array.from(
      new Map(
        allTracks
          .filter(track => track && track.id)
          .map(track => [track.id, track])
      ).values()
    );

    console.log(`Successfully fetched ${uniqueTracks.length} total tracks`);
    return uniqueTracks;

  } catch (error) {
    console.error('Error fetching all music:', error.message);
    // If all else fails, return all fallback music
    const allFallbackTracks = Object.values(fallbackMusic)
      .filter(Array.isArray)
      .flat();
    console.log(`Returning ${allFallbackTracks.length} fallback tracks`);
    return allFallbackTracks;
  }
};

// Update fallback music with Jamendo tracks
const fallbackMusic = {
  Meditation: [
    {
      id: '1320267',
      title: 'Peaceful Meditation',
      duration: '5:30',
      category: 'Meditation',
      thumbnail: 'https://usercontent.jamendo.com?type=album&id=98793',
      url: 'https://www.jamendo.com/track/1320267',
      artist: 'Relaxing Music',
      streamUrl: 'https://mp3d.jamendo.com/?trackid=1320267',
      previewUrl: 'https://mp3d.jamendo.com/?trackid=1320267'
    }
  ],
  'Nature Sounds': [
    {
      id: '1225340',
      title: 'Forest Ambience',
      duration: '6:00',
      category: 'Nature Sounds',
      thumbnail: 'https://usercontent.jamendo.com?type=album&id=102340',
      url: 'https://www.jamendo.com/track/1225340',
      artist: 'Nature Sounds',
      streamUrl: 'https://mp3d.jamendo.com/?trackid=1225340',
      previewUrl: 'https://mp3d.jamendo.com/?trackid=1225340'
    }
  ],
  Sleep: [
    {
      id: '1225341',
      title: 'Sleeping Sounds',
      duration: '6:00',
      category: 'Sleep',
      thumbnail: 'https://usercontent.jamendo.com?type=album&id=102340',
      url: 'https://www.jamendo.com/track/1225341',
      artist: 'Sleep Music',
      streamUrl: 'https://mp3d.jamendo.com/?trackid=1225341',
      previewUrl: 'https://mp3d.jamendo.com/?trackid=1225341'
    }
  ],
  Relaxation: [
    {
      id: '1320268',
      title: 'Relaxing Music',
      duration: '5:30',
      category: 'Relaxation',
      thumbnail: 'https://usercontent.jamendo.com?type=album&id=98793',
      url: 'https://www.jamendo.com/track/1320268',
      artist: 'Relaxation Music',
      streamUrl: 'https://mp3d.jamendo.com/?trackid=1320268',
      previewUrl: 'https://mp3d.jamendo.com/?trackid=1320268'
    }
  ]
};
