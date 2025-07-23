import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2 } from 'lucide-react';
import { apiService, StartupInput } from '@/lib/api';

const formSchema = z.object({
  revenue: z.coerce.number().min(0, 'Revenue must be positive').optional(),
  customers: z.coerce.number().min(0, 'Customer count must be positive').optional(),
  teamSize: z.coerce.number().min(1, 'Team size must be at least 1').optional(),
  marketSize: z.coerce.number().min(0, 'Market size must be positive').optional(),
  industry: z.string().min(1, 'Please select an industry'),
  stage: z.string().min(1, 'Please select a stage'),
  fundingRaised: z.coerce.number().min(0, 'Funding raised must be positive').optional(),
  burnRate: z.coerce.number().min(0, 'Burn rate must be positive').optional(),
  growthRate: z.coerce.number().min(0, 'Growth rate must be positive').optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface StartupInfoFormProps {
  userID: string;
  onSubmitSuccess: (data: StartupInput) => void;
  onSubmitError: (error: string) => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Food & Beverage',
  'Transportation',
  'Entertainment',
  'Other'
];

const stages = [
  'Idea',
  'Prototype',
  'MVP',
  'Early Revenue',
  'Growth',
  'Scale',
  'Mature'
];

export function StartupInfoForm({ userID, onSubmitSuccess, onSubmitError }: StartupInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedIndustry = watch('industry');
  const selectedStage = watch('stage');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const startupInput: StartupInput = {
        ...data,
        // Convert string values to numbers where needed
        revenue: data.revenue || undefined,
        customers: data.customers || undefined,
        teamSize: data.teamSize || undefined,
        marketSize: data.marketSize || undefined,
        fundingRaised: data.fundingRaised || undefined,
        burnRate: data.burnRate || undefined,
        growthRate: data.growthRate || undefined,
      };

      await apiService.saveInput({
        userID,
        currentInput: startupInput
      });

      onSubmitSuccess(startupInput);
    } catch (err: any) {
      console.error('Form submission error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);

      const errorMessage = err.response?.data?.message || err.message || 'Failed to save startup information. Please try again.';
      setError(errorMessage);
      onSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Startup Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={selectedIndustry} onValueChange={(value) => setValue('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-destructive">{errors.industry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Business Stage *</Label>
              <Select value={selectedStage} onValueChange={(value) => setValue('stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stage && (
                <p className="text-sm text-destructive">{errors.stage.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                placeholder="0"
                {...register('revenue')}
              />
              {errors.revenue && (
                <p className="text-sm text-destructive">{errors.revenue.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customers">Number of Customers</Label>
              <Input
                id="customers"
                type="number"
                placeholder="0"
                {...register('customers')}
              />
              {errors.customers && (
                <p className="text-sm text-destructive">{errors.customers.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                placeholder="1"
                {...register('teamSize')}
              />
              {errors.teamSize && (
                <p className="text-sm text-destructive">{errors.teamSize.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketSize">Total Market Size ($)</Label>
              <Input
                id="marketSize"
                type="number"
                placeholder="0"
                {...register('marketSize')}
              />
              {errors.marketSize && (
                <p className="text-sm text-destructive">{errors.marketSize.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fundingRaised">Funding Raised ($)</Label>
              <Input
                id="fundingRaised"
                type="number"
                placeholder="0"
                {...register('fundingRaised')}
              />
              {errors.fundingRaised && (
                <p className="text-sm text-destructive">{errors.fundingRaised.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="burnRate">Monthly Burn Rate ($)</Label>
              <Input
                id="burnRate"
                type="number"
                placeholder="0"
                {...register('burnRate')}
              />
              {errors.burnRate && (
                <p className="text-sm text-destructive">{errors.burnRate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="growthRate">Monthly Growth Rate (%)</Label>
            <Input
              id="growthRate"
              type="number"
              placeholder="0"
              {...register('growthRate')}
            />
            {errors.growthRate && (
              <p className="text-sm text-destructive">{errors.growthRate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your business..."
              {...register('description')}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Save Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
