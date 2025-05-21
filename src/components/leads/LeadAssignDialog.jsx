
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Dummy agents data
const agents = [
  {
    id: 1,
    name: 'Raj Malhotra',
    email: 'raj.malhotra@example.com',
    role: 'Senior Agent',
    avatar: 'RM'
  },
  {
    id: 2,
    name: 'Anita Kumar',
    email: 'anita.kumar@example.com',
    role: 'Insurance Specialist',
    avatar: 'AK'
  },
  {
    id: 3,
    name: 'Vikram Mehta',
    email: 'vikram.mehta@example.com',
    role: 'Customer Relationship Manager',
    avatar: 'VM'
  }
];

const LeadAssignDialog = ({ lead, open, onOpenChange }) => {
  const [selectedAgent, setSelectedAgent] = useState(
    agents.find(agent => agent.name === lead?.assignedTo)?.id || ''
  );

  const handleAssign = () => {
    if (!selectedAgent) {
      toast.error('Please select an agent to assign this lead');
      return;
    }

    const agent = agents.find(a => a.id === selectedAgent);
    toast.success(`Lead assigned to ${agent.name} successfully`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" /> 
            Assign Lead
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            Select an agent to assign this lead to:
          </p>
          
          <RadioGroup value={selectedAgent} onValueChange={setSelectedAgent}>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`flex items-start space-x-4 p-3 rounded-md border ${
                    selectedAgent === agent.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={agent.id} id={`agent-${agent.id}`} />
                  <Label htmlFor={`agent-${agent.id}`} className="flex flex-1 items-center space-x-3 cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {agent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                      <p className="text-xs text-gray-400">{agent.role}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleAssign}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadAssignDialog;
