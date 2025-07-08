
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash } from 'lucide-react';
import { useUpdatePolicy } from '@/hooks/usePolicies';

const PolicyNotes = ({ policy, setPolicy }) => {
  const [newNote, setNewNote] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const updatePolicyMutation = useUpdatePolicy();

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    const updatedPolicy = { ...policy };
    
    if (!updatedPolicy.notes) {
      updatedPolicy.notes = [];
    }
    
    // Add the new note
    updatedPolicy.notes.push({
      id: Date.now(),
      text: newNote,
      by: 'Admin',
      timestamp: new Date().toISOString()
    });
    
    try {
      await updatePolicyMutation.mutateAsync({
        id: policy.id,
        ...updatedPolicy
      });
      
      // Update local state
      setPolicy(updatedPolicy);
      setNewNote('');
      setShowAddForm(false);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    const updatedPolicy = { ...policy };
    
    // Filter out the note to delete
    updatedPolicy.notes = updatedPolicy.notes.filter(note => note.id !== noteId);
    
    try {
      await updatePolicyMutation.mutateAsync({
        id: policy.id,
        ...updatedPolicy
      });
      
      // Update local state
      setPolicy(updatedPolicy);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Policy Notes</CardTitle>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
        >
          <Plus size={16} className="mr-2" /> Add Note
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 border rounded-md p-4">
            <Textarea 
              value={newNote} 
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter note..."
              rows={3}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Save Note
              </Button>
            </div>
          </div>
        )}

        {policy.notes && policy.notes.length > 0 ? (
          <div className="space-y-4">
            {policy.notes.map((note) => (
              <div 
                key={note.id} 
                className="bg-gray-50 rounded-md p-4 relative"
              >
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute top-2 right-2 text-red-500 p-1 h-auto" 
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash size={16} />
                </Button>
                <p className="mb-2">{note.text}</p>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>By: {note.by}</span>
                  <span>{formatDate(note.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No notes added yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PolicyNotes;
