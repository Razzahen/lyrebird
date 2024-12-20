import {
  Consultation,
  ConsultationStatus,
  ConsultationNotFoundError,
  InvalidConsultationStateError,
} from "../types/consultation";
import { getConsultationDB } from "../database/consultation";

function generateConsultationSummary(consultation: Consultation): string {
  const duration = consultation.endTime
    ? Math.round(
        (consultation.endTime.getTime() - consultation.startTime.getTime()) /
          1000
      )
    : 0;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationText =
    minutes > 0
      ? `${minutes} minutes ${seconds} seconds`
      : `${seconds} seconds`;

  const notesSummary = consultation.notes
    .map(
      (note) =>
        `• ${note.content} (${new Date(note.timestamp).toLocaleTimeString()})`
    )
    .join("\n");

  return `
Consultation Summary
-------------------
Started: ${consultation.startTime.toLocaleString()}
Duration: ${durationText}
Status: ${consultation.status}

Notes:
${notesSummary}

Generated: ${new Date().toLocaleString()}
  `.trim();
}

export class ConsultationService {
  constructor(private db = getConsultationDB()) {}

  async startConsultation(): Promise<Consultation> {
    const consultation: Consultation = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      endTime: null,
      status: ConsultationStatus.IN_PROGRESS,
      notes: [],
      summary: null,
    };
    return this.db.createConsultation(consultation);
  }

  async endConsultation(id: string): Promise<Consultation> {
    const consultation = await this.getConsultation(id);
    if (consultation.status !== ConsultationStatus.IN_PROGRESS) {
      throw new InvalidConsultationStateError(
        "Consultation is not in progress"
      );
    }

    const updated = await this.db.updateStatus(
      id,
      ConsultationStatus.COMPLETED,
      new Date()
    );

    const summary = generateConsultationSummary(updated);
    return this.db.addSummary(id, summary);
  }

  async addNote(id: string, content: string): Promise<Consultation> {
    const consultation = await this.getConsultation(id);
    if (consultation.status !== ConsultationStatus.IN_PROGRESS) {
      throw new InvalidConsultationStateError(
        "Cannot add notes to a completed consultation"
      );
    }
    return this.db.addNote(id, content);
  }

  async getConsultation(id: string): Promise<Consultation> {
    const consultation = await this.db.findById(id);
    if (!consultation) {
      throw new ConsultationNotFoundError(id);
    }
    return consultation;
  }

  async listConsultations(): Promise<Consultation[]> {
    return this.db.list();
  }
}

let service: ConsultationService | null = null;

export function getConsultationService(): ConsultationService {
  if (!service) {
    service = new ConsultationService(getConsultationDB());
  }
  return service;
}
