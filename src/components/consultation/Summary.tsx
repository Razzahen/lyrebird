interface SummaryProps {
  summary: string | null;
}

export function Summary({ summary }: SummaryProps) {
  if (!summary) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Consultation Summary</h2>
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
          {summary}
        </pre>
      </div>
    </div>
  );
}
