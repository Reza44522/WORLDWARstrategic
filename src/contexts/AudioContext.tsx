import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { MusicTrack, MusicSettings, AlertSettings, WarAlert } from '../types';

interface AudioState {
  musicTracks: MusicTrack[];
  musicSettings: MusicSettings;
  alertSettings: AlertSettings;
  currentTrackIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  warAlerts: WarAlert[];
}

type AudioAction = 
  | { type: 'ADD_MUSIC_TRACK'; payload: MusicTrack }
  | { type: 'REMOVE_MUSIC_TRACK'; payload: { trackId: string } }
  | { type: 'UPDATE_MUSIC_SETTINGS'; payload: Partial<MusicSettings> }
  | { type: 'UPDATE_ALERT_SETTINGS'; payload: Partial<AlertSettings> }
  | { type: 'SET_CURRENT_TRACK'; payload: { index: number } }
  | { type: 'SET_PLAYING'; payload: { isPlaying: boolean } }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'ADD_WAR_ALERT'; payload: WarAlert }
  | { type: 'REMOVE_WAR_ALERT'; payload: { alertId: string } }
  | { type: 'LOAD_AUDIO_DATA'; payload: Partial<AudioState> };

const initialState: AudioState = {
  musicTracks: [],
  musicSettings: {
    isEnabled: true,
    autoPlay: true,
    volume: 0.5,
    shuffle: false,
    repeat: 'all'
  },
  alertSettings: {
    isEnabled: true,
    alertSoundUrl: '',
    volume: 0.8,
    showVisualAlert: true,
    alertDuration: 5
  },
  currentTrackIndex: 0,
  isPlaying: false,
  isLoading: false,
  warAlerts: []
};

const audioReducer = (state: AudioState, action: AudioAction): AudioState => {
  switch (action.type) {
    case 'ADD_MUSIC_TRACK':
      return {
        ...state,
        musicTracks: [...state.musicTracks, action.payload]
      };
    case 'REMOVE_MUSIC_TRACK':
      const filteredTracks = state.musicTracks.filter(t => t.id !== action.payload.trackId);
      return {
        ...state,
        musicTracks: filteredTracks,
        currentTrackIndex: state.currentTrackIndex >= filteredTracks.length ? 0 : state.currentTrackIndex
      };
    case 'UPDATE_MUSIC_SETTINGS':
      return {
        ...state,
        musicSettings: { ...state.musicSettings, ...action.payload }
      };
    case 'UPDATE_ALERT_SETTINGS':
      return {
        ...state,
        alertSettings: { ...state.alertSettings, ...action.payload }
      };
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrackIndex: action.payload.index
      };
    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload.isPlaying
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading
      };
    case 'NEXT_TRACK':
      let nextIndex = state.currentTrackIndex + 1;
      if (nextIndex >= state.musicTracks.length) {
        nextIndex = state.musicSettings.repeat === 'all' ? 0 : state.currentTrackIndex;
      }
      return {
        ...state,
        currentTrackIndex: nextIndex
      };
    case 'PREVIOUS_TRACK':
      let prevIndex = state.currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.musicSettings.repeat === 'all' ? state.musicTracks.length - 1 : 0;
      }
      return {
        ...state,
        currentTrackIndex: prevIndex
      };
    case 'ADD_WAR_ALERT':
      return {
        ...state,
        warAlerts: [...state.warAlerts, action.payload]
      };
    case 'REMOVE_WAR_ALERT':
      return {
        ...state,
        warAlerts: state.warAlerts.filter(a => a.id !== action.payload.alertId)
      };
    case 'LOAD_AUDIO_DATA':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

const AudioContext = createContext<{
  state: AudioState;
  dispatch: React.Dispatch<AudioAction>;
  audioRef: React.RefObject<HTMLAudioElement>;
  alertAudioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (index?: number) => void;
  pauseTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  playWarAlert: (alert: WarAlert) => void;
} | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(null);
  const alertAudioRef = useRef<HTMLAudioElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedAudioData = localStorage.getItem('worldWarAudioData');
      if (savedAudioData) {
        const parsedData = JSON.parse(savedAudioData);
        dispatch({ type: 'LOAD_AUDIO_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Error loading audio data:', error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        musicTracks: state.musicTracks,
        musicSettings: state.musicSettings,
        alertSettings: state.alertSettings,
        currentTrackIndex: state.currentTrackIndex
      };
      localStorage.setItem('worldWarAudioData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving audio data:', error);
    }
  }, [state.musicTracks, state.musicSettings, state.alertSettings, state.currentTrackIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (state.musicSettings.autoPlay && state.musicTracks.length > 0 && !state.isPlaying) {
      playTrack();
    }
  }, [state.musicTracks, state.musicSettings.autoPlay]);

  // Handle track end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTrackEnd = () => {
      if (state.musicSettings.repeat === 'one') {
        playTrack(state.currentTrackIndex);
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleTrackEnd);
    return () => audio.removeEventListener('ended', handleTrackEnd);
  }, [state.currentTrackIndex, state.musicSettings.repeat]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.musicSettings.volume;
    }
    if (alertAudioRef.current) {
      alertAudioRef.current.volume = state.alertSettings.volume;
    }
  }, [state.musicSettings.volume, state.alertSettings.volume]);

  const playTrack = (index?: number) => {
    const trackIndex = index !== undefined ? index : state.currentTrackIndex;
    const track = state.musicTracks[trackIndex];
    
    if (!track || !audioRef.current) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    dispatch({ type: 'SET_CURRENT_TRACK', payload: { index: trackIndex } });

    audioRef.current.src = track.url;
    audioRef.current.load();
    
    audioRef.current.play()
      .then(() => {
        dispatch({ type: 'SET_PLAYING', payload: { isPlaying: true } });
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      })
      .catch((error) => {
        console.error('Error playing track:', error);
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      });
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      dispatch({ type: 'SET_PLAYING', payload: { isPlaying: false } });
    }
  };

  const nextTrack = () => {
    if (state.musicTracks.length === 0) return;
    
    dispatch({ type: 'NEXT_TRACK' });
    setTimeout(() => {
      playTrack(state.currentTrackIndex + 1 >= state.musicTracks.length ? 0 : state.currentTrackIndex + 1);
    }, 100);
  };

  const previousTrack = () => {
    if (state.musicTracks.length === 0) return;
    
    dispatch({ type: 'PREVIOUS_TRACK' });
    setTimeout(() => {
      playTrack(state.currentTrackIndex - 1 < 0 ? state.musicTracks.length - 1 : state.currentTrackIndex - 1);
    }, 100);
  };

  const playWarAlert = (alert: WarAlert) => {
    if (!state.alertSettings.isEnabled || !state.alertSettings.alertSoundUrl) return;

    // Add alert to state
    dispatch({ type: 'ADD_WAR_ALERT', payload: alert });

    // Play alert sound
    if (alertAudioRef.current) {
      alertAudioRef.current.src = state.alertSettings.alertSoundUrl;
      alertAudioRef.current.play().catch(console.error);
    }

    // Remove alert after duration
    setTimeout(() => {
      dispatch({ type: 'REMOVE_WAR_ALERT', payload: { alertId: alert.id } });
    }, state.alertSettings.alertDuration * 1000);
  };

  return (
    <AudioContext.Provider value={{
      state,
      dispatch,
      audioRef,
      alertAudioRef,
      playTrack,
      pauseTrack,
      nextTrack,
      previousTrack,
      playWarAlert
    }}>
      {children}
      <audio ref={audioRef} preload="metadata" />
      <audio ref={alertAudioRef} preload="metadata" />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};