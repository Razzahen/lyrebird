import { Summary, Note } from "@prisma/client";

export interface Consultation {
  id: string;
  startTime: Date;
  endTime: Date | null;
  notes: Note[];
  status: ConsultationStatus;
  summary: Summary | null;
}

export enum ConsultationStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface IConsultationRepository {
  createConsultation(consultation: Consultation): Promise<Consultation>;
  updateStatus(
    id: string,
    status: ConsultationStatus,
    endTime?: Date
  ): Promise<Consultation>;
  addNote(id: string, content: string): Promise<Consultation>;
  addSummary(id: string, content: string): Promise<Consultation>;
  findById(id: string): Promise<Consultation | null>;
  list(): Promise<Consultation[]>;
}

export class ConsultationNotFoundError extends Error {
  constructor(id: string) {
    super(`Consultation with id ${id} not found`);
    this.name = "ConsultationNotFoundError";
  }
}

export class InvalidConsultationStateError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidConsultationStateError.prototype);
    this.name = "InvalidConsultationStateError";
  }
}
