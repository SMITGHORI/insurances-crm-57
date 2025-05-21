import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Plus, 
  Trash2, 
  CalendarIcon, 
  ChevronLeft,
  Save,
  FilePlus2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { 
  getSampleInvoices, 
  generateInvoiceNumber, 
  calculateInvoiceTotals 
} from '@/utils/invoiceUtils';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [clients, setClients] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [agents, setAgents] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([
    { 
      id: `item_${Date.now()}`, 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      tax: 0,
      total: 0
    }
  ]);
  const [itemSubtotal, setItemSubtotal] = useState(0);
  const [itemTaxTotal, setItemTaxTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  const form = useForm({
    defaultValues: {
      invoiceNumber: '',
      clientId: '',
      policyId: '',
      agentId: '',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'draft',
      notes: '',
      paymentTerms: 'Due on receipt',
      premiumType: 'Annual'
    }
  });
  
  // Load data and set form values
  useEffect(() => {
    // Load clients, policies, agents from localStorage
    const storedClientsData = localStorage.getItem('clientsData');
    const storedPoliciesData = localStorage.getItem('policiesData');
    const storedAgentsData = localStorage.getItem('agentsData');
    
    if (storedClientsData) {
      setClients(JSON.parse(storedClientsData));
    }
    
    if (storedPoliciesData) {
      setPolicies(JSON.parse(storedPoliciesData));
    }
    
    if (storedAgentsData) {
      setAgents(JSON.parse(storedAgentsData));
    }
    
    // If editing an existing invoice
    if (id) {
      setIsEditing(true);
      const storedInvoiceData = localStorage.getItem('invoicesData');
      
      if (storedInvoiceData) {
        const invoices = JSON.parse(storedInvoiceData);
        const existingInvoice = invoices.find(inv => inv.id.toString() === id);
        
        if (existingInvoice) {
          // Populate form with existing invoice data
          form.reset({
            invoiceNumber: existingInvoice.invoiceNumber,
            clientId: existingInvoice.clientId,
            policyId: existingInvoice.policyId || '',
            agentId: existingInvoice.agentId || '',
            issueDate: new Date(existingInvoice.issueDate),
            dueDate: new Date(existingInvoice.dueDate),
            status: existingInvoice.status,
            notes: existingInvoice.notes || '',
            paymentTerms: existingInvoice.paymentTerms || 'Due on receipt',
            premiumType: existingInvoice.premiumType || 'Annual'
          });
          
          setInvoiceItems(existingInvoice.items);
          setDiscount(existingInvoice.discount || 0);
        } else {
          toast.error("Invoice not found");
          navigate('/invoices');
        }
      }
    } else {
      // For new invoice, generate a new invoice number
      const storedInvoiceData = localStorage.getItem('invoicesData');
      const existingInvoiceNumbers = storedInvoiceData 
        ? JSON.parse(storedInvoiceData).map(inv => inv.invoiceNumber)
        : [];
        
      const newInvoiceNumber = generateInvoiceNumber('INV', existingInvoiceNumbers);
      form.setValue('invoiceNumber', newInvoiceNumber);
    }
  }, [id, form, navigate]);
  
  // Update totals when items or discount changes
  useEffect(() => {
    const { subtotal, taxTotal, total } = calculateInvoiceTotals(invoiceItems);
    setItemSubtotal(subtotal);
    setItemTaxTotal(taxTotal);
    setGrandTotal(Math.max(0, total - (parseFloat(discount) || 0)));
  }, [invoiceItems, discount]);
  
  // Handle client selection change
  const handleClientChange = (clientId) => {
    form.setValue('clientId', clientId);
    
    // Find client's policies
    if (clientId && policies.length > 0) {
      const clientPolicies = policies.filter(policy => 
        policy.client && policy.client.id.toString() === clientId.toString()
      );
      
      // If client has only one policy, set it automatically
      if (clientPolicies.length === 1) {
        form.setValue('policyId', clientPolicies[0].id.toString());
      }
    }
  };
  
  // Handle policy selection change
  const handlePolicyChange = (policyId) => {
    form.setValue('policyId', policyId);
    
    if (policyId) {
      const selectedPolicy = policies.find(policy => policy.id.toString() === policyId.toString());
      
      if (selectedPolicy) {
        // Auto-fill invoice items based on policy
        const newItem = {
          id: `item_${Date.now()}`,
          description: `${selectedPolicy.type} Premium - ${selectedPolicy.planName || ''}`,
          quantity: 1,
          unitPrice: parseFloat(selectedPolicy.premium) || 0,
          tax: (parseFloat(selectedPolicy.premium) || 0) * 0.18, // Assuming 18% GST
          total: (parseFloat(selectedPolicy.premium) || 0) * 1.18
        };
        
        setInvoiceItems([newItem]);
        
        // Set premium period based on policy
        if (selectedPolicy.startDate && selectedPolicy.endDate) {
          const startDate = new Date(selectedPolicy.startDate);
          const endDate = new Date(selectedPolicy.endDate);
          
          const startFormatted = format(startDate, 'MMM yyyy');
          const endFormatted = format(endDate, 'MMM yyyy');
          
          form.setValue('premiumPeriod', `${startFormatted} - ${endFormatted}`);
        }
      }
    }
  };
  
  // Add a new invoice item
  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { 
        id: `item_${Date.now()}`, 
        description: '', 
        quantity: 1, 
        unitPrice: 0, 
        tax: 0,
        total: 0
      }
    ]);
  };
  
  // Update an invoice item
  const handleItemChange = (id, field, value) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'unitPrice') {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
          const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(item.unitPrice) || 0;
          const subtotal = quantity * unitPrice;
          const tax = subtotal * 0.18; // Assuming 18% GST
          
          updatedItem.tax = tax;
          updatedItem.total = subtotal + tax;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInvoiceItems(updatedItems);
  };
  
  // Remove an invoice item
  const handleRemoveItem = (id) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    } else {
      toast.error("Cannot remove the only item");
    }
  };
  
  // Handle form submission
  const onSubmit = (data) => {
    // Get existing invoices
    const storedInvoiceData = localStorage.getItem('invoicesData');
    const invoices = storedInvoiceData ? JSON.parse(storedInvoiceData) : getSampleInvoices();
    
    // Find selected client, policy and agent
    const selectedClient = clients.find(client => client.id.toString() === data.clientId);
    const selectedPolicy = data.policyId ? 
      policies.find(policy => policy.id.toString() === data.policyId) : null;
    const selectedAgent = data.agentId ? 
      agents.find(agent => agent.id.toString() === data.agentId) : null;
    
    // Create invoice object
    const invoiceData = {
      id: isEditing ? id : String(Math.max(...invoices.map(inv => parseInt(inv.id))) + 1),
      invoiceNumber: data.invoiceNumber,
      clientId: data.clientId,
      clientName: selectedClient?.name || 'Unknown Client',
      clientEmail: selectedClient?.email || '',
      clientPhone: selectedClient?.contact || '',
      clientAddress: selectedClient?.location || '',
      policyId: data.policyId || undefined,
      policyNumber: selectedPolicy?.policyNumber || undefined,
      insuranceType: selectedPolicy?.type || undefined,
      agentId: data.agentId || undefined,
      agentName: selectedAgent?.name || undefined,
      issueDate: format(data.issueDate, 'yyyy-MM-dd'),
      dueDate: format(data.dueDate, 'yyyy-MM-dd'),
      status: data.status,
      items: invoiceItems,
      subtotal: itemSubtotal,
      discount: parseFloat(discount) || 0,
      tax: itemTaxTotal,
      total: grandTotal,
      notes: data.notes,
      paymentTerms: data.paymentTerms,
      premiumType: data.premiumType,
      premiumPeriod: data.premiumPeriod || undefined,
      customFields: {
        ...(selectedClient?.gstNumber ? { "GST Number": selectedClient.gstNumber } : {})
      },
      layoutTemplate: 'standard',
      history: [
        {
          action: isEditing ? "Updated" : "Created",
          date: new Date().toISOString().split('T')[0],
          user: "Admin",
          details: isEditing ? "Invoice updated" : "Invoice created"
        }
      ]
    };
    
    // Update or add invoice
    let updatedInvoices;
    if (isEditing) {
      // Keep existing history for edited invoice
      const existingInvoice = invoices.find(inv => inv.id.toString() === id);
      if (existingInvoice && existingInvoice.history) {
        invoiceData.history = [
          ...existingInvoice.history,
          ...invoiceData.history
        ];
      }
      
      // Update existing invoice
      updatedInvoices = invoices.map(inv => 
        inv.id.toString() === id ? invoiceData : inv
      );
    } else {
      // Add new invoice
      updatedInvoices = [...invoices, invoiceData];
    }
    
    // Save to localStorage
    localStorage.setItem('invoicesData', JSON.stringify(updatedInvoices));
    
    toast.success(`Invoice ${isEditing ? 'updated' : 'created'} successfully`);
    navigate(`/invoices/${invoiceData.id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate('/invoices')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
        </h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => form.reset()}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
          >
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Invoice' : 'Save Invoice'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly={isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issue Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Due on receipt">Due on Receipt</SelectItem>
                            <SelectItem value="Net 15">Net 15</SelectItem>
                            <SelectItem value="Net 30">Net 30</SelectItem>
                            <SelectItem value="Net 45">Net 45</SelectItem>
                            <SelectItem value="Net 60">Net 60</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-20"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          className="w-28"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.tax)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={invoiceItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleAddItem}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
                
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(itemSubtotal)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Discount:</span>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-28"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax Total:</span>
                    <span>{formatCurrency(itemTaxTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Additional notes for the client..." 
                            className="h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Client & Policy Details</h3>
              
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={handleClientChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="policyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy</FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={handlePolicyChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Policy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No Policy</SelectItem>
                            {policies
                              .filter(policy => !form.getValues('clientId') || 
                                (policy.client && policy.client.id.toString() === form.getValues('clientId')))
                              .map(policy => (
                                <SelectItem key={policy.id} value={policy.id.toString()}>
                                  {policy.policyNumber || `${policy.type} Policy`}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="premiumType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Premium Type</FormLabel>
                          <Select 
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Annual">Annual</SelectItem>
                              <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                              <SelectItem value="Quarterly">Quarterly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="One-Time">One-Time</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="premiumPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Premium Period</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., May 2025 - May 2026" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Agent Details</h3>
              
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="agentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Agent</FormLabel>
                      <Select 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Agent</SelectItem>
                          {agents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center"
                  onClick={() => navigate('/agents/create')}
                >
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Create New Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
