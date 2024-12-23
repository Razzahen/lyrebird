import { ConsultationService } from '../consultation';
import { 
  ConsultationStatus, 
  Consultation, 
  InvalidConsultationStateError,
  IConsultationRepository
} from '../../types/consultation';
import { jest } from '@jest/globals';

const mockDb: jest.Mocked<IConsultationRepository> = {
  createConsultation: jest.fn(),
  findById: jest.fn(),
  addNote: jest.fn(),
  updateStatus: jest.fn(),
  addSummary: jest.fn(),
  list: jest.fn(),
};

describe('ConsultationService', () => {
  let service: ConsultationService;

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConsultationService(mockDb as any);
  });

  // Test the startConsultation method
  describe('startConsultation', () => {
    it('should create a new consultation with correct initial state', async () => {
      const expectedConsultation: Consultation = {
        id: 'mock-uuid',
        startTime: new Date(),
        endTime: null,
        status: ConsultationStatus.IN_PROGRESS,
        notes: [],
        summary: null,
      };

      // Mock the createConsultation method to return the expected consultation
      mockDb.createConsultation.mockResolvedValueOnce(expectedConsultation);

      // Call the startConsultation method
      const result = await service.startConsultation();

      // Assert that the createConsultation method was called once
      expect(mockDb.createConsultation).toHaveBeenCalledTimes(1);

      // Assert that the return the result without any changes
      expect(result).toEqual(expectedConsultation);

      // Assert that the return has the correct structure
      expect(result.status).toBe(ConsultationStatus.IN_PROGRESS);
      expect(result.endTime).toBeNull();
      expect(result.notes).toHaveLength(0);
    });
  });

  describe('addNote', () => {
    it('should throw error when adding note to completed consultation', async () => {
      const completedConsultation: Consultation = {
        id: 'test-id',
        startTime: new Date(),
        endTime: new Date(),
        status: ConsultationStatus.COMPLETED,
        notes: [],
        summary: null,
      };

      // Mock the findById method to return the completed consultation
      mockDb.findById.mockResolvedValueOnce(completedConsultation);

      // Call the addNote method and expect it to throw an error
      await expect(service.addNote('test-id', 'test note'))
        .rejects
        .toThrow(InvalidConsultationStateError);
      expect(mockDb.addNote).not.toHaveBeenCalled();
    });

    it('should add note to in-progress consultation', async () => {
      const consultation: Consultation = {
        id: 'test-id',
        startTime: new Date(),
        endTime: null,
        status: ConsultationStatus.IN_PROGRESS,
        notes: [],
        summary: null,
      };
      mockDb.findById.mockResolvedValueOnce(consultation);
      mockDb.addNote.mockResolvedValueOnce({
        ...consultation,
        notes: [{ id: 'mock-uuid', content: 'test note', timestamp: new Date(), consultationId: 'test-id', createdAt: new Date(), updatedAt: new Date() }],
      });
      
      await service.addNote('test-id', 'test note');
      expect(mockDb.addNote).toHaveBeenCalledWith('test-id', 'test note');
    });
  });

  describe('endConsultation', () => {
    it('should end consultation and generate summary', async () => {
      const consultation: Consultation = {
        id: 'test-id',
        startTime: new Date(),
        endTime: null,
        status: ConsultationStatus.IN_PROGRESS,
        notes: [{ id: 'mock-uuid', content: 'test note', timestamp: new Date(), consultationId: 'test-id', createdAt: new Date(), updatedAt: new Date() }],
        summary: null,
      };
      
      mockDb.findById.mockResolvedValueOnce(consultation);
      mockDb.updateStatus.mockResolvedValueOnce({
        ...consultation,
        endTime: new Date(),
        status: ConsultationStatus.COMPLETED,
      });
      mockDb.addSummary.mockImplementation(async (id, summary) => ({
        ...consultation,
        endTime: new Date(),
        status: ConsultationStatus.COMPLETED,
        summary: { id: 'mock-uuid', content: summary, consultationId: 'test-id', createdAt: new Date(), updatedAt: new Date() },
      }));

      const result = await service.endConsultation('test-id');

      expect(result.status).toBe(ConsultationStatus.COMPLETED);
      expect(result.endTime).not.toBeNull();
      expect(result.summary).not.toBeNull();
      expect(mockDb.updateStatus).toHaveBeenCalled();
      expect(mockDb.addSummary).toHaveBeenCalled();
    });

    it('should throw error when ending completed consultation', async () => {
      const completedConsultation: Consultation = {
        id: 'test-id',
        startTime: new Date(),
        endTime: new Date(),
        status: ConsultationStatus.COMPLETED,
        notes: [],
        summary: null,
      };
      mockDb.findById.mockResolvedValueOnce(completedConsultation);

      await expect(service.endConsultation('test-id'))
        .rejects
        .toThrow(InvalidConsultationStateError);
      expect(mockDb.updateStatus).not.toHaveBeenCalled();
      expect(mockDb.addSummary).not.toHaveBeenCalled();
    });
  });
}); 