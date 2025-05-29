import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const QuotationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [validUntilDate, setValidUntilDate] = useState(null);
  
  useEffect(() => {
    // In a real app, this would fetch the quotation from an API
    const fetchQuotation = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          // Sample data for editing
          setQuotation({
            id: parseInt(id),
            quoteId: `QT-2025-000${id}`,
            clientName: 'Vivek Patel',
            clientId: 'CLI-2025-0001',
            clientEmail: 'vivek.patel@example.com',
            clientPhone: '+91 98765 43210',
            clientAge: 35,
            clientGender: 'Male',
            insuranceType: 'Health Insurance',
            insuranceCompany: 'Star Health',
            products: [
              {
                name: 'Family Floater Plan',
                description: 'Comprehensive health coverage for the entire family',
                sumInsured: 500000,
                premium: 22000
              },
              {
                name: 'Critical Illness Add-on',
                description: 'Additional coverage for 20 critical illnesses',
                sumInsured: 500000,
                premium: 3000
              }
            ],
            sumInsured: 500000,
            premium: 25000,
            agentName: 'Rajiv Kumar',
            agentId: 'agent1',
            createdDate: '18 May 2025',
            validUntil: '18 Jun 2025',
            status: 'draft',
            notes: 'Client requested quotes for family of 4 with no pre-existing conditions'
          });
          
          // Set valid until date from the fetched quotation
          setValidUntilDate(new Date('2025-06-18'));
          
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching quotation:', error);
        toast.error('Failed to load quotation data');
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // In a real app, this would send the updated quotation to an API
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      toast.success('Quotation updated successfully');
      navigate(`/quotations/${id}`);
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/quotations/${id}`);
  };
  
  const updateQuotationField = (field, value) => {
    setQuotation(prev => ({ ...prev, [field]: value }));
  };
  
  const updateProduct = (index, field, value) => {
    setQuotation(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      
      // Calculate new premium total
      const newPremium = updatedProducts.reduce((sum, product) => sum + Number(product.premium), 0);
      
      return {
        ...prev, 
        products: updatedProducts,
        premium: newPremium
      };
    });
  };
  
  const addProduct = () => {
    setQuotation(prev => ({
      ...prev,
      products: [
        ...prev.products, 
        {
          name: '',
          description: '',
          sumInsured: prev.sumInsured,
          premium: 0
        }
      ]
    }));
  };
  
  const removeProduct = (index) => {
    setQuotation(prev => {
      const updatedProducts = prev.products.filter((_, i) => i !== index);
      
      // Calculate new premium total
      const newPremium = updatedProducts.reduce((sum, product) => sum + Number(product.premium), 0);
      
      return {
        ...prev, 
        products: updatedProducts,
        premium: newPremium
      };
    });
    
    toast.success('Product removed');
  };
  
  const handleDateChange = (date) => {
    setValidUntilDate(date);
    
    if (date) {
      updateQuotationField('validUntil', format(date, 'dd MMM yyyy'));
    }
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Quotation {quotation.quoteId}
              </h1>
              <div className="text-sm text-gray-500">
                Created on {quotation.createdDate}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="w-full sm:w-auto"
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Client details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={quotation.clientName}
                  onChange={(e) => updateQuotationField('clientName', e.target.value)}
                  disabled
                />
                <div className="text-xs text-muted-foreground">
                  Client details are linked to client profile. To edit, please update the client record.
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={quotation.clientEmail}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    value={quotation.clientPhone}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
              <CardDescription>Insurance and policy information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceType">Insurance Type</Label>
                  <Select
                    value={quotation.insuranceType}
                    onValueChange={(value) => updateQuotationField('insuranceType', value)}
                  >
                    <SelectTrigger id="insuranceType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                      <SelectItem value="Term Insurance">Term Insurance</SelectItem>
                      <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
                      <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
                      <SelectItem value="Property Insurance">Property Insurance</SelectItem>
                      <SelectItem value="Group Health Insurance">Group Health Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Insurance Company</Label>
                  <Select
                    value={quotation.insuranceCompany}
                    onValueChange={(value) => updateQuotationField('insuranceCompany', value)}
                  >
                    <SelectTrigger id="insuranceCompany">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Star Health">Star Health</SelectItem>
                      <SelectItem value="HDFC Life">HDFC Life</SelectItem>
                      <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                      <SelectItem value="Bajaj Allianz">Bajaj Allianz</SelectItem>
                      <SelectItem value="Max Bupa">Max Bupa</SelectItem>
                      <SelectItem value="Tata AIG">Tata AIG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sumInsured">Sum Insured</Label>
                  <Input
                    id="sumInsured"
                    type="number"
                    value={quotation.sumInsured}
                    onChange={(e) => updateQuotationField('sumInsured', Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="validUntil"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !validUntilDate && "text-muted-foreground"
                        )}
                      >
                        {validUntilDate ? format(validUntilDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={validUntilDate}
                        onSelect={handleDateChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">Products</h3>
                  <Button 
                    type="button" 
                    size="sm"
                    variant="outline"
                    onClick={addProduct}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </Button>
                </div>

                {quotation.products.map((product, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Product {index + 1}</CardTitle>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 h-8 px-2"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3 px-4 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`product-name-${index}`}>Product Name</Label>
                        <Input
                          id={`product-name-${index}`}
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`product-description-${index}`}>Description</Label>
                        <Textarea
                          id={`product-description-${index}`}
                          rows={2}
                          value={product.description}
                          onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`product-sum-insured-${index}`}>Sum Insured</Label>
                          <Input
                            id={`product-sum-insured-${index}`}
                            type="number"
                            value={product.sumInsured}
                            onChange={(e) => updateProduct(index, 'sumInsured', Number(e.target.value))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`product-premium-${index}`}>Premium</Label>
                          <Input
                            id={`product-premium-${index}`}
                            type="number"
                            value={product.premium}
                            onChange={(e) => updateProduct(index, 'premium', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Add any additional notes for this quotation"
                  value={quotation.notes}
                  onChange={(e) => updateQuotationField('notes', e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Premium:
                  <span className="ml-1 font-semibold text-base text-foreground">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    }).format(quotation.premium)}
                  </span>
                </p>
              </div>
              
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotationEdit;
