'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

// Define meditation session types
type MeditationType = 'breathing' | 'body-scan' | 'mindfulness' | 'loving-kindness';

interface MeditationSession {
  type: MeditationType;
  name: string;
  description: string;
  duration: number; // in minutes
  guidanceFrequency?: 'none' | 'minimal' | 'moderate' | 'frequent';
}

const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    type: 'breathing',
    name: 'Breath Focus',
    description: 'A simple meditation focusing on your breath to calm the mind.',
    duration: 5,
    guidanceFrequency: 'minimal'
  },
  {
    type: 'body-scan',
    name: 'Body Scan',
    description: 'Progressively relax your body by focusing attention from head to toe.',
    duration: 10,
    guidanceFrequency: 'moderate'
  },
  {
    type: 'mindfulness',
    name: 'Mindful Awareness',
    description: 'Practice being fully present and aware of thoughts without judgment.',
    duration: 15,
    guidanceFrequency: 'minimal'
  },
  {
    type: 'loving-kindness',
    name: 'Loving-Kindness',
    description: 'Cultivate feelings of goodwill, kindness, and warmth towards yourself and others.',
    duration: 10,
    guidanceFrequency: 'moderate'
  }
];

const Meditation: React.FC = () => {
  const { settings } = useSettings();
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [soundAvailable, setSoundAvailable] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for bell sounds
  useEffect(() => {
    try {
      audioRef.current = new Audio('/sounds/meditation-bell.mp3');
      audioRef.current.volume = settings.soundVolume / 100;
      
      // Check if the sound file is available
      audioRef.current.addEventListener('error', () => {
        console.warn('Meditation bell sound file not found or cannot be played');
        setSoundAvailable(false);
      });
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } catch (error) {
      console.error('Error initializing meditation bell sound:', error);
      setSoundAvailable(false);
    }
  }, [settings.soundVolume]);

  // Handle session selection
  const handleSelectSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration * 60); // Convert minutes to seconds
    setProgress(0);
    setIsPlaying(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Start or pause meditation
  const togglePlayPause = () => {
    if (!selectedSession) return;
    
    if (isPlaying) {
      // Pause
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      // Play start sound
      if (settings.soundEnabled && soundAvailable && audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error('Error playing meditation bell sound:', error);
          setSoundAvailable(false);
        });
      }
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // End of session
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            
            // Play end sound
            if (settings.soundEnabled && soundAvailable && audioRef.current) {
              audioRef.current.play().catch(error => {
                console.error('Error playing meditation bell sound:', error);
                setSoundAvailable(false);
              });
            }
            
            return 0;
          }
          
          // Update progress
          const totalTime = selectedSession.duration * 60;
          const newProgress = ((totalTime - (prev - 1)) / totalTime) * 100;
          setProgress(newProgress);
          
          return prev - 1;
        });
      }, 1000);
    }
    
    setIsPlaying(!isPlaying);
  };

  // Reset meditation session
  const resetSession = () => {
    if (!selectedSession) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimeRemaining(selectedSession.duration * 60);
    setProgress(0);
    setIsPlaying(false);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black/30 backdrop-blur-md rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Meditation</h2>
      
      {!soundAvailable && settings.soundEnabled && (
        <div className="mb-4 p-3 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm">
          <p>Meditation bell sound file not found. Please download a meditation bell sound file and place it in the public/sounds directory as meditation-bell.mp3.</p>
        </div>
      )}
      
      {!selectedSession ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEDITATION_SESSIONS.map((session) => (
            <div 
              key={session.type}
              onClick={() => handleSelectSession(session)}
              className="p-4 bg-black/20 rounded-lg cursor-pointer hover:bg-black/40 transition-colors"
            >
              <h3 className="text-xl font-semibold text-white">{session.name}</h3>
              <p className="text-gray-300 mb-2">{session.description}</p>
              <div className="flex justify-between text-gray-400">
                <span>{session.duration} minutes</span>
                <span>Guidance: {session.guidanceFrequency}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold text-white mb-2">{selectedSession.name}</h3>
          <p className="text-gray-300 mb-6 text-center">{selectedSession.description}</p>
          
          {/* Progress circle */}
          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#333"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#ec4899"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{formatTime(timeRemaining)}</span>
              <span className="text-gray-300">{isPlaying ? 'Meditating...' : 'Paused'}</span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={resetSession}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <SkipBack size={24} className="text-white" />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-pink-600 hover:bg-pink-500 transition-colors"
            >
              {isPlaying ? (
                <Pause size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white" />
              )}
            </button>
          </div>
          
          {/* Back button */}
          <button
            onClick={() => setSelectedSession(null)}
            className="mt-8 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to meditation types
          </button>
        </div>
      )}
    </div>
  );
};

export default Meditation; 