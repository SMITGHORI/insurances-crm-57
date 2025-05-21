
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Trash, Edit, Check, X } from 'lucide-react';
import { generateMemberId } from '@/utils/idGenerator';
import { toast } from 'sonner';

const PolicyMembers = ({ policy, setPolicy }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberData, setMemberData] = useState({
    name: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    relation: '',
    phone: '',
    email: '',
    bloodGroup: '',
    anniversaryDate: '',
    maritalStatus: ''
  });

  const handleAddMember = () => {
    if (!memberData.name) {
      toast.error("Member name is required");
      return;
    }

    if (!policy.members) {
      policy.members = [];
    }

    const members = [...policy.members];
    const memberId = generateMemberId(policy.id, members);

    if (editingMemberId) {
      // Edit existing member
      const memberIndex = members.findIndex(m => m.memberId === editingMemberId);
      if (memberIndex !== -1) {
        members[memberIndex] = {
          ...members[memberIndex],
          ...memberData,
          memberId: editingMemberId
        };
      }
    } else {
      // Add new member
      members.push({
        ...memberData,
        memberId
      });
    }

    // Get current policies from localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    let policiesList = [];
    
    if (storedPoliciesData) {
      policiesList = JSON.parse(storedPoliciesData);
    }
    
    // Find the policy and update it
    const policyIndex = policiesList.findIndex(p => p.id === policy.id);
    if (policyIndex !== -1) {
      policiesList[policyIndex].members = members;
      
      // Add history entry
      if (!policiesList[policyIndex].history) {
        policiesList[policyIndex].history = [];
      }
      
      policiesList[policyIndex].history.push({
        action: editingMemberId ? 'Member Updated' : 'Member Added',
        by: 'Admin',
        timestamp: new Date().toISOString(),
        details: `${editingMemberId ? 'Updated' : 'Added'} member: ${memberData.name}`
      });
      
      // Save back to localStorage
      localStorage.setItem('policiesData', JSON.stringify(policiesList));
      
      // Update state
      setPolicy({
        ...policy,
        members: members
      });
      
      // Reset form
      setMemberData({
        name: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        relation: '',
        phone: '',
        email: '',
        bloodGroup: '',
        anniversaryDate: '',
        maritalStatus: ''
      });
      setShowForm(false);
      setEditingMemberId(null);
      
      toast.success(`Member ${editingMemberId ? 'updated' : 'added'} successfully`);
    }
  };

  const handleDeleteMember = (memberId) => {
    if (!policy.members) return;
    
    const members = policy.members.filter(m => m.memberId !== memberId);
    
    // Get current policies from localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    let policiesList = [];
    
    if (storedPoliciesData) {
      policiesList = JSON.parse(storedPoliciesData);
    }
    
    // Find the policy and update it
    const policyIndex = policiesList.findIndex(p => p.id === policy.id);
    if (policyIndex !== -1) {
      const memberName = policy.members.find(m => m.memberId === memberId)?.name || 'Unknown';
      
      policiesList[policyIndex].members = members;
      
      // Add history entry
      if (!policiesList[policyIndex].history) {
        policiesList[policyIndex].history = [];
      }
      
      policiesList[policyIndex].history.push({
        action: 'Member Removed',
        by: 'Admin',
        timestamp: new Date().toISOString(),
        details: `Removed member: ${memberName}`
      });
      
      // Save back to localStorage
      localStorage.setItem('policiesData', JSON.stringify(policiesList));
      
      // Update state
      setPolicy({
        ...policy,
        members: members
      });
      
      toast.success(`Member removed successfully`);
    }
  };

  const handleEditMember = (member) => {
    setMemberData({
      name: member.name || '',
      age: member.age || '',
      dateOfBirth: member.dateOfBirth || '',
      gender: member.gender || '',
      relation: member.relation || '',
      phone: member.phone || '',
      email: member.email || '',
      bloodGroup: member.bloodGroup || '',
      anniversaryDate: member.anniversaryDate || '',
      maritalStatus: member.maritalStatus || ''
    });
    setEditingMemberId(member.memberId);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setMemberData({
      name: '',
      age: '',
      dateOfBirth: '',
      gender: '',
      relation: '',
      phone: '',
      email: '',
      bloodGroup: '',
      anniversaryDate: '',
      maritalStatus: ''
    });
    setEditingMemberId(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberData({
      ...memberData,
      [name]: value
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Policy Members</CardTitle>
          <CardDescription>Manage insured members for this policy</CardDescription>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            size="sm"
            className="h-8"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Member
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showForm ? (
          <div className="bg-gray-50 p-4 rounded-md mb-4 border">
            <h3 className="font-medium mb-3">
              {editingMemberId ? 'Edit Member' : 'Add New Member'}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name*</label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="Full name"
                  value={memberData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="relation" className="block text-sm font-medium mb-1">Relation to Primary</label>
                <select 
                  id="relation"
                  name="relation"
                  className="w-full px-3 py-2 border rounded-md"
                  value={memberData.relation}
                  onChange={handleInputChange}
                >
                  <option value="">Select Relation</option>
                  <option value="Self">Self</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium mb-1">Age</label>
                <Input 
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Age in years"
                  value={memberData.age}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">Date of Birth</label>
                <Input 
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={memberData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
                <select 
                  id="gender"
                  name="gender"
                  className="w-full px-3 py-2 border rounded-md"
                  value={memberData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium mb-1">Blood Group</label>
                <select 
                  id="bloodGroup"
                  name="bloodGroup"
                  className="w-full px-3 py-2 border rounded-md"
                  value={memberData.bloodGroup}
                  onChange={handleInputChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                <Input 
                  id="phone"
                  name="phone"
                  placeholder="Contact number"
                  value={memberData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={memberData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium mb-1">Marital Status</label>
                <select 
                  id="maritalStatus"
                  name="maritalStatus"
                  className="w-full px-3 py-2 border rounded-md"
                  value={memberData.maritalStatus}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="anniversaryDate" className="block text-sm font-medium mb-1">Anniversary Date</label>
                <Input 
                  id="anniversaryDate"
                  name="anniversaryDate"
                  type="date"
                  value={memberData.anniversaryDate}
                  onChange={handleInputChange}
                  disabled={memberData.maritalStatus !== 'Married'}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddMember}
              >
                <Check className="mr-1 h-4 w-4" /> {editingMemberId ? 'Update' : 'Add'} Member
              </Button>
            </div>
          </div>
        ) : null}
        
        {/* List of members */}
        {policy.members && policy.members.length > 0 ? (
          <div className="space-y-3">
            {policy.members.map((member) => (
              <div key={member.memberId} className="bg-white p-4 rounded-md border flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{member.name}</span>
                    <Badge variant="outline" className="ml-1">
                      {member.relation || 'Member'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                    {member.age && (
                      <div>
                        <span className="text-gray-500">Age:</span> {member.age} years
                      </div>
                    )}
                    {member.dateOfBirth && (
                      <div>
                        <span className="text-gray-500">DOB:</span> {new Date(member.dateOfBirth).toLocaleDateString()}
                      </div>
                    )}
                    {member.gender && (
                      <div>
                        <span className="text-gray-500">Gender:</span> {member.gender}
                      </div>
                    )}
                    {member.bloodGroup && (
                      <div>
                        <span className="text-gray-500">Blood Group:</span> {member.bloodGroup}
                      </div>
                    )}
                    {member.maritalStatus && (
                      <div>
                        <span className="text-gray-500">Marital Status:</span> {member.maritalStatus}
                      </div>
                    )}
                    {member.anniversaryDate && (
                      <div>
                        <span className="text-gray-500">Anniversary:</span> {new Date(member.anniversaryDate).toLocaleDateString()}
                      </div>
                    )}
                    {member.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span> {member.phone}
                      </div>
                    )}
                    {member.email && (
                      <div>
                        <span className="text-gray-500">Email:</span> {member.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditMember(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member.memberId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No members added to this policy yet</p>
            {!showForm && (
              <Button 
                variant="outline"
                className="mt-2"
                onClick={() => setShowForm(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Member
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PolicyMembers;
