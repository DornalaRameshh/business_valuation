import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, ArrowLeft, Users, AlertCircle, Zap } from 'lucide-react';

const formSchema = z.object({
  activeUsers: z.coerce.number().min(0, 'Users must be 0 or greater').optional(),
  growthRate: z.coerce.number().min(0, 'Growth rate must be 0 or greater').optional(),
  differentiator: z.string().optional(),
  competitors: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Step3Props {
  onNext: (data: FormData) => void;
  onBack: () => void;
  initialData?: Partial<FormData>;
}

export function Step3ProductTraction({ onNext, onBack, initialData }: Step3Props) {
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activeUsers: initialData?.activeUsers || undefined,
      growthRate: initialData?.growthRate || undefined,
      differentiator: initialData?.differentiator || '',
      competitors: initialData?.competitors || '',
    },
    mode: 'onChange'
  });

  const onSubmit = (data: FormData) => {
    setError('');
    onNext(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-green-50 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-400 to-green-400 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Product & Traction
          </CardTitle>
          <p className="text-slate-600 mt-2">Show us how your product is doing in the wild 📈</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Active Users/Customers */}
            <div className="space-y-2">
              <Label htmlFor="activeUsers" className="text-slate-700 font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-purple-500" />
                Active Users or Customers 👥
              </Label>
              <Input
                id="activeUsers"
                type="number"
                placeholder="Enter number of users/customers"
                className="border-slate-300 focus:border-purple-400 focus:ring-purple-200 transition-all duration-200"
                {...register('activeUsers')}
              />
              <p className="text-xs text-slate-500">
                Ballpark is fine! Even early signals matter. Include free users, paying customers, beta testers, etc.
              </p>
              {errors.activeUsers && (
                <p className="text-sm text-red-500">{errors.activeUsers.message}</p>
              )}
            </div>

            {/* Growth Rate */}
            <div className="space-y-2">
              <Label htmlFor="growthRate" className="text-slate-700 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Monthly/Quarterly Growth Rate 📊
              </Label>
              <div className="relative">
                <Input
                  id="growthRate"
                  type="number"
                  step="0.1"
                  placeholder="Enter growth percentage"
                  className="pr-8 border-slate-300 focus:border-purple-400 focus:ring-purple-200 transition-all duration-200"
                  {...register('growthRate')}
                />
                <span className="absolute right-3 top-3 text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">
                Rough idea or % growth helps us project potential. Month-over-month or quarter-over-quarter both work!
              </p>
              {errors.growthRate && (
                <p className="text-sm text-red-500">{errors.growthRate.message}</p>
              )}
            </div>

            {/* Differentiator */}
            <div className="space-y-2">
              <Label htmlFor="differentiator" className="text-slate-700 font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                What makes you stand out? ⚡
              </Label>
              <Textarea
                id="differentiator"
                placeholder="Tell us about your secret sauce, unique value proposition, or what sets you apart..."
                className="border-slate-300 focus:border-purple-400 focus:ring-purple-200 transition-all duration-200 min-h-[100px]"
                {...register('differentiator')}
              />
              <p className="text-xs text-slate-500">
                Just a line or two on your secret sauce. What problem do you solve better than anyone else?
              </p>
              {errors.differentiator && (
                <p className="text-sm text-red-500">{errors.differentiator.message}</p>
              )}
            </div>

            {/* Competitors */}
            <div className="space-y-2">
              <Label htmlFor="competitors" className="text-slate-700 font-medium">
                Known Competitors (if any) 🏁
              </Label>
              <Textarea
                id="competitors"
                placeholder="List your main competitors, or companies you're often compared to..."
                className="border-slate-300 focus:border-purple-400 focus:ring-purple-200 transition-all duration-200 min-h-[80px]"
                {...register('competitors')}
              />
              <p className="text-xs text-slate-500">
                Optional – helps with benchmarking. Include direct competitors, similar companies, or alternatives customers might consider.
              </p>
              {errors.competitors && (
                <p className="text-sm text-red-500">{errors.competitors.message}</p>
              )}
            </div>

            {/* Encouraging Message */}
            <div className="bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
              </div>
              <p className="text-sm font-medium text-slate-800">Almost there! 🎉</p>
              <p className="text-sm text-slate-600">
                You're doing great! Next up, we'll let our AI analyze everything and give you personalized insights.
              </p>
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
                className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                Next: Let AI Work Its Magic →
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
