'use client';

import { useState, useEffect } from 'react';

interface RecordingControlsProps {
  isActive: boolean;
  autoStart?: boolean;
  onInit?: (controls: { start: () => Promise<void>, stop: () => Promise<void> }) => void;
}

export function RecordingControls({ 
  isActive, 
  autoStart = false,
  onInit 
}: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false);

  // Provide controls to parent
  useEffect(() => {
    if (onInit) {
      onInit({
        start: async () => {
          setIsRecording(true);
        },
        stop: async () => {
          setIsRecording(false);
        }
      });
    }
  }, [onInit]);

  // Auto-start visual indicator
  useEffect(() => {
    if (autoStart && isActive) {
      setIsRecording(true);
    }
  }, [autoStart, isActive]);

  // Hide the recording button if autoStart is true
  if (autoStart) {
    return isRecording ? (
      <span className="text-sm text-gray-600">
        Recording in progress...
      </span>
    ) : null;
  }

  return (
    <div className="flex items-center gap-4 mt-4">
      <button
        onClick={() => setIsRecording(!isRecording)}
        disabled={!isActive}
        className={`px-4 py-2 rounded-md flex items-center gap-2 ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        } ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRecording ? (
          <>
            <span className="animate-pulse">●</span> Stop Recording
          </>
        ) : (
          <>
            ● Start Recording
          </>
        )}
      </button>
      {isRecording && (
        <span className="text-sm text-gray-600">
          Recording in progress...
        </span>
      )}
    </div>
  );
} 