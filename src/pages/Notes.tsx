// src/pages/Notes.tsx
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast"; // Add react-hot-toast library
import debounce from "lodash.debounce"; // Add lodash.debounce for search

interface Note {
  id: number;
  title: string;
  content: string;
  created_at?: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch notes
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching notes:", error.message);
    else setNotes(data || []);
  };

  useEffect(() => {
    fetchNotes();

    // Realtime subscription
    const subscription = supabase
      .channel('custom-all-insert')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add/Edit note
  const handleSaveNote = async () => {
    if (!titleInput.trim() || !contentInput.trim()) {
      toast.error("Title and content cannot be empty");
      return;
    }

    if (isEditing && currentNote) {
      const { data, error } = await supabase
        .from("notes")
        .update({ title: titleInput, content: contentInput })
        .eq("id", currentNote.id)
        .select()
        .single();
      if (error) toast.error("Error updating note");
      else {
        setNotes((prev) => prev.map((n) => (n.id === data.id ? data : n)));
        toast.success("Note updated!");
      }
    } else {
      const { data, error } = await supabase
        .from("notes")
        .insert([{ title: titleInput, content: contentInput }])
        .select()
        .single();
      if (error) toast.error("Error adding note");
      else {
        setNotes((prev) => [data, ...prev]);
        toast.success("Note added!");
      }
    }

    setTitleInput("");
    setContentInput("");
    setCurrentNote(null);
    setIsEditing(false);
    setShowModal(false);
  };

  // Delete note
  const handleDeleteNote = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) toast.error("Error deleting note");
    else {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast.success("Note deleted!");
    }
  };

  // Filtered notes with debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => setSearch(value), 300),
    []
  );

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  // Open Add/Edit modal
  const openAddNote = () => {
    setIsEditing(false);
    setCurrentNote(null);
    setTitleInput("");
    setContentInput("");
    setShowModal(true);
  };

  const openEditNote = (note: Note) => {
    setIsEditing(true);
    setCurrentNote(note);
    setTitleInput(note.title);
    setContentInput(note.content);
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Your Notes & Resources</h2>

      {/* Search Bar */}
      <Input
        placeholder="Search notes..."
        className="max-w-md"
        onChange={(e) => debouncedSearch(e.target.value)}
      />

      {/* Notes Grid */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition relative">
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{note.content}</p>
            </CardContent>
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditNote(note)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteNote(note.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-2">
              {isEditing ? "Edit Note" : "Add Note"}
            </h3>
            <Input
              placeholder="Title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Content"
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2 justify-end">
              <Button onClick={handleSaveNote}>
                {isEditing ? "Save" : "Add"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setCurrentNote(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Floating Button */}
      {!showModal && (
        <Button
          className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white"
          onClick={openAddNote}
        >
          + Add Note
        </Button>
      )}
    </div>
  );
};

export default Notes;
