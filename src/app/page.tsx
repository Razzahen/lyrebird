"use client";

import { useState, useEffect } from "react";
import { Controls } from "@/components/consultation/Controls";
import { NoteInput } from "@/components/consultation/NoteInput";
import { NotesList } from "@/components/consultation/NotesList";
import { Summary } from "@/components/consultation/Summary";
import {
  startConsultation,
  endConsultation,
  addNote,
  listConsultations,
} from "@/lib/actions/consultation";
import { Consultation } from "@/lib/types/consultation";

export default function ConsultationPage() {
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const currentConsultation = consultations.find(
    (c) => c.id === consultationId
  );

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      const consultationList = await listConsultations();
      setConsultations(consultationList);
    } catch (err) {
      console.error("Error loading consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    try {
      const consultation = await startConsultation();
      setConsultationId(consultation.id);
      setSummary(null);
      await loadConsultations();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to start consultation"
      );
      console.error("Error starting consultation:", err);
    }
  };

  const handleEndConsultation = async () => {
    if (!consultationId) return;

    try {
      const updatedConsultation = await endConsultation(consultationId);
      setSummary(updatedConsultation.summary?.content || null);
      setConsultationId(null);
      await loadConsultations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to end consultation");
      console.error("Error ending consultation:", err);
    }
  };

  const handleAddNote = async (note: string) => {
    if (!consultationId) return;

    try {
      await addNote(consultationId, note);
      await loadConsultations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add note");
      console.error("Error adding note:", err);
    }
  };

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Clinical Consultation
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and record patient consultations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <Controls
              consultationId={consultationId}
              isActive={!!consultationId}
              onStart={handleStartConsultation}
              onEnd={handleEndConsultation}
            />
          </div>

          {consultationId && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Consultation Notes
              </h2>
              <NoteInput onAddNote={handleAddNote} disabled={!consultationId} />
              <div className="mt-4">
                <NotesList notes={currentConsultation?.notes || []} />
              </div>
            </div>
          )}

          {summary && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <Summary summary={summary} />
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Consultation History
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Loading consultations...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">No consultations yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">
                        Started:{" "}
                        {new Date(consultation.startTime).toLocaleString()}
                      </p>
                      {consultation.endTime && (
                        <p className="text-sm text-gray-600">
                          Ended:{" "}
                          {new Date(consultation.endTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        consultation.status === "IN_PROGRESS"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {consultation.status}
                    </span>
                  </div>
                  {consultation.notes.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium">Notes:</p>
                      <ul className="list-disc list-inside">
                        {consultation.notes.map((note, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {note.content}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {consultation.summary && (
                    <div>
                      <p className="font-medium">Summary:</p>
                      <p className="text-sm text-gray-600">
                        {consultation.summary.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
