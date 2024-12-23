import React, { useState } from "react";
import { RecordingControls } from './RecordingControls';

interface ControlsProps {
  consultationId: string | null;
  isActive: boolean;
  onStart: () => Promise<void>;
  onEnd: () => Promise<void>;
  loading?: boolean;
}

export function Controls({ onStart, onEnd, isActive, consultationId }: ControlsProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [recordingControls, setRecordingControls] = useState<{ 
    start: () => Promise<void>, 
    stop: () => Promise<void> 
  } | null>(null);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStart();
    } catch (error) {
      console.error('Error starting consultation:', error);
      alert('Failed to start consultation');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEnd = async () => {
    setIsEnding(true);
    try {
      if (recordingControls) {
        await recordingControls.stop();
      }
      await onEnd();
    } catch (error) {
      console.error('Error ending consultation:', error);
      alert('Failed to end consultation');
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={isActive || isStarting}
          className={`btn-primary flex items-center ${
            isActive || isStarting ? 'opacity-50' : ''
          }`}
        >
          {isStarting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Starting...
            </>
          ) : (
            "Start Consultation"
          )}
        </button>
        <button
          onClick={handleEnd}
          disabled={!isActive || isEnding}
          className={`btn-secondary flex items-center ${
            !isActive || isEnding ? 'opacity-50' : ''
          }`}
        >
          {isEnding ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Ending...
            </>
          ) : (
            "End Consultation"
          )}
        </button>
      </div>
      <RecordingControls 
        isActive={isActive} 
        autoStart={true}
        onInit={setRecordingControls}
      />
    </div>
  );
}
