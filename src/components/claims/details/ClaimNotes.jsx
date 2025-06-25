
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Plus, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ClaimNotes = ({ claimId }) => {
  const [notes, setNotes] = useState([
    {
      id: '1',
      content: 'Initial assessment completed. Vehicle damage appears consistent with reported incident.',
      type: 'internal',
      priority: 'normal',
      createdBy: 'Agent John',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      content: 'Called client to discuss repair estimates. Client will provide additional receipts.',
      type: 'client_communication',
      priority: 'high',
      createdBy: 'Agent Smith',
      createdAt: '2024-01-16T14:20:00Z'
    },
    {
      id: '3',
      content: 'Medical reports received and reviewed. No major injuries reported.',
      type: 'internal',
      priority: 'normal',
      createdBy: 'Agent John',
      createdAt: '2024-01-18T09:15:00Z'
    }
  ]);

  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('internal');
  const [notePriority, setNotePriority] = useState('normal');

  const noteTypes = [
    { value: 'internal', label: 'Internal', color: 'bg-blue-100 text-blue-800' },
    { value: 'client_communication', label: 'Client Communication', color: 'bg-green-100 text-green-800' },
    { value: 'system', label: 'System', color: 'bg-gray-100 text-gray-800' }
  ];

  const notePriorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const getTypeBadge = (type) => {
    const noteType = noteTypes.find(t => t.value === type);
    return <Badge className={noteType?.color || 'bg-gray-100 text-gray-800'}>
      {noteType?.label || type}
    </Badge>;
  };

  const getPriorityBadge = (priority) => {
    const notePriority = notePriorities.find(p => p.value === priority);
    return <Badge className={notePriority?.color || 'bg-gray-100 text-gray-800'}>
      {notePriority?.label || priority}
    </Badge>;
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    const note = {
      id: Date.now().toString(),
      content: newNote,
      type: noteType,
      priority: notePriority,
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    setNotes([note, ...notes]);
    setNewNote('');
    setNoteType('internal');
    setNotePriority('normal');
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
        <h3 className="text-lg font-semibold">Claim Notes</h3>
        <p className="text-sm text-gray-600">Add and manage notes for this claim</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Note Type</label>
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {noteTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <Select value={notePriority} onValueChange={setNotePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notePriorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
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
                <div className="flex items-center space-x-2">
                  {getTypeBadge(note.type)}
                  {getPriorityBadge(note.priority)}
                </div>
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
            <p className="text-gray-500">Add the first note for this claim</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClaimNotes;
