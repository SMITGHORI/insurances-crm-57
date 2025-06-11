
import React, { useMemo, useCallback, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useDebouncedValue } from '../../hooks/useDebouncedSearch';

const OptimizedForm = ({ 
  fields = [], 
  initialData = {},
  onSubmit,
  onFieldChange,
  isLoading = false,
  className = "",
  componentName = "OptimizedForm"
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  
  // Performance monitoring
  const { renderTime } = usePerformanceMonitor(componentName);

  // Memoized field groups for better rendering
  const fieldGroups = useMemo(() => {
    return fields.reduce((groups, field) => {
      const group = field.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(field);
      return groups;
    }, {});
  }, [fields]);

  // Memoized validation
  const validateField = useCallback((field, value) => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }
    
    if (field.validation) {
      return field.validation(value);
    }
    
    return null;
  }, []);

  // Handle field changes with debouncing for expensive operations
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      
      // Validate field
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, value);
        setErrors(prevErrors => ({
          ...prevErrors,
          [fieldName]: error
        }));
      }
      
      // Call external onChange if provided
      onFieldChange?.(fieldName, value, newData);
      
      return newData;
    });
  }, [fields, validateField, onFieldChange]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    if (!hasErrors) {
      onSubmit?.(formData);
    }
  }, [fields, formData, validateField, onSubmit]);

  // Render field based on type
  const renderField = useCallback((field) => {
    const { name, type, label, placeholder, options, ...fieldProps } = field;
    const value = formData[name] || '';
    const error = errors[name];
    
    const fieldId = `field-${name}`;
    
    switch (type) {
      case 'select':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={fieldId}>{label}</Label>
            <Select 
              value={value} 
              onValueChange={(val) => handleFieldChange(name, val)}
            >
              <SelectTrigger id={fieldId}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={fieldId}>{label}</Label>
            <Textarea
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={placeholder}
              {...fieldProps}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
        
      default:
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={fieldId}>{label}</Label>
            <Input
              id={fieldId}
              type={type || 'text'}
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={placeholder}
              {...fieldProps}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  }, [formData, errors, handleFieldChange]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {Object.entries(fieldGroups).map(([groupName, groupFields]) => (
        <div key={groupName} className="space-y-4">
          {groupName !== 'default' && (
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              {groupName}
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupFields.map(renderField)}
          </div>
        </div>
      ))}
      
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-gray-500">
              Render: {renderTime}ms
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData(initialData)}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default React.memo(OptimizedForm);
