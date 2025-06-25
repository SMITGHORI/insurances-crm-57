
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Plus, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

const QuotationNotes = ({ quotationId }) => {
  const [notes, setNotes] = useState([
    {
      id: '1',
      content: 'Client is interested in adding dental coverage to the health insurance plan. Need to prepare revised quotation.',
      createdBy: 'Agent Smith',
      createdAt: '2025-06-02T14:30:00Z'
    },
    {
      id: '2',
      content: 'Discussed premium payment options. Client prefers monthly payment mode.',
      createdBy: 'Agent Smith',
      createdAt: '2025-06-01T10:15:00Z'
    },
    {
      id: '3',
      content: 'Initial quotation prepared based on client requirements gathered during consultation.',
      createdBy: 'Agent Smith',
      createdAt: '2025-06-01T09:30:00Z'
    }
  ]);

  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    const note = {
      id: Date.now().toString(),
      content: newNote,
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    setNotes([note, ...notes]);
    setNewNote('');
    toast.success('Note added successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Quotation Notes</h3>
        <p className="text-sm text-gray-600">Add and manage notes for this quotation</p>
      </div>

      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Note</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note here..."
            rows={4}
          />
          
          <Button onClick={handleAddNote} className="w-full">
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map(note => (
          <Card key={note.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>
              
              <p className="text-gray-800 mb-3">{note.content}</p>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <User size={12} />
                <span>by {note.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-500">Add the first note for this quotation</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuotationNotes;
