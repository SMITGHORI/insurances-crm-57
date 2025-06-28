
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import Protected from '@/components/Protected';
import { useCreateQuote } from '@/hooks/useQuotes';
import { toast } from 'sonner';

const quoteFormSchema = z.object({
  carrier: z.string().min(1, 'Carrier is required'),
  premium: z.number().min(0.01, 'Premium must be greater than 0'),
  coverageAmount: z.number().min(1, 'Coverage amount is required'),
  validUntil: z.date({
    required_error: 'Valid until date is required',
  }),
  notes: z.string().optional(),
  riskProfile: z.object({
    age: z.number().optional(),
    location: z.string().optional(),
    vehicleType: z.string().optional(),
    healthStatus: z.string().optional(),
  }).optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  leadId: string;
  onQuoteCreated: () => void;
}

const INSURANCE_CARRIERS = [
  'State Farm',
  'Geico',
  'Progressive',
  'Allstate',
  'USAA',
  'Liberty Mutual',
  'Farmers',
  'Nationwide',
  'American Family',
  'Travelers'
];

const QuoteForm: React.FC<QuoteFormProps> = ({ leadId, onQuoteCreated }) => {
  const { hasPermission } = usePermissions();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const createQuoteMutation = useCreateQuote();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      premium: 0,
      coverageAmount: 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: '',
    },
  });

  const selectedDate = watch('validUntil');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setUploadedFile(file);
        toast.success('Document uploaded successfully');
      } else {
        toast.error('Please upload a PDF or image file');
      }
    }
  };

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const formData = new FormData();
      formData.append('leadId', leadId);
      formData.append('carrier', data.carrier);
      formData.append('premium', data.premium.toString());
      formData.append('coverageAmount', data.coverageAmount.toString());
      formData.append('validUntil', data.validUntil.toISOString());
      if (data.notes) {
        formData.append('notes', data.notes);
      }
      if (uploadedFile) {
        formData.append('document', uploadedFile);
      }

      await createQuoteMutation.mutateAsync(formData);
      
      reset();
      setUploadedFile(null);
      onQuoteCreated();
    } catch (error) {
      console.error('Failed to create quote:', error);
      toast.error('Failed to create quote. Please try again.');
    }
  };

  const calculateValueScore = (coverage: number, premium: number) => {
    if (premium === 0) return 0;
    return Math.round((coverage / premium) * 100) / 100;
  };

  const currentValueScore = calculateValueScore(
    watch('coverageAmount') || 0,
    watch('premium') || 0
  );

  return (
    <Protected module="quotations" action="create">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carrier Selection */}
          <div className="space-y-2">
            <Label htmlFor="carrier">Insurance Carrier *</Label>
            <Select onValueChange={(value) => setValue('carrier', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {INSURANCE_CARRIERS.map((carrier) => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.carrier && (
              <p className="text-sm text-red-600">{errors.carrier.message}</p>
            )}
          </div>

          {/* Premium */}
          <div className="space-y-2">
            <Label htmlFor="premium">Premium ($) *</Label>
            <Input
              id="premium"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter premium amount"
              {...register('premium', { valueAsNumber: true })}
            />
            {errors.premium && (
              <p className="text-sm text-red-600">{errors.premium.message}</p>
            )}
          </div>

          {/* Coverage Amount */}
          <div className="space-y-2">
            <Label htmlFor="coverageAmount">Coverage Amount ($) *</Label>
            <Input
              id="coverageAmount"
              type="number"
              min="0"
              placeholder="Enter coverage amount"
              {...register('coverageAmount', { valueAsNumber: true })}
            />
            {errors.coverageAmount && (
              <p className="text-sm text-red-600">{errors.coverageAmount.message}</p>
            )}
          </div>

          {/* Valid Until Date */}
          <div className="space-y-2">
            <Label>Valid Until *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue('validUntil', date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.validUntil && (
              <p className="text-sm text-red-600">{errors.validUntil.message}</p>
            )}
          </div>
        </div>

        {/* Value Score Display */}
        {currentValueScore > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  Value Score: {currentValueScore}
                </span>
                <span className="text-xs text-green-600">
                  (Coverage ÷ Premium ratio)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Upload */}
        <div className="space-y-2">
          <Label htmlFor="document">Quote Document (PDF/Image)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="document" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {uploadedFile ? uploadedFile.name : 'Upload quote document'}
                  </span>
                  <input
                    id="document"
                    name="document"
                    type="file"
                    className="sr-only"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PDF or image files up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes about this quote..."
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setUploadedFile(null);
            }}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !hasPermission('quotations', 'create')}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Create Quote
              </>
            )}
          </Button>
        </div>
      </form>
    </Protected>
  );
};

export default QuoteForm;
