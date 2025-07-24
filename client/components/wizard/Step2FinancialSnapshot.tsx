import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, ArrowLeft, Lightbulb, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  revenue: z.coerce.number().min(0, 'Revenue must be 0 or greater').optional(),
  monthlyBurnRate: z.coerce.number().min(0, 'Burn rate must be 0 or greater').optional(),
  netProfitLoss: z.coerce.number().optional(),
  fundingRaised: z.coerce.number().min(0, 'Funding raised must be 0 or greater').optional(),
  planningToRaise: z.coerce.number().min(0, 'Planning to raise must be 0 or greater').optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Step2Props {
  onNext: (data: FormData) => void;
  onBack: () => void;
  initialData?: Partial<FormData>;
}

export function Step2FinancialSnapshot({ onNext, onBack, initialData }: Step2Props) {
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: initialData?.revenue || undefined,
      monthlyBurnRate: initialData?.monthlyBurnRate || undefined,
      netProfitLoss: initialData?.netProfitLoss || undefined,
      fundingRaised: initialData?.fundingRaised || undefined,
      planningToRaise: initialData?.planningToRaise || undefined,
    },
    mode: 'onChange'
  });

  const onSubmit = (data: FormData) => {
    setError('');
    onNext(data);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Financial Snapshot
          </CardTitle>
          <p className="text-slate-600 mt-2">Let's talk money – just enough to get started 💸</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Revenue */}
            <div className="space-y-2">
              <Label htmlFor="revenue" className="text-slate-700 font-medium">
                Revenue (Last 12 Months) 📊
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">$</span>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="0"
                  className="pl-8 border-slate-300 focus:border-green-400 focus:ring-green-200 transition-all duration-200"
                  {...register('revenue')}
                />
              </div>
              <p className="text-xs text-slate-500">
                If you haven't made money yet, just type 0 – we got you! 🤗
              </p>
              {errors.revenue && (
                <p className="text-sm text-red-500">{errors.revenue.message}</p>
              )}
            </div>

            {/* Monthly Burn Rate */}
            <div className="space-y-2">
              <Label htmlFor="monthlyBurnRate" className="text-slate-700 font-medium">
                Monthly Burn Rate 🔥
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">$</span>
                <Input
                  id="monthlyBurnRate"
                  type="number"
                  placeholder="0"
                  className="pl-8 border-slate-300 focus:border-green-400 focus:ring-green-200 transition-all duration-200"
                  {...register('monthlyBurnRate')}
                />
              </div>
              <p className="text-xs text-slate-500">
                Roughly how much do you spend monthly? We'll help you estimate if unsure.
              </p>
              {errors.monthlyBurnRate && (
                <p className="text-sm text-red-500">{errors.monthlyBurnRate.message}</p>
              )}
            </div>

            {/* Net Profit/Loss */}
            <div className="space-y-2">
              <Label htmlFor="netProfitLoss" className="text-slate-700 font-medium">
                Net Profit or Loss (Monthly) 📈
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">$</span>
                <Input
                  id="netProfitLoss"
                  type="number"
                  placeholder="0 (can be negative)"
                  className="pl-8 border-slate-300 focus:border-green-400 focus:ring-green-200 transition-all duration-200"
                  {...register('netProfitLoss')}
                />
              </div>
              <p className="text-xs text-slate-500">
                Optional – helps with better accuracy. Use negative numbers for losses.
              </p>
              {errors.netProfitLoss && (
                <p className="text-sm text-red-500">{errors.netProfitLoss.message}</p>
              )}
            </div>

            {/* Funding Raised to Date */}
            <div className="space-y-2">
              <Label htmlFor="fundingRaised" className="text-slate-700 font-medium">
                Funding Raised to Date 💰
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">$</span>
                <Input
                  id="fundingRaised"
                  type="number"
                  placeholder="0"
                  className="pl-8 border-slate-300 focus:border-green-400 focus:ring-green-200 transition-all duration-200"
                  {...register('fundingRaised')}
                />
              </div>
              <p className="text-xs text-slate-500">
                If you've raised money before, tell us how much (total amount).
              </p>
              {errors.fundingRaised && (
                <p className="text-sm text-red-500">{errors.fundingRaised.message}</p>
              )}
            </div>

            {/* Planning to Raise */}
            <div className="space-y-2">
              <Label htmlFor="planningToRaise" className="text-slate-700 font-medium">
                How much are you planning to raise? 🎯
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">$</span>
                <Input
                  id="planningToRaise"
                  type="number"
                  placeholder="0"
                  className="pl-8 border-slate-300 focus:border-green-400 focus:ring-green-200 transition-all duration-200"
                  {...register('planningToRaise')}
                />
              </div>
              <p className="text-xs text-slate-500">
                This helps tailor your valuation for fundraising.
              </p>
              {errors.planningToRaise && (
                <p className="text-sm text-red-500">{errors.planningToRaise.message}</p>
              )}
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">💡 Pro Tip</p>
                <p className="text-sm text-blue-700">
                  Not sure about everything? Just leave it blank – AI fills the gaps based on your industry and stage!
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 h-12 border-slate-300 text-slate-600 hover:bg-slate-50 transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                Next: Product & Traction →
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
