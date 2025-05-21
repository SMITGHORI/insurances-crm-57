
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';

const EndorsementHistory = ({ policy, setPolicy }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEndorsement, setNewEndorsement] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    description: '',
    document: null
  });

  const handleAddEndorsement = () => {
    // Validation
    if (!newEndorsement.type || !newEndorsement.date || !newEndorsement.effectiveDate || !newEndorsement.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedPolicy = { ...policy };
    
    if (!updatedPolicy.endorsements) {
      updatedPolicy.endorsements = [];
    }
    
    // Add the new endorsement
    updatedPolicy.endorsements.push({
      ...newEndorsement,
      id: Date.now() // Simple ID for the endorsement entry
    });
    
    // Add history entry
    if (!updatedPolicy.history) {
      updatedPolicy.history = [];
    }
    
    updatedPolicy.history.push({
      action: 'Endorsement Added',
      by: 'Admin',
      timestamp: new Date().toISOString(),
      details: `${newEndorsement.type} endorsement added, effective ${new Date(newEndorsement.effectiveDate).toLocaleDateString()}`
    });
    
    // Save to localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    if (storedPoliciesData) {
      const policiesList = JSON.parse(storedPoliciesData);
      const policyIndex = policiesList.findIndex(p => p.id === policy.id);
      
      if (policyIndex !== -1) {
        policiesList[policyIndex] = updatedPolicy;
        localStorage.setItem('policiesData', JSON.stringify(policiesList));
      }
    }
    
    // Update state
    setPolicy(updatedPolicy);
    setShowAddForm(false);
    setNewEndorsement({
      type: '',
      date: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      description: '',
      document: null
    });
    
    toast.success('Endorsement added successfully');
  };

  const handleDeleteEndorsement = (endorsementId) => {
    const updatedPolicy = { ...policy };
    
    // Filter out the endorsement to delete
    updatedPolicy.endorsements = updatedPolicy.endorsements.filter(e => e.id !== endorsementId);
    
    // Add history entry
    if (!updatedPolicy.history) {
      updatedPolicy.history = [];
    }
    
    updatedPolicy.history.push({
      action: 'Endorsement Deleted',
      by: 'Admin',
      timestamp: new Date().toISOString(),
      details: `Endorsement record deleted`
    });
    
    // Save to localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    if (storedPoliciesData) {
      const policiesList = JSON.parse(storedPoliciesData);
      const policyIndex = policiesList.findIndex(p => p.id === policy.id);
      
      if (policyIndex !== -1) {
        policiesList[policyIndex] = updatedPolicy;
        localStorage.setItem('policiesData', JSON.stringify(policiesList));
      }
    }
    
    // Update state
    setPolicy(updatedPolicy);
    toast.success('Endorsement deleted successfully');
  };

  const handleDocumentUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewEndorsement({
        ...newEndorsement,
        document: {
          name: file.name,
          type: file.type,
          size: file.size,
          url: event.target.result,
          uploadDate: new Date().toISOString()
        }
      });
      toast.success('Document uploaded');
    };
    
    reader.onerror = () => {
      toast.error('Failed to process document');
    };
    
    reader.readAsDataURL(file);
  };

  const handleDownload = (endorsement) => {
    if (!endorsement.document || !endorsement.document.url) {
      toast.error('Document not available for download');
      return;
    }
    
    const link = endorsement.document.url;
    const fileName = endorsement.document.name || `endorsement-${endorsement.type}.${endorsement.document.type.split('/')[1]}`;
    
    const a = document.createElement('a');
    a.href = link;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const endorsementTypes = [
    'Name Change',
    'Address Change',
    'Sum Assured Update',
    'Nominee Change',
    'Coverage Addition',
    'Coverage Removal',
    'Policy Term Change',
    'Premium Mode Change',
    'Error Correction',
    'Other'
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Endorsements</CardTitle>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
        >
          <Plus size={16} className="mr-2" /> New Endorsement
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 border rounded-md p-4">
            <h3 className="font-medium mb-4">Add New Endorsement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endorsement-type">Endorsement Type</Label>
                <Select 
                  onValueChange={(value) => setNewEndorsement({...newEndorsement, type: value})} 
                  defaultValue={newEndorsement.type}
                >
                  <SelectTrigger id="endorsement-type">
                    <SelectValue placeholder="Select endorsement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {endorsementTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endorsement-date">Endorsement Date</Label>
                <Input 
                  id="endorsement-date"
                  type="date" 
                  value={newEndorsement.date} 
                  onChange={(e) => setNewEndorsement({...newEndorsement, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effective-date">Effective Date</Label>
                <Input 
                  id="effective-date"
                  type="date" 
                  value={newEndorsement.effectiveDate} 
                  onChange={(e) => setNewEndorsement({...newEndorsement, effectiveDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endorsement-document">Upload Document (optional)</Label>
                <Input 
                  id="endorsement-document"
                  type="file" 
                  onChange={(e) => handleDocumentUpload(e.target.files[0])} 
                  accept="application/pdf,image/*"
                />
                {newEndorsement.document && (
                  <p className="text-xs text-gray-500 mt-1">
                    {newEndorsement.document.name} ({Math.round(newEndorsement.document.size/1024)} KB)
                  </p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="endorsement-description">Description</Label>
                <Textarea 
                  id="endorsement-description"
                  value={newEndorsement.description} 
                  onChange={(e) => setNewEndorsement({...newEndorsement, description: e.target.value})}
                  placeholder="Describe the endorsement details..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddEndorsement}>
                Save Endorsement
              </Button>
            </div>
          </div>
        )}

        {policy.endorsements && policy.endorsements.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policy.endorsements.map((endorsement) => (
                <TableRow key={endorsement.id}>
                  <TableCell>{endorsement.type}</TableCell>
                  <TableCell>{new Date(endorsement.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(endorsement.effectiveDate).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{endorsement.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {endorsement.document && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDownload(endorsement)}
                        >
                          <Download size={16} />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500" 
                        onClick={() => handleDeleteEndorsement(endorsement.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No endorsement history found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EndorsementHistory;
