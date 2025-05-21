
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

const ClaimNotes = ({ claim, setClaim }) => {
  const [newNote, setNewNote] = useState('');
  const [isInternal, setIsInternal] = useState(true);

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    const formattedDate = `${day} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentDate.getMonth()]} ${year}`;
    const formattedTime = `${hours}:${minutes}`;

    // Create new note
    const newNoteObject = {
      id: claim.notes.length + 1,
      author: 'Admin User', // In a real app, this would be the logged in user
      date: formattedDate,
      time: formattedTime,
      content: newNote,
      isInternal
    };

    // Update claim with new note
    setClaim({
      ...claim,
      notes: [newNoteObject, ...claim.notes]
    });

    // Clear input
    setNewNote('');
    toast.success('Note added successfully');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="newNote" className="text-lg font-semibold">Add Note</Label>
        <Textarea
          id="newNote"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter note..."
          className="h-24 mt-2"
        />
        <div className="flex items-center mt-2">
          <Checkbox
            id="isInternal"
            checked={isInternal}
            onCheckedChange={setIsInternal}
          />
          <Label htmlFor="isInternal" className="ml-2 cursor-pointer text-sm text-gray-600">
            Internal note (not visible to client)
          </Label>
        </div>
        <Button onClick={handleAddNote} className="mt-2">
          <StickyNote className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">Notes History</h2>
        
        {claim.notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notes added yet
          </div>
        ) : (
          <div className="space-y-3">
            {claim.notes.map(note => (
              <Card key={note.id} className={note.isInternal ? "border-l-4 border-l-blue-500" : ""}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="font-medium">{note.author}</span>
                      {note.isInternal && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Internal
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{note.date} {note.time}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimNotes;
