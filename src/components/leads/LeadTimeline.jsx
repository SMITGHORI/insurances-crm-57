
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  User,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from 'lucide-react';

const LeadTimeline = ({ lead }) => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [newEvent, setNewEvent] = useState({
    type: 'Call',
    outcome: '',
    nextAction: ''
  });

  // Use local timeline data (follow-ups and notes from lead)
  const timelineData = [
    ...(lead?.followUps || []).map(followUp => ({
      id: `followup-${followUp._id || followUp.id}`,
      event: `${followUp.type} Follow-up`,
      description: followUp.outcome,
      status: followUp.type.toLowerCase(),
      date: followUp.date ? new Date(followUp.date).toLocaleDateString() : 'Unknown',
      time: followUp.time || 'Unknown',
      user: followUp.createdBy || 'Unknown',
      nextAction: followUp.nextAction
    })),
    ...(lead?.notes || []).map(note => ({
      id: `note-${note._id || note.id}`,
      event: 'Note Added',
      description: note.content,
      status: 'note',
      date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Unknown',
      time: note.createdAt ? new Date(note.createdAt).toLocaleTimeString() : 'Unknown',
      user: note.createdBy || 'Unknown'
    }))
  ];

  const handleAddEvent = async () => {
    try {
      const currentDate = new Date();
      const newTimelineEvent = {
        id: `custom-${timelineData.length + 1}`,
        event: `${newEvent.type} Follow-up`,
        description: newEvent.outcome,
        status: newEvent.type.toLowerCase(),
        date: currentDate.toLocaleDateString(),
        time: currentDate.toLocaleTimeString(),
        user: 'Current User',
        nextAction: newEvent.nextAction
      };

      console.log('Adding timeline event:', newTimelineEvent);
      
      setShowAddEvent(false);
      setNewEvent({ type: 'Call', outcome: '', nextAction: '' });
    } catch (error) {
      console.error('Error adding timeline event:', error);
    }
  };

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'call':
        return <Phone className="h-6 w-6 text-blue-500 bg-blue-100 p-1 rounded-full" />;
      case 'email':
        return <Mail className="h-6 w-6 text-green-500 bg-green-100 p-1 rounded-full" />;
      case 'meeting':
        return <User className="h-6 w-6 text-purple-500 bg-purple-100 p-1 rounded-full" />;
      case 'sms':
      case 'whatsapp':
        return <MessageSquare className="h-6 w-6 text-emerald-500 bg-emerald-100 p-1 rounded-full" />;
      case 'note':
        return <FileText className="h-6 w-6 text-amber-500 bg-amber-100 p-1 rounded-full" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500 bg-gray-100 p-1 rounded-full" />;
    }
  };

  // Sort timeline events by date and time
  const sortedTimeline = [...timelineData].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA; // Most recent first
  });

  const getFilteredTimeline = () => {
    if (eventFilter === 'all') return sortedTimeline;
    return sortedTimeline.filter(event => event.status === eventFilter);
  };

  const filteredTimeline = getFilteredTimeline();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Lead Timeline</h2>
        <div className="flex gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Events</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="note">Notes</option>
          </select>
          
          <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Timeline Event</DialogTitle>
                <DialogDescription>
                  Add a follow-up or interaction to the lead timeline.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <select
                    id="event-type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({...prev, type: e.target.value}))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-outcome">Outcome</Label>
                  <Textarea
                    id="event-outcome"
                    value={newEvent.outcome}
                    onChange={(e) => setNewEvent(prev => ({...prev, outcome: e.target.value}))}
                    placeholder="Describe the outcome of this interaction..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-action">Next Action</Label>
                  <Input
                    id="next-action"
                    value={newEvent.nextAction}
                    onChange={(e) => setNewEvent(prev => ({...prev, nextAction: e.target.value}))}
                    placeholder="What's the next action to take?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddEvent}
                  disabled={!newEvent.outcome}
                >
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {filteredTimeline.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {eventFilter === 'all' ? 'No timeline events yet' : `No ${eventFilter} events found`}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[17px] top-6 bottom-5 w-0.5 bg-gray-200"></div>
          {filteredTimeline.map((event, index) => (
            <div key={event.id || index} className="relative pl-10 pb-6">
              <div className="absolute left-0 mt-1">
                {getTimelineIcon(event.status)}
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium">{event.event}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{event.date} {event.time}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{event.description}</p>
                {event.nextAction && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <span className="font-medium text-blue-800">Next Action: </span>
                    <span className="text-blue-700">{event.nextAction}</span>
                  </div>
                )}
                {event.user && (
                  <p className="text-xs text-gray-500 mt-2">
                    by {event.user}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadTimeline;
