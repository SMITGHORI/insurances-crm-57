
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote, Plus, User } from 'lucide-react';
import { toast } from 'sonner';

const ClaimNotes = ({ claim, setClaim }) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    // Get current claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    }
    
    // Find the claim to update
    const claimIndex = claimsList.findIndex(c => c.id === claim.id);
    
    if (claimIndex !== -1) {
      // Initialize notes array if it doesn't exist
      if (!claimsList[claimIndex].notes) {
        claimsList[claimIndex].notes = [];
      }
      
      // Add new note
      const newNoteObj = {
        text: newNote,
        by: 'Admin',
        timestamp: new Date().toISOString()
      };
      
      const updatedNotesList = [
        ...claimsList[claimIndex].notes,
        newNoteObj
      ];
      
      // Update the claim with new notes
      claimsList[claimIndex].notes = updatedNotesList;
      
      // Save updated claims list back to localStorage
      localStorage.setItem('claimsData', JSON.stringify(claimsList));
      
      // Update the claim in state
      setClaim({
        ...claim,
        notes: updatedNotesList
      });
      
      // Reset form
      setNewNote('');
      
      toast.success('Note added successfully');
    } else {
      toast.error('Failed to add note');
    }
  };

  const notes = claim.notes || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your note here..."
            className="min-h-[100px]"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAddNote}>
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes History</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {[...notes].reverse().map((note, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
                  <p className="whitespace-pre-wrap">{note.text}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <User className="mr-1 h-4 w-4" />
                    <span className="font-medium mr-1">{note.by}</span>
                    <span className="mx-1">•</span>
                    {new Date(note.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <StickyNote className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Notes Yet</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No notes have been added for this claim yet. Add a note to keep track of important information.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimNotes;
