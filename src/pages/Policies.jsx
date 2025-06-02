import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Search,
  Building,
  Link,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import PoliciesMobileView from '@/components/policies/PoliciesMobileView';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePermissions } from '@/contexts/PermissionsContext';
import withRoleBasedData from '@/components/hoc/withRoleBasedData';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageSkeleton, StatsSkeleton, FiltersSkeleton, TabsSkeleton, TableSkeleton } from '@/components/ui/professional-skeleton';

const Policies = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab');
  const isMobile = useIsMobile();
  const { hasPermission, getFilteredData, isAgent, isSuperAdmin, userId } = usePermissions();
  
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'all');
  const [filterType, setFilterType] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');

  // Check if user can create policies
  const canCreatePolicy = hasPermission('createPolicy');
  const canEditAnyPolicy = hasPermission('editAnyPolicy');
  const canViewAllPolicies = hasPermission('viewAllPolicies');

  // Get the policies data from localStorage or use the sample data
  useEffect(() => {
    setLoading(true);
    
    // Try to get policies from localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    let policiesList = [];
    
    if (storedPoliciesData) {
      policiesList = JSON.parse(storedPoliciesData);
    } else {
      // Sample policies data as fallback with added insurance fields and agent assignments
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
          agentId: '2', // Assigned to agent
          assignedAgent: '2',
          startDate: '2025-01-01',
          endDate: '2026-01-01',
          sumAssured: '500000',
          premium: '12500',
          paymentFrequency: 'Annual',
          gracePeriod: 30,
          insuranceCompany: 'Star Health',
          planName: 'Family Health Optima',
          lockInPeriod: 3,
          discountPercentage: 5,
          gstNumber: 'GST123456789',
          nextYearPremium: '13125',
          // ... keep existing code (renewals, documents, payments, commission, history, notes)
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
          agentId: '1', // Assigned to super admin
          assignedAgent: '1',
          startDate: '2025-01-15',
          endDate: '2026-01-15',
          sumAssured: '300000',
          premium: '8000',
          paymentFrequency: 'Annual',
          gracePeriod: 15,
          insuranceCompany: 'ICICI Lombard',
          planName: 'Commercial Vehicle Insurance',
          lockInPeriod: 1,
          discountPercentage: 10,
          gstNumber: 'GST987654321',
          nextYearPremium: '8400',
          // ... keep existing code (renewals, documents, payments, commission, history, notes)
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
          agentId: '2', // Assigned to agent
          assignedAgent: '2',
          startDate: '2025-02-01',
          endDate: '2055-02-01',
          sumAssured: '2000000',
          premium: '25000',
          paymentFrequency: 'Annual',
          gracePeriod: 30,
          insuranceCompany: 'LIC',
          planName: 'Jeevan Anand',
          lockInPeriod: 5,
          discountPercentage: 0,
          gstNumber: '',
          nextYearPremium: '25000',
          // ... keep existing code (renewals, documents, payments, commission, history, notes)
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
    
    // Apply role-based filtering
    const filteredPoliciesList = getFilteredData(policiesList, 'policies');
    setPolicies(filteredPoliciesList);
    setLoading(false);
  }, [getFilteredData]);

  // Update the tab when location.search changes
  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab && ['all', 'active', 'renewal', 'proposal'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Filter policies based on search query and active tab
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      (policy.policyNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (policy.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (policy.type?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (policy.insuranceCompany?.toLowerCase().includes(searchQuery.toLowerCase()) || '');
    
    const matchesType = filterType === 'all' || (policy.type && policy.type.includes(filterType));
    const matchesCompany = filterCompany === 'all' || (policy.insuranceCompany && policy.insuranceCompany === filterCompany);
    
    let matchesTab = true;
    if (activeTab === 'active') matchesTab = policy.status === 'In Force';
    if (activeTab === 'renewal') {
      const endDate = new Date(policy.endDate);
      const today = new Date();
      const daysUntilRenewal = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
      matchesTab = daysUntilRenewal <= 30;
    }
    if (activeTab === 'proposal') matchesTab = policy.status === 'Proposal';
    
    return matchesSearch && matchesType && matchesCompany && matchesTab;
  });

  // Get unique insurance companies for filter
  const insuranceCompanies = [...new Set(policies.map(p => p.insuranceCompany).filter(Boolean))];
  
  // Get unique policy types for filter
  const policyTypes = [...new Set(policies.map(p => p.type).filter(Boolean))];

  const handleCreatePolicy = () => {
    if (canCreatePolicy) {
      navigate('/policies/create');
    } else {
      toast.error('You do not have permission to create policies');
    }
  };

  const handleViewPolicy = (id) => {
    navigate(`/policies/${id}`);
  };

  // Update URL when tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(`/policies?tab=${value}`, { replace: true });
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
        return 'bg-green-100 text-green-800';
      case 'Proposal':
        return 'bg-blue-100 text-blue-800';
      case 'Grace':
        return 'bg-yellow-100 text-yellow-800';
      case 'Lapsed':
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Surrendered':
      case 'Matured':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleViewClient = (e, clientId) => {
    e.stopPropagation(); // Prevent triggering the row click
    navigate(`/clients/${clientId}`);
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterCompany('all');
    setSearchQuery('');
  };

  // Calculate statistics based on filtered data
  const totalActive = policies.filter(p => p.status === 'In Force').length;
  const totalPending = policies.filter(p => p.status === 'Proposal').length;
  const totalRenewal = policies.filter(p => {
    const endDate = new Date(p.endDate);
    const today = new Date();
    const daysUntilRenewal = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilRenewal <= 30 && daysUntilRenewal >= 0;
  }).length;

  // Professional loading state
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {isAgent() ? 'My Policies' : 'All Policies'}
          </h1>
          {isAgent() && (
            <p className="text-sm text-gray-500 mt-1">Showing only policies assigned to you</p>
          )}
        </div>
        {canCreatePolicy && (
          <Button 
            onClick={handleCreatePolicy}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="mr-1 h-4 w-4" /> New Policy
          </Button>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search policies..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader className="text-left">
                  <SheetTitle>Filter Policies</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific policies
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Policy Type</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {policyTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Insurance Company</label>
                    <Select value={filterCompany} onValueChange={setFilterCompany}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {insuranceCompanies.map((company) => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter className="sm:justify-between">
                  <SheetClose asChild>
                    <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}

          {!isMobile && (
            <>
              <div className="flex items-center">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Policy Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {policyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Insurance Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {insuranceCompanies.map((company) => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearFilters}
                className="h-10"
              >
                Clear
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white shadow-sm rounded-md p-3 border">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-lg font-semibold">{policies.length}</div>
          </div>
          <div className="bg-white shadow-sm rounded-md p-3 border">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-lg font-semibold text-green-600">{totalActive}</div>
          </div>
          <div className="bg-white shadow-sm rounded-md p-3 border">
            <div className="text-sm text-gray-500">Due for Renewal</div>
            <div className="text-lg font-semibold text-amber-600">{totalRenewal}</div>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="flex items-center">
              <FileText className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center">
              <FileText className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Active</span>
            </TabsTrigger>
            <TabsTrigger value="renewal" className="flex items-center">
              <Calendar className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Renewals</span>
            </TabsTrigger>
            <TabsTrigger value="proposal" className="flex items-center">
              <Bell className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Proposals</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isMobile ? (
        <PoliciesMobileView 
          policies={filteredPolicies} 
          isPolicyDueForRenewal={isPolicyDueForRenewal}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Insurance Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
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
                    <TableCell>
                      <div 
                        className="flex items-center text-primary hover:underline cursor-pointer"
                        onClick={(e) => handleViewClient(e, policy.client.id)}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        {policy.client.name}
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      <Building className="h-4 w-4 mr-1 text-blue-600" />
                      {policy.insuranceCompany || 'Not specified'}
                    </TableCell>
                    <TableCell>{policy.planName || 'Not specified'}</TableCell>
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
                    <TableCell>{new Date(policy.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{parseInt(policy.premium).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {(canEditAnyPolicy || (isAgent() && policy.agentId === userId)) && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/policies/${policy.id}/edit`);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    {isAgent() ? 'No policies assigned to you' : 'No policies found'}
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

export default withRoleBasedData(Policies, 'policies');
