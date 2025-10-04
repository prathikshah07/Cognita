// src/pages/Notes.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const Notes = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: "Math - Integration", content: "Notes on integration formulas" },
    { id: 2, title: "Physics - Thermodynamics", content: "Laws of thermodynamics" },
    { id: 3, title: "History - WW2", content: "Causes and consequences" },
  ]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Your Notes & Resources</h2>

      {/* Search Bar */}
      <Input placeholder="Search notes or resources..." className="max-w-md" />

      {/* Notes Grid */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {notes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Note Button */}
      <Button className="fixed bottom-16 right-6 p-4 rounded-full bg-blue-600 text-white">
        + Add Note
      </Button>
    </div>
  );
};

export default Notes;
