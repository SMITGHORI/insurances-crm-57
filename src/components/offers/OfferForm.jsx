
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Save, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCreateOffer, useUpdateOffer, useOffer } from '@/hooks/useBroadcast';
import { cn } from '@/lib/utils';

const OfferForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // MongoDB-connected hooks
  const { data: existingOffer, isLoading: loadingOffer } = useOffer(id);
  const createOfferMutation = useCreateOffer();
  const updateOfferMutation = useUpdateOffer();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    discountType: 'percentage',
    discountPercentage: '',
    discountAmount: '',
    applicableProducts: [],
    validFrom: new Date(),
    validUntil: null,
    maxUsageCount: '',
    targetAudience: {
      allClients: true,
      specificClients: [],
      clientTypes: [],
      tierLevels: []
    },
    isActive: true,
    terms: ''
  });

  // Populate form data when editing
  useEffect(() => {
    if (isEditing && existingOffer) {
      console.log('Loading existing offer from MongoDB:', existingOffer);
      setFormData({
        title: existingOffer.title || '',
        description: existingOffer.description || '',
        type: existingOffer.type || '',
        discountType: existingOffer.discountPercentage ? 'percentage' : 'amount',
        discountPercentage: existingOffer.discountPercentage || '',
        discountAmount: existingOffer.discountAmount || '',
        applicableProducts: existingOffer.applicableProducts || [],
        validFrom: existingOffer.validFrom ? new Date(existingOffer.validFrom) : new Date(),
        validUntil: existingOffer.validUntil ? new Date(existingOffer.validUntil) : null,
        maxUsageCount: existingOffer.maxUsageCount || '',
        targetAudience: existingOffer.targetAudience || {
          allClients: true,
          specificClients: [],
          clientTypes: [],
          tierLevels: []
        },
        isActive: existingOffer.isActive !== undefined ? existingOffer.isActive : true,
        terms: existingOffer.terms || ''
      });
    }
  }, [isEditing, existingOffer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (product, isChecked) => {
    const updatedProducts = isChecked 
      ? [...formData.applicableProducts, product]
      : formData.applicableProducts.filter(p => p !== product);
    
    setFormData(prev => ({
      ...prev,
      applicableProducts: updatedProducts
    }));
  };

  const handleTargetAudienceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare offer data for MongoDB
    const offerData = {
      ...formData,
      ...(formData.discountType === 'percentage' 
        ? { discountPercentage: parseFloat(formData.discountPercentage), discountAmount: null }
        : { discountAmount: parseFloat(formData.discountAmount), discountPercentage: null }
      ),
      maxUsageCount: formData.maxUsageCount ? parseInt(formData.maxUsageCount) : -1, // -1 for unlimited
    };

    console.log('Submitting offer to MongoDB:', offerData);

    try {
      if (isEditing) {
        await updateOfferMutation.mutateAsync({
          offerId: id,
          offerData
        });
      } else {
        await createOfferMutation.mutateAsync(offerData);
      }
      
      navigate('/offers');
    } catch (error) {
      console.error('Error saving offer to MongoDB:', error);
    }
  };

  if (isEditing && loadingOffer) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/offers')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Offer' : 'Create New Offer'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connected to MongoDB • Real-time database operations
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter offer title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter offer description"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Offer Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select offer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="bonus_points">Bonus Points</SelectItem>
                    <SelectItem value="free_addon">Free Add-on</SelectItem>
                    <SelectItem value="premium_waiver">Premium Waiver</SelectItem>
                    <SelectItem value="special_rate">Special Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Discount Details */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Discount Type *</Label>
                <Select value={formData.discountType} onValueChange={(value) => handleInputChange('discountType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.discountType === 'percentage' ? (
                <div>
                  <Label htmlFor="discountPercentage">Discount Percentage (%) *</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                    placeholder="Enter discount percentage"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="discountAmount">Discount Amount (₹) *</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    min="0"
                    value={formData.discountAmount}
                    onChange={(e) => handleInputChange('discountAmount', e.target.value)}
                    placeholder="Enter discount amount"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applicable Products */}
          <Card>
            <CardHeader>
              <CardTitle>Applicable Products *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['health', 'life', 'motor', 'travel', 'home', 'business'].map((product) => (
                  <div key={product} className="flex items-center space-x-2">
                    <Checkbox
                      id={product}
                      checked={formData.applicableProducts.includes(product)}
                      onCheckedChange={(checked) => handleProductChange(product, checked)}
                    />
                    <Label htmlFor={product} className="capitalize">
                      {product} Insurance
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Valid From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !formData.validFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.validFrom ? format(formData.validFrom, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.validFrom}
                      onSelect={(date) => handleInputChange('validFrom', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Valid Until *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !formData.validUntil && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.validUntil ? format(formData.validUntil, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.validUntil}
                      onSelect={(date) => handleInputChange('validUntil', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="maxUsageCount">Maximum Usage Count</Label>
                <Input
                  id="maxUsageCount"
                  type="number"
                  min="0"
                  value={formData.maxUsageCount}
                  onChange={(e) => handleInputChange('maxUsageCount', e.target.value)}
                  placeholder="Leave empty for unlimited usage"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty for unlimited usage
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allClients"
                  checked={formData.targetAudience.allClients}
                  onCheckedChange={(checked) => handleTargetAudienceChange('allClients', checked)}
                />
                <Label htmlFor="allClients">Available to All Clients</Label>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                placeholder="Enter terms and conditions for this offer"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active (Offer is available to clients)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/offers')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOfferMutation.isLoading || updateOfferMutation.isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Offer' : 'Create Offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferForm;
