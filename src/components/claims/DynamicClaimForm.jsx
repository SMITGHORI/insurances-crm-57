
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { getSpecificFields } from '@/config/insuranceTypes';

const DynamicClaimForm = ({ 
  policyType, 
  typeSpecificData, 
  setTypeSpecificData, 
  formData, 
  setFormData 
}) => {
  const specificFields = getSpecificFields(policyType);

  if (!specificFields || Object.keys(specificFields).length === 0) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTypeSpecificData({
      ...typeSpecificData,
      [name]: value
    });
  };

  const handleSelectChange = (name, value) => {
    setTypeSpecificData({
      ...typeSpecificData,
      [name]: value
    });
  };

  const handleCheckboxChange = (name, checked) => {
    if (name === 'cashless') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setTypeSpecificData({
        ...typeSpecificData,
        [name]: checked
      });
    }
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = typeSpecificData[fieldName] || '';
    
    // Special handling for different field types
    if (fieldName === 'roomCategory') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <Select 
            value={value} 
            onValueChange={(val) => handleSelectChange(fieldName, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General Ward">General Ward</SelectItem>
              <SelectItem value="Semi-Private">Semi-Private</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Deluxe">Deluxe</SelectItem>
              <SelectItem value="ICU">ICU</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (fieldName === 'treatmentType') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <Select 
            value={value} 
            onValueChange={(val) => handleSelectChange(fieldName, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select treatment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Medical">Medical</SelectItem>
              <SelectItem value="Surgical">Surgical</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Diagnostic">Diagnostic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (fieldName === 'natureOfDeath') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <Select 
            value={value} 
            onValueChange={(val) => handleSelectChange(fieldName, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nature of death" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Natural">Natural</SelectItem>
              <SelectItem value="Accidental">Accidental</SelectItem>
              <SelectItem value="Suicide">Suicide</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (fieldName === 'propertyType') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <Select 
            value={value} 
            onValueChange={(val) => handleSelectChange(fieldName, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Residential House">Residential House</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Commercial Office">Commercial Office</SelectItem>
              <SelectItem value="Shop/Retail">Shop/Retail</SelectItem>
              <SelectItem value="Warehouse">Warehouse</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (fieldName === 'damageType') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <Select 
            value={value} 
            onValueChange={(val) => handleSelectChange(fieldName, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select damage type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fire Damage">Fire Damage</SelectItem>
              <SelectItem value="Water Damage">Water Damage</SelectItem>
              <SelectItem value="Storm Damage">Storm Damage</SelectItem>
              <SelectItem value="Theft/Burglary">Theft/Burglary</SelectItem>
              <SelectItem value="Earthquake">Earthquake</SelectItem>
              <SelectItem value="Flood">Flood</SelectItem>
              <SelectItem value="Electrical">Electrical Damage</SelectItem>
              <SelectItem value="Vandalism">Vandalism</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Date fields
    if (fieldName.toLowerCase().includes('date')) {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id={fieldName}
              name={fieldName}
              type="date"
              value={value}
              onChange={handleInputChange}
              className="pl-10"
            />
          </div>
        </div>
      );
    }

    // Boolean/Checkbox fields
    if (fieldName === 'cashless' || fieldName === 'preAuthApproved' || fieldName === 'thirdPartyInvolved' || fieldName === 'temporaryAccommodation') {
      return (
        <div key={fieldName} className="flex items-center space-x-2 pt-6">
          <Checkbox 
            id={fieldName}
            name={fieldName}
            checked={fieldName === 'cashless' ? formData[fieldName] || false : typeSpecificData[fieldName] || false}
            onCheckedChange={(checked) => handleCheckboxChange(fieldName, checked)}
          />
          <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
        </div>
      );
    }

    // Number fields
    if (fieldName.toLowerCase().includes('amount') || fieldName.toLowerCase().includes('cost') || fieldName.toLowerCase().includes('value') || fieldName === 'vehicleYear') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <Input
            id={fieldName}
            name={fieldName}
            type="number"
            value={value}
            onChange={handleInputChange}
            placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
          />
        </div>
      );
    }

    // Textarea for longer text fields
    if (fieldName.toLowerCase().includes('description') || fieldName.toLowerCase().includes('history') || fieldName.toLowerCase().includes('details')) {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldConfig.label} {fieldConfig.required && '*'}
          </Label>
          <Textarea
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={handleInputChange}
            placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
            rows={3}
          />
        </div>
      );
    }

    // Default input field
    return (
      <div key={fieldName} className="space-y-2">
        <Label htmlFor={fieldName}>
          {fieldConfig.label} {fieldConfig.required && '*'}
        </Label>
        <Input
          id={fieldName}
          name={fieldName}
          value={value}
          onChange={handleInputChange}
          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
        />
      </div>
    );
  };

  const getCardTitle = () => {
    switch (policyType) {
      case 'Health Insurance':
        return 'Medical Details';
      case 'Term Life Insurance':
        return 'Life Insurance Claim Details';
      case 'Vehicle Insurance':
        return 'Vehicle Accident Details';
      case 'Property Insurance':
        return 'Property Damage Details';
      default:
        return 'Insurance Specific Details';
    }
  };

  const getCardDescription = () => {
    switch (policyType) {
      case 'Health Insurance':
        return 'Provide hospital and treatment information';
      case 'Term Life Insurance':
        return 'Provide details about the insured and circumstances';
      case 'Vehicle Insurance':
        return 'Provide vehicle and accident information';
      case 'Property Insurance':
        return 'Provide property and damage information';
      default:
        return 'Provide specific details for this insurance type';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{getCardTitle()}</CardTitle>
        <CardDescription>{getCardDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(specificFields).map(([fieldName, fieldConfig]) => 
            renderField(fieldName, fieldConfig)
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicClaimForm;
