import { useState } from "react";

interface NoteInputProps {
  onAddNote: (note: string) => Promise<void>;
  disabled: boolean;
}

export function NoteInput({ onAddNote, disabled }: NoteInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddNote(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder="Enter consultation note..."
          className="flex-1 p-2 border rounded disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={disabled || isSubmitting || !content.trim()}
          className={`px-4 py-2 rounded font-semibold flex items-center ${
            disabled || isSubmitting || !content.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isSubmitting ? (
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
              Adding...
            </>
          ) : (
            "Add Note"
          )}
        </button>
      </div>
    </form>
  );
}
