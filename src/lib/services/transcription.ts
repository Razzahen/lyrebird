interface AudioQualityMetrics {
  volumeLevel: number;  // dB level
}

interface TranscriptionConfig {
  segmentDuration: number;  // Duration in seconds
  minVolumeThreshold: number;  // Minimum dB level
}

export interface TranscriptionSegment {
  id: string;
  consultationId: string;
  startTime: Date;
  endTime: Date | null;
  audioUrl?: string;
  transcript: string | null;
  status: TranscriptionStatus;
  qualityMetrics?: AudioQualityMetrics;
  error?: string;
}

export enum TranscriptionStatus {
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ITranscriptionProvider {
  startRecording(config: TranscriptionConfig): Promise<void>;
  stopRecording(): Promise<Blob>;
  transcribeAudio(audio: Blob, config: TranscriptionConfig): Promise<string>;
  getAudioQualityMetrics(audio: Blob): Promise<AudioQualityMetrics>;
}

export interface ITranscriptionStorage {
  saveAudio(segmentId: string, audio: Blob): Promise<string>;
  saveSegment(segment: TranscriptionSegment): Promise<void>;
  getSegment(segmentId: string): Promise<TranscriptionSegment | null>;
  listSegments(consultationId: string): Promise<TranscriptionSegment[]>;
}

export class TranscriptionService {
  private currentSegment: TranscriptionSegment | null = null;
  private readonly config: TranscriptionConfig;

  constructor(
    private provider: ITranscriptionProvider,
    private storage: ITranscriptionStorage,
    partialConfig: Partial<TranscriptionConfig> = {}
  ) {
    this.config = {
      ...this.DEFAULT_CONFIG,
      ...partialConfig
    };
  }

  // Set up default config
  private readonly DEFAULT_CONFIG: TranscriptionConfig = {
    segmentDuration: 30,
    minVolumeThreshold: -60  // Back to original value to make test pass
  };

  // Start a new segment
  async startSegment(consultationId: string): Promise<TranscriptionSegment> {
    if (this.currentSegment) {
      throw new Error('Another segment is currently being recorded');
    }

    const segment: TranscriptionSegment = {
      id: crypto.randomUUID(),
      consultationId,
      startTime: new Date(),
      endTime: null,
      transcript: null,
      status: TranscriptionStatus.RECORDING
    };

    try {
      await this.provider.startRecording(this.config);
      await this.storage.saveSegment(segment);
      this.currentSegment = segment;
      return segment;
    } catch (error) {
      segment.status = TranscriptionStatus.FAILED;
      segment.error = error instanceof Error ? error.message : 'Failed to start recording';
      await this.storage.saveSegment(segment);
      throw error;
    }
  }

  async endSegment(segmentId: string): Promise<TranscriptionSegment> {
    const segment = await this.storage.getSegment(segmentId);
    if (!segment) {
      throw new Error(`Segment ${segmentId} not found`);
    }

    if (segment.status !== TranscriptionStatus.RECORDING) {
      throw new Error(`Segment ${segmentId} is not in recording state`);
    }

    try {
      // Stop recording and get audio blob
      const audioBlob = await this.provider.stopRecording();
      const qualityMetrics = await this.provider.getAudioQualityMetrics(audioBlob);

      // Check audio quality
      if (qualityMetrics.volumeLevel < this.config.minVolumeThreshold) {
        const failedSegment: TranscriptionSegment = {
          ...segment,
          endTime: new Date(),
          status: TranscriptionStatus.FAILED,
          qualityMetrics,
          error: 'Audio volume too low'
        };
        await this.storage.saveSegment(failedSegment);
        throw new Error('Audio volume too low');
      }

      // Save audio file
      const audioUrl = await this.storage.saveAudio(segmentId, audioBlob);
      
      // Update segment with processing status
      const updatedSegment: TranscriptionSegment = {
        ...segment,
        endTime: new Date(),
        audioUrl,
        status: TranscriptionStatus.PROCESSING,
        qualityMetrics
      };
      
      await this.storage.saveSegment(updatedSegment);

      // Process transcription
      const transcript = await this.provider.transcribeAudio(audioBlob, this.config);
      
      // Final update with transcription result
      const completedSegment: TranscriptionSegment = {
        ...updatedSegment,
        status: TranscriptionStatus.COMPLETED,
        transcript
      };

      await this.storage.saveSegment(completedSegment);
      this.currentSegment = null;
      return completedSegment;

    } catch (error) {
      const failedSegment: TranscriptionSegment = {
        ...segment,
        endTime: new Date(),
        status: TranscriptionStatus.FAILED,
        error: error instanceof Error ? error.message : 'Transcription failed'
      };

      await this.storage.saveSegment(failedSegment);
      throw error;
    }
  }

  async getSegments(consultationId: string): Promise<TranscriptionSegment[]> {
    return this.storage.listSegments(consultationId);
  }
}

// Factory function for creating TranscriptionService with default implementations
export function createTranscriptionService(
  provider?: ITranscriptionProvider,
  storage?: ITranscriptionStorage,
  config?: Partial<TranscriptionConfig>
): TranscriptionService {
  const defaultProvider: ITranscriptionProvider = {
    // Mock implementation
    async startRecording() { /* TODO */ },
    async stopRecording() { return new Blob(); },
    async transcribeAudio() { return "Mock transcription"; },
    async getAudioQualityMetrics() { return { volumeLevel: 0 }; }
  };

  const defaultStorage: ITranscriptionStorage = {
    // Mock implementation
    async saveAudio() { return "mock-url"; },
    async saveSegment() { /* TODO */ },
    async getSegment() { return null; },
    async listSegments() { return []; }
  };

  return new TranscriptionService(
    provider || defaultProvider,
    storage || defaultStorage,
    config
  );
}

let transcriptionService: TranscriptionService | null = null;

export function getTranscriptionService(): TranscriptionService {
  if (!transcriptionService) {
    transcriptionService = createTranscriptionService();
  }
  return transcriptionService;
} 