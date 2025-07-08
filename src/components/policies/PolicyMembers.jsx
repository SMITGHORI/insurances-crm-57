
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, User, Clipboard, Copy } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUpdatePolicy } from '@/hooks/usePolicies';

const PolicyMembers = ({ policy, setPolicy }) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const updatePolicyMutation = useUpdatePolicy();
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "Self",
    mobile: "",
    email: "",
    age: "",
    birthDate: null,
    gender: "Male",
    bloodGroup: "",
    anniversaryDate: null,
    maritalStatus: "Unmarried"
  });

  // Handle saving members to policy
  const handleSaveMember = async () => {
    if (!newMember.name) {
      toast.error("Member name is required");
      return;
    }

    // Initialize members array if it doesn't exist
    const currentMembers = policy.members || [];

    // Add new member with an ID
    const memberId = currentMembers.length > 0 
      ? Math.max(...currentMembers.map(m => m.id)) + 1 
      : 1;

    const newMemberData = {
      ...newMember,
      id: memberId,
      birthDate: newMember.birthDate ? newMember.birthDate : null,
      anniversaryDate: newMember.anniversaryDate ? newMember.anniversaryDate : null
    };

    const updatedPolicy = {
      ...policy,
      members: [...currentMembers, newMemberData]
    };

    try {
      await updatePolicyMutation.mutateAsync({
        id: policy.id,
        ...updatedPolicy
      });

      // Update current policy state
      setPolicy(updatedPolicy);

      // Reset form and close dialog
      setNewMember({
        name: "",
        relationship: "Self",
        mobile: "",
        email: "",
        age: "",
        birthDate: null,
        gender: "Male",
        bloodGroup: "",
        anniversaryDate: null,
        maritalStatus: "Unmarried"
      });
      setIsAddMemberOpen(false);
      
      toast.success("Member added successfully");
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    }
  };

  // Handle copy policy number to clipboard
  const handleCopyPolicyNumber = () => {
    if (policy.insuranceCompanyPolicyNumber) {
      navigator.clipboard.writeText(policy.insuranceCompanyPolicyNumber);
      toast.success("Insurance company policy number copied to clipboard");
    } else {
      toast.error("No insurance company policy number available");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Policy Card & Insured Members</CardTitle>
            <CardDescription>
              Policy information for insurance claims and member details
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddMemberOpen(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Policy Card Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">{policy.insuranceCompany || "Insurance Company"}</h3>
              <h4 className="text-md font-medium text-gray-700">{policy.planName || "Plan Name"}</h4>
            </div>
            <div>
              <div className="flex items-center justify-end">
                <div className="text-sm font-medium text-gray-900 mr-2">
                  Internal Ref: <span className="font-mono">{policy.policyNumber}</span>
                </div>
              </div>
              <div className="flex items-center justify-end mt-1">
                {policy.insuranceCompanyPolicyNumber ? (
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 mr-2">
                      Insurance Policy #: <span className="font-mono">{policy.insuranceCompanyPolicyNumber}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyPolicyNumber}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-amber-600">No insurance company policy number</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-xs text-gray-500">Policy Type</div>
              <div className="font-medium">{policy.type}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Sum Insured</div>
              <div className="font-medium">₹{parseInt(policy.sumAssured || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Validity</div>
              <div className="font-medium">{new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-xs text-gray-500">Client</div>
            <div className="font-medium">{policy.client?.name}</div>
          </div>
        </div>
        
        {/* Members List */}
        <h3 className="text-md font-semibold mb-2">Insured Members</h3>
        {!policy.members || policy.members.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">
            No members added to this policy yet
          </div>
        ) : (
          <div className="grid gap-4">
            {policy.members?.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.relationship}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    Age: {member.age} | {member.gender}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-gray-500">Mobile</div>
                    <div>{member.mobile || "Not provided"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div>{member.email || "Not provided"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date of Birth</div>
                    <div>{member.birthDate ? format(new Date(member.birthDate), "dd MMM yyyy") : "Not provided"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Blood Group</div>
                    <div>{member.bloodGroup || "Not provided"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Marital Status</div>
                    <div>{member.maritalStatus}</div>
                  </div>
                  {member.maritalStatus === "Married" && member.anniversaryDate && (
                    <div>
                      <div className="text-xs text-gray-500">Anniversary</div>
                      <div>{format(new Date(member.anniversaryDate), "dd MMM yyyy")}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name*</label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium mb-1">Relationship</label>
                <Select
                  value={newMember.relationship}
                  onValueChange={(value) => setNewMember({...newMember, relationship: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Self">Self</SelectItem>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium mb-1">Age</label>
                <Input
                  id="age"
                  type="number"
                  value={newMember.age}
                  onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                  placeholder="Enter age"
                />
              </div>
              
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium mb-1">Date of Birth</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMember.birthDate ? format(new Date(newMember.birthDate), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newMember.birthDate ? new Date(newMember.birthDate) : undefined}
                      onSelect={(date) => setNewMember({...newMember, birthDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
                <Select
                  value={newMember.gender}
                  onValueChange={(value) => setNewMember({...newMember, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium mb-1">Blood Group</label>
                <Select
                  value={newMember.bloodGroup}
                  onValueChange={(value) => setNewMember({...newMember, bloodGroup: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile Number</label>
                <Input
                  id="mobile"
                  value={newMember.mobile}
                  onChange={(e) => setNewMember({...newMember, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium mb-1">Marital Status</label>
                <Select
                  value={newMember.maritalStatus}
                  onValueChange={(value) => setNewMember({...newMember, maritalStatus: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Unmarried">Unmarried</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newMember.maritalStatus === "Married" && (
                <div>
                  <label htmlFor="anniversaryDate" className="block text-sm font-medium mb-1">Anniversary Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newMember.anniversaryDate ? format(new Date(newMember.anniversaryDate), "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newMember.anniversaryDate ? new Date(newMember.anniversaryDate) : undefined}
                        onSelect={(date) => setNewMember({...newMember, anniversaryDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMember}>Save Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PolicyMembers;
