import { Note } from "@prisma/client";

interface NotesListProps {
  notes: Note[];
}

export function NotesList({ notes }: NotesListProps) {
  if (notes.length === 0) {
    return <div className="text-gray-500 italic">No notes recorded yet.</div>;
  }

  return (
    <ul className="space-y-2">
      {notes.map((note, index) => (
        <li
          key={index}
          className="p-3 bg-gray-50 rounded border border-gray-200"
        >
          <p className="text-gray-800">{note.content}</p>
        </li>
      ))}
    </ul>
  );
}
