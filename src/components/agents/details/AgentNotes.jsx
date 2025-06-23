
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, StickyNote, Trash2, Edit, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

const AgentNotes = ({ agentId }) => {
  const [notes, setNotes] = useState([
    {
      id: '1',
      content: 'Agent shows excellent performance in life insurance sales. Consistently exceeding monthly targets.',
      priority: 'medium',
      tags: ['performance', 'targets'],
      createdBy: 'Manager',
      createdAt: '2024-01-15T10:30:00Z',
      isPrivate: false
    },
    {
      id: '2',
      content: 'Client feedback indicates strong communication skills and professional approach.',
      priority: 'high',
      tags: ['feedback', 'communication'],
      createdBy: 'Admin',
      createdAt: '2024-01-10T14:20:00Z',
      isPrivate: false
    }
  ]);

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    content: '',
    priority: 'medium',
    tags: '',
    isPrivate: false
  });

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800'
  };

  const handleAddNote = () => {
    if (!noteForm.content.trim()) {
      toast.error('Please enter note content');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      content: noteForm.content,
      priority: noteForm.priority,
      tags: noteForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      isPrivate: noteForm.isPrivate
    };

    setNotes(prev => [newNote, ...prev]);
    setNoteForm({ content: '', priority: 'medium', tags: '', isPrivate: false });
    setIsNoteOpen(false);
    toast.success('Note added successfully');
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Note deleted successfully');
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Notes</h3>
          <p className="text-sm text-gray-600">Keep track of important information about this agent</p>
        </div>
        <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Add a new note for this agent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter note content..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={noteForm.priority} 
                    onValueChange={(value) => setNoteForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={noteForm.tags}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="performance, feedback"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNoteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                <StickyNote size={16} className="mr-2" />
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {notes.map(note => (
          <Card key={note.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <Badge className={priorityColors[note.priority]}>
                    {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                  </Badge>
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
              
              <p className="text-gray-800 mb-3">{note.content}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User size={14} />
                  <span>by {note.createdBy}</span>
                </div>
                <span>{formatDate(note.createdAt)}</span>
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
            <p className="text-gray-500">Add your first note to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentNotes;
