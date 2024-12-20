"use server";

import { getConsultationService } from "../services/consultation";
import { Consultation } from "../types/consultation";

const consultationService = getConsultationService();

export async function startConsultation(): Promise<Consultation> {
  return consultationService.startConsultation();
}

export async function endConsultation(id: string): Promise<Consultation> {
  return consultationService.endConsultation(id);
}

export async function addNote(id: string, note: string): Promise<Consultation> {
  return consultationService.addNote(id, note);
}

export async function listConsultations(): Promise<Consultation[]> {
  return consultationService.listConsultations();
}
