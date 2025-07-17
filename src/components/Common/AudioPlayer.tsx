import React, { useEffect } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  className?: string;
  showFullControls?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  className = '', 
  showFullControls = true 
}) => {
  const { state, playTrack, pauseTrack, nextTrack, previousTrack, dispatch } = useAudio();

  const currentTrack = state.musicTracks[state.currentTrackIndex];
  const hasMusic = state.musicTracks.length > 0;

  // Auto-start music when tracks are available
  useEffect(() => {
    if (hasMusic && state.musicSettings.autoPlay && !state.isPlaying && state.musicSettings.isEnabled) {
      setTimeout(() => {
        playTrack();
      }, 1000); // Delay to ensure user interaction
    }
  }, [hasMusic, state.musicSettings.autoPlay, state.musicSettings.isEnabled]);

  if (!hasMusic || !state.musicSettings.isEnabled) {
    return null;
  }

  return (
    <div className={`bg-black/80 backdrop-blur-sm rounded-lg p-4 ${className}`}>
      {/* Current Track Info */}
      <div className="flex items-center space-x-3 mb-3" dir="rtl">
        <Music className="w-5 h-5 text-blue-400" />
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium text-sm truncate">
            {currentTrack?.title || 'بدون آهنگ'}
          </div>
          <div className="text-gray-400 text-xs truncate">
            {currentTrack?.artist || ''}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showFullControls && (
            <button
              onClick={previousTrack}
              className="text-white hover:text-blue-400 transition-colors p-1"
              disabled={state.musicTracks.length <= 1}
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={state.isPlaying ? pauseTrack : () => playTrack()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : state.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          {showFullControls && (
            <button
              onClick={nextTrack}
              className="text-white hover:text-blue-400 transition-colors p-1"
              disabled={state.musicTracks.length <= 1}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch({ 
              type: 'UPDATE_MUSIC_SETTINGS', 
              payload: { volume: state.musicSettings.volume > 0 ? 0 : 0.5 } 
            })}
            className="text-white hover:text-blue-400 transition-colors"
          >
            {state.musicSettings.volume > 0 ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
          
          {showFullControls && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.musicSettings.volume}
              onChange={(e) => dispatch({ 
                type: 'UPDATE_MUSIC_SETTINGS', 
                payload: { volume: parseFloat(e.target.value) } 
              })}
              className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;