
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calendar, 
  Bell, 
  Plus, 
  Search 
} from 'lucide-react';
import { toast } from 'sonner';

const Policies = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Get the policies data from localStorage or use the sample data
  useEffect(() => {
    setLoading(true);
    
    // Try to get policies from localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    let policiesList = [];
    
    if (storedPoliciesData) {
      policiesList = JSON.parse(storedPoliciesData);
    } else {
      // Sample policies data as fallback
      policiesList = [
        {
          id: 1,
          policyNumber: 'AMB-POL-2025-0001',
          type: 'Health Insurance',
          status: 'In Force',
          client: {
            id: 1,
            name: 'Rahul Sharma',
          },
          startDate: '2025-01-01',
          endDate: '2026-01-01',
          sumAssured: '500000',
          premium: '12500',
          paymentFrequency: 'Annual',
          gracePeriod: 30,
          renewals: [
            {
              date: '2025-01-01',
              premium: '12500',
              renewedBy: 'John Doe',
              remarks: 'Regular renewal'
            }
          ],
          documents: {
            proposalForm: null,
            policyBond: null,
            welcomeLetter: null,
            policySchedule: null,
          },
          payments: [
            {
              receiptNumber: 'REC001',
              amount: '12500',
              date: '2025-01-01',
              mode: 'UPI',
              reference: 'UPI/123456789',
              receipt: null
            }
          ],
          commission: {
            percentage: 15,
            amount: '1875',
            payoutStatus: 'Paid',
            tdsDeducted: '187.5',
            paymentDate: '2025-01-15'
          },
          history: [
            {
              action: 'Created',
              by: 'Admin',
              timestamp: '2024-12-15T10:00:00',
              details: 'Policy created'
            },
            {
              action: 'Status Changed',
              by: 'Admin',
              timestamp: '2025-01-01T12:00:00',
              details: 'Status changed from "Proposal" to "In Force"'
            }
          ],
          notes: [
            {
              text: 'Client requested details about adding family members',
              by: 'Admin',
              timestamp: '2025-01-10T15:30:00'
            }
          ]
        },
        {
          id: 2,
          policyNumber: 'AMB-POL-2025-0002',
          type: 'Motor Insurance',
          status: 'In Force',
          client: {
            id: 2,
            name: 'Tech Solutions Ltd',
          },
          startDate: '2025-01-15',
          endDate: '2026-01-15',
          sumAssured: '300000',
          premium: '8000',
          paymentFrequency: 'Annual',
          gracePeriod: 15,
          renewals: [
            {
              date: '2025-01-15',
              premium: '8000',
              renewedBy: 'Jane Smith',
              remarks: 'Corporate policy renewal'
            }
          ],
          documents: {
            proposalForm: null,
            policyBond: null,
            welcomeLetter: null,
            policySchedule: null,
          },
          payments: [
            {
              receiptNumber: 'REC002',
              amount: '8000',
              date: '2025-01-15',
              mode: 'Bank Transfer',
              reference: 'NEFT/987654321',
              receipt: null
            }
          ],
          commission: {
            percentage: 10,
            amount: '800',
            payoutStatus: 'Pending',
            tdsDeducted: '80',
            paymentDate: null
          },
          history: [
            {
              action: 'Created',
              by: 'Admin',
              timestamp: '2025-01-10T14:00:00',
              details: 'Policy created'
            },
            {
              action: 'Status Changed',
              by: 'Admin',
              timestamp: '2025-01-15T09:00:00',
              details: 'Status changed from "Proposal" to "In Force"'
            }
          ],
          notes: []
        },
        {
          id: 3,
          policyNumber: 'AMB-POL-2025-0003',
          type: 'Life Insurance',
          status: 'Proposal',
          client: {
            id: 1,
            name: 'Rahul Sharma',
          },
          startDate: '2025-02-01',
          endDate: '2055-02-01',
          sumAssured: '2000000',
          premium: '25000',
          paymentFrequency: 'Annual',
          gracePeriod: 30,
          renewals: [],
          documents: {
            proposalForm: null,
            policyBond: null,
            welcomeLetter: null,
            policySchedule: null,
          },
          payments: [],
          commission: {
            percentage: 20,
            amount: '5000',
            payoutStatus: 'Not Applicable',
            tdsDeducted: '0',
            paymentDate: null
          },
          history: [
            {
              action: 'Created',
              by: 'Admin',
              timestamp: '2025-01-15T16:00:00',
              details: 'Proposal created'
            }
          ],
          notes: [
            {
              text: 'Medical tests scheduled for Jan 25th',
              by: 'Admin',
              timestamp: '2025-01-18T11:20:00'
            }
          ]
        }
      ];
      
      // Save sample data to localStorage
      localStorage.setItem('policiesData', JSON.stringify(policiesList));
    }
    
    setPolicies(policiesList);
    setLoading(false);
  }, []);

  // Filter policies based on search query and active tab
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      policy.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && policy.status === 'In Force';
    if (activeTab === 'renewal') {
      const endDate = new Date(policy.endDate);
      const today = new Date();
      const daysUntilRenewal = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
      return matchesSearch && daysUntilRenewal <= 30;
    }
    if (activeTab === 'proposal') return matchesSearch && policy.status === 'Proposal';
    
    return matchesSearch;
  });

  const handleCreatePolicy = () => {
    navigate('/policies/create');
  };

  const handleViewPolicy = (id) => {
    navigate(`/policies/${id}`);
  };

  // Calculate if a policy is due for renewal (within 30 days)
  const isPolicyDueForRenewal = (endDate) => {
    const renewalDate = new Date(endDate);
    const today = new Date();
    const daysUntilRenewal = Math.floor((renewalDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilRenewal <= 30 && daysUntilRenewal >= 0;
  };

  // Get badge color based on policy status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Force':
        return 'amba-badge-green';
      case 'Proposal':
        return 'amba-badge-blue';
      case 'Grace':
        return 'amba-badge-yellow';
      case 'Lapsed':
      case 'Cancelled':
        return 'amba-badge-red';
      case 'Surrendered':
      case 'Matured':
        return 'amba-badge-purple';
      default:
        return 'amba-badge-blue';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Policies</h1>
        <Button 
          onClick={handleCreatePolicy}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> New Policy
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search policies by number, client or type..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              All Policies
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="renewal" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Due for Renewal
            </TabsTrigger>
            <TabsTrigger value="proposal" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Proposals
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Sum Assured</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => (
                  <TableRow 
                    key={policy.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewPolicy(policy.id)}
                  >
                    <TableCell>{policy.policyNumber}</TableCell>
                    <TableCell>{policy.client.name}</TableCell>
                    <TableCell>{policy.type}</TableCell>
                    <TableCell>
                      <span className={`amba-badge ${getStatusBadgeClass(policy.status)}`}>
                        {policy.status}
                      </span>
                      {isPolicyDueForRenewal(policy.endDate) && (
                        <span className="amba-badge amba-badge-orange ml-1">
                          Renewal due
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(policy.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(policy.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{parseInt(policy.sumAssured).toLocaleString()}</TableCell>
                    <TableCell>₹{parseInt(policy.premium).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/policies/edit/${policy.id}`);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No policies found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Policies;
