
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
import { useQuotation, useUpdateQuotation } from '@/hooks/useQuotations';

const QuotationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [validUntilDate, setValidUntilDate] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    insuranceType: '',
    insuranceCompany: '',
    products: [],
    sumInsured: 0,
    premium: 0,
    validUntil: '',
    notes: ''
  });

  // Use the existing quotation hooks
  const { data: quotation, isLoading, isError } = useQuotation(id);
  const { mutate: updateQuotation, isPending: isSaving } = useUpdateQuotation();

  useEffect(() => {
    if (quotation) {
      // Populate form with existing quotation data
      setFormData({
        clientName: quotation.clientName || '',
        insuranceType: quotation.insuranceType || '',
        insuranceCompany: quotation.insuranceCompany || '',
        products: quotation.products || [{ name: '', description: '', sumInsured: 0, premium: 0 }],
        sumInsured: quotation.sumInsured || 0,
        premium: quotation.premium || 0,
        validUntil: quotation.validUntil || '',
        notes: quotation.notes || ''
      });

      // Set valid until date if available
      if (quotation.validUntil) {
        try {
          const date = new Date(quotation.validUntil);
          setValidUntilDate(date);
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }
    }
  }, [quotation]);

  const handleSave = async () => {
    try {
      // Calculate total premium from products
      const totalPremium = formData.products.reduce((sum, product) => sum + Number(product.premium || 0), 0);
      
      const updateData = {
        ...formData,
        premium: totalPremium,
        validUntil: validUntilDate ? validUntilDate.toISOString() : formData.validUntil
      };

      updateQuotation(
        { id, quotationData: updateData },
        {
          onSuccess: () => {
            navigate(`/quotations/${id}`);
          },
          onError: (error) => {
            console.error('Error updating quotation:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error preparing update:', error);
      toast.error('Failed to update quotation');
    }
  };

  const handleCancel = () => {
    navigate(`/quotations/${id}`);
  };
  
  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const updateProduct = (index, field, value) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      
      // Calculate new premium total
      const newPremium = updatedProducts.reduce((sum, product) => sum + Number(product.premium || 0), 0);
      
      return {
        ...prev, 
        products: updatedProducts,
        premium: newPremium
      };
    });
  };
  
  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products, 
        {
          name: '',
          description: '',
          sumInsured: prev.sumInsured || 0,
          premium: 0
        }
      ]
    }));
  };
  
  const removeProduct = (index) => {
    setFormData(prev => {
      const updatedProducts = prev.products.filter((_, i) => i !== index);
      
      // Calculate new premium total
      const newPremium = updatedProducts.reduce((sum, product) => sum + Number(product.premium || 0), 0);
      
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
  };

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Show error if quotation not found
  if (isError || !quotation) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Quotation Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The quotation you're trying to edit could not be found.
          </p>
          <Button onClick={() => navigate('/quotations')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  // Check if quotation can be edited (only draft and sent status)
  const canEdit = ['draft', 'sent'].includes(quotation.status);
  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Cannot Edit Quotation</h1>
          <p className="text-muted-foreground mb-4">
            This quotation cannot be edited because it has been {quotation.status}.
          </p>
          <Button onClick={() => navigate(`/quotations/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> View Quotation
          </Button>
        </div>
      </div>
    );
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
              <h1 className="text-2xl font-bold">
                Edit Quotation {quotation.quoteId}
              </h1>
              <div className="text-sm text-muted-foreground">
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
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  value={formData.clientName}
                  onChange={(e) => updateFormField('clientName', e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                Note: Updating client name here only affects this quotation. 
                To update client profile, visit the Clients section.
              </div>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
              <CardDescription>Insurance and policy information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceType">Insurance Type</Label>
                  <Select
                    value={formData.insuranceType}
                    onValueChange={(value) => updateFormField('insuranceType', value)}
                  >
                    <SelectTrigger id="insuranceType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                      <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                      <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
                      <SelectItem value="Home Insurance">Home Insurance</SelectItem>
                      <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
                      <SelectItem value="Business Insurance">Business Insurance</SelectItem>
                      <SelectItem value="Group Health Insurance">Group Health Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Insurance Company</Label>
                  <Select
                    value={formData.insuranceCompany}
                    onValueChange={(value) => updateFormField('insuranceCompany', value)}
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
                  <Label htmlFor="sumInsured">Sum Insured (₹)</Label>
                  <Input
                    id="sumInsured"
                    type="number"
                    value={formData.sumInsured}
                    onChange={(e) => updateFormField('sumInsured', Number(e.target.value))}
                    placeholder="Enter sum insured"
                    min="0"
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
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Products Section */}
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

                {formData.products.map((product, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Product {index + 1}</CardTitle>
                        {formData.products.length > 1 && (
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive h-8 px-2"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash size={16} />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="py-3 px-4 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`product-name-${index}`}>Product Name</Label>
                        <Input
                          id={`product-name-${index}`}
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          placeholder="e.g., Family Floater Plan"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`product-description-${index}`}>Description</Label>
                        <Textarea
                          id={`product-description-${index}`}
                          value={product.description}
                          onChange={(e) => updateProduct(index, 'description', e.target.value)}
                          placeholder="Brief description of the product"
                          className="min-h-16"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`product-sum-${index}`}>Sum Insured (₹)</Label>
                          <Input
                            id={`product-sum-${index}`}
                            type="number"
                            value={product.sumInsured}
                            onChange={(e) => updateProduct(index, 'sumInsured', Number(e.target.value))}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`product-premium-${index}`}>Premium (₹)</Label>
                          <Input
                            id={`product-premium-${index}`}
                            type="number"
                            value={product.premium}
                            onChange={(e) => updateProduct(index, 'premium', Number(e.target.value))}
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Total Premium Display */}
                <Card className="bg-muted/50">
                  <CardContent className="py-4 px-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Premium:</span>
                      <span className="text-lg font-bold">₹{formData.premium.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormField('notes', e.target.value)}
                  placeholder="Add any additional notes or comments about this quotation"
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotationEdit;
