import {
  Consultation,
  ConsultationStatus,
  IConsultationRepository,
} from "../types/consultation";
import { prisma } from "./prisma";

export class ConsultationDB implements IConsultationRepository {
  async createConsultation(consultation: Consultation): Promise<Consultation> {
    const created = await prisma.consultation.create({
      data: {
        id: consultation.id,
        startTime: consultation.startTime,
        endTime: consultation.endTime,
        status: consultation.status,
      },
      include: { notes: true, summary: true },
    });
    return this.mapToConsultation(created);
  }

  async updateStatus(
    id: string,
    status: ConsultationStatus,
    endTime?: Date
  ): Promise<Consultation> {
    const updated = await prisma.consultation.update({
      where: { id },
      data: { status, ...(endTime && { endTime }) },
      include: { notes: true, summary: true },
    });
    return this.mapToConsultation(updated);
  }

  async addNote(id: string, content: string): Promise<Consultation> {
    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        notes: {
          create: { content, timestamp: new Date() },
        },
      },
      include: { notes: true, summary: true },
    });
    return this.mapToConsultation(updated);
  }

  async addSummary(id: string, content: string): Promise<Consultation> {
    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        summary: {
          create: { content },
        },
      },
      include: { notes: true, summary: true },
    });
    return this.mapToConsultation(updated);
  }

  async findById(id: string): Promise<Consultation | null> {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        notes: true,
        summary: true,
      },
    });

    if (!consultation) return null;

    return {
      id: consultation.id,
      startTime: consultation.startTime,
      endTime: consultation.endTime,
      status: consultation.status as ConsultationStatus,
      notes: consultation.notes,
      summary: consultation.summary,
    };
  }

  private mapToConsultation(data: any): Consultation {
    return {
      id: data.id,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status as ConsultationStatus,
      notes: data.notes,
      summary: data.summary,
    };
  }

  async list(): Promise<Consultation[]> {
    const consultations = await prisma.consultation.findMany({
      include: {
        notes: true,
        summary: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return consultations.map((consultation) => ({
      id: consultation.id,
      startTime: consultation.startTime,
      endTime: consultation.endTime,
      status: consultation.status as ConsultationStatus,
      notes: consultation.notes,
      summary: consultation.summary,
    }));
  }
}

// Singleton instance
let db: ConsultationDB | null = null;

export function getConsultationDB(): ConsultationDB {
  if (!db) {
    db = new ConsultationDB();
  }
  return db;
}
