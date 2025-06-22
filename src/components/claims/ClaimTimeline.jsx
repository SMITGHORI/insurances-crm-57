import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  FileText,
  Check,
  X,
  Clock,
  AlertTriangle,
  CircleDollarSign,
  FileCheck
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
import { Plus, Filter } from 'lucide-react';
import { useClaimTimelineBackend, useAddClaimNoteBackend } from '../../hooks/useClaimsBackend';

const ClaimTimeline = ({ claim }) => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [newEvent, setNewEvent] = useState({
    event: '',
    description: '',
    status: 'info'
  });

  const { data: timeline, isLoading, refetch } = useClaimTimelineBackend(claim._id);
  const addNoteMutation = useAddClaimNoteBackend();

  const handleAddEvent = async () => {
    try {
      await addNoteMutation.mutateAsync({
        claimId: claim._id,
        noteData: {
          content: newEvent.description,
          title: newEvent.event,
          type: 'timeline_event',
          isPrivate: false
        }
      });
      setShowAddEvent(false);
      setNewEvent({ event: '', description: '', status: 'info' });
      refetch();
    } catch (error) {
      console.error('Error adding timeline event:', error);
    }
  };

  // Safely get timeline array, defaulting to empty array if undefined
  const timeline = claim?.timeline || [];

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'incident':
        return <AlertTriangle className="h-6 w-6 text-amber-500 bg-amber-100 p-1 rounded-full" />;
      case 'filed':
        return <FileText className="h-6 w-6 text-blue-500 bg-blue-100 p-1 rounded-full" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-purple-500 bg-purple-100 p-1 rounded-full" />;
      case 'approved':
        return <Check className="h-6 w-6 text-green-500 bg-green-100 p-1 rounded-full" />;
      case 'rejected':
        return <X className="h-6 w-6 text-red-500 bg-red-100 p-1 rounded-full" />;
      case 'settled':
        return <CircleDollarSign className="h-6 w-6 text-emerald-500 bg-emerald-100 p-1 rounded-full" />;
      case 'document':
        return <FileCheck className="h-6 w-6 text-blue-500 bg-blue-100 p-1 rounded-full" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500 bg-gray-100 p-1 rounded-full" />;
    }
  };

  // Sort timeline events by date and time if timeline exists
  const sortedTimeline = timeline.length > 0 ? [...timeline].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA; // Most recent first
  }) : [];

  const getFilteredTimeline = () => {
    if (eventFilter === 'all') return sortedTimeline;
    return sortedTimeline.filter(event => event.status === eventFilter);
  };

  const filteredTimeline = getFilteredTimeline();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Claim Timeline</h2>
        <div className="flex gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Events</option>
            <option value="incident">Incident</option>
            <option value="filed">Filed</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="settled">Settled</option>
            <option value="document">Documents</option>
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
                  Add a custom event to the claim timeline.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.event}
                    onChange={(e) => setNewEvent(prev => ({...prev, event: e.target.value}))}
                    placeholder="Enter event title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({...prev, description: e.target.value}))}
                    placeholder="Enter event description..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-status">Event Type</Label>
                  <select
                    id="event-status"
                    value={newEvent.status}
                    onChange={(e) => setNewEvent(prev => ({...prev, status: e.target.value}))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="info">Information</option>
                    <option value="processing">Processing</option>
                    <option value="document">Document</option>
                    <option value="communication">Communication</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddEvent}
                  disabled={!newEvent.event || !newEvent.description || addNoteMutation.isLoading}
                >
                  {addNoteMutation.isLoading ? 'Adding...' : 'Add Event'}
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

export default ClaimTimeline;
