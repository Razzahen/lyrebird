import { 
  TranscriptionService,
  TranscriptionStatus,
  ITranscriptionProvider,
  ITranscriptionStorage,
  TranscriptionSegment
} from '../transcription';
import { jest } from '@jest/globals';

describe('TranscriptionService', () => {
  const mockProvider: jest.Mocked<ITranscriptionProvider> = {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    transcribeAudio: jest.fn(),
    getAudioQualityMetrics: jest.fn(),
  };

  const mockStorage: jest.Mocked<ITranscriptionStorage> = {
    saveAudio: jest.fn(),
    saveSegment: jest.fn(),
    getSegment: jest.fn(),
    listSegments: jest.fn(),
  };

  let service: TranscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TranscriptionService(mockProvider, mockStorage);
  });

  describe('startSegment', () => {
    it('should prevent concurrent recordings', async () => {
      // Start first recording
      const firstSegment: TranscriptionSegment = {
        id: 'test-id-1',
        consultationId: 'consultation-1',
        startTime: new Date(),
        endTime: null,
        transcript: null,
        status: TranscriptionStatus.RECORDING
      };

      mockStorage.saveSegment.mockResolvedValueOnce(undefined);
      await service.startSegment('consultation-1');

      // Attempt to start second recording
      await expect(service.startSegment('consultation-1'))
        .rejects
        .toThrow('Another segment is currently being recorded');
    });
  });

  describe('endSegment', () => {
    it('should fail when audio volume is too low', async () => {
      // Setup initial segment
      const segment: TranscriptionSegment = {
        id: 'test-id',
        consultationId: 'consultation-1',
        startTime: new Date(),
        endTime: null,
        transcript: null,
        status: TranscriptionStatus.RECORDING
      };

      // Mock the storage to return our test segment
      mockStorage.getSegment.mockResolvedValueOnce(segment);

      // Mock low volume audio
      mockProvider.stopRecording.mockResolvedValueOnce(new Blob());
      mockProvider.getAudioQualityMetrics.mockResolvedValueOnce({
        volumeLevel: -90 // Very low volume
      });

      // Mock storage operations
      mockStorage.saveAudio.mockResolvedValueOnce('mock-audio-url');
      mockStorage.saveSegment.mockResolvedValueOnce(undefined);

      // Attempt to end segment - should throw error
      await expect(service.endSegment('test-id'))
        .rejects
        .toThrow('Audio volume too low');

      // Verify the segment was marked as failed
      const savedSegment = mockStorage.saveSegment.mock.calls[0][0];
      expect(savedSegment.status).toBe(TranscriptionStatus.FAILED);
      expect(savedSegment.error).toBe('Audio volume too low');
      expect(savedSegment.qualityMetrics?.volumeLevel).toBe(-90);
      
      // Verify provider functions were called
      expect(mockProvider.stopRecording).toHaveBeenCalled();
      expect(mockProvider.getAudioQualityMetrics).toHaveBeenCalled();
    });

    it('should handle successful transcription flow', async () => {
      // Setup initial segment
      const segment: TranscriptionSegment = {
        id: 'test-id',
        consultationId: 'consultation-1',
        startTime: new Date(),
        endTime: null,
        transcript: null,
        status: TranscriptionStatus.RECORDING
      };

      // Mock the storage to return our test segment
      mockStorage.getSegment.mockResolvedValueOnce(segment);

      // Mock successful recording and transcription
      mockProvider.stopRecording.mockResolvedValueOnce(new Blob());
      mockProvider.getAudioQualityMetrics.mockResolvedValueOnce({
        volumeLevel: -30 // Ok volume level
      });
      mockProvider.transcribeAudio.mockResolvedValueOnce('Hello, this is a test transcription');

      // Mock storage operations
      mockStorage.saveAudio.mockResolvedValueOnce('mock-audio-url');
      mockStorage.saveSegment.mockImplementation(async (segment) => undefined);

      const result = await service.endSegment('test-id');

      expect(result.status).toBe(TranscriptionStatus.COMPLETED);
      expect(result.transcript).toBe('Hello, this is a test transcription');
      expect(result.audioUrl).toBe('mock-audio-url');
      expect(result.qualityMetrics?.volumeLevel).toBe(-30);

      const savedSegments = mockStorage.saveSegment.mock.calls.map(call => call[0]);
      expect(savedSegments).toHaveLength(2); // Should be saved twice: PROCESSING and COMPLETED
      expect(savedSegments[0].status).toBe(TranscriptionStatus.PROCESSING);
      expect(savedSegments[1].status).toBe(TranscriptionStatus.COMPLETED);
    });
  });
}); 