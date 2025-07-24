import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DollarSign, ArrowLeft, HelpCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  revenue: z.coerce.number().min(0, 'Revenue must be 0 or greater').optional(),
  monthlyBurnRate: z.coerce.number().min(0, 'Burn rate must be 0 or greater').optional(),
  netProfitLoss: z.coerce.number().optional(),
  fundingRaised: z.coerce.number().min(0, 'Funding raised must be 0 or greater').optional(),
  planningToRaise: z.coerce.number().min(0, 'Amount to raise must be 0 or greater').optional(),
  skipFinancials: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Step2Props {
  onNext: (data: FormData) => void;
  onBack: () => void;
  initialData?: Partial<FormData>;
  onSave?: (data: Partial<FormData>) => void;
}

interface TooltipData {
  revenue: "Your total income from all sources in the last 12 months. Include all revenue streams, subscriptions, one-time sales, etc.";
  monthlyBurnRate: "How much money you spend each month on average. Include salaries, rent, software, marketing, and all other expenses.";
  netProfitLoss: "Revenue minus expenses. Positive means profit, negative means loss. This helps us understand your current financial health.";
  fundingRaised: "Total amount of money you've raised from investors, grants, or loans since starting your business.";
  planningToRaise: "How much funding you're looking to raise in your next round. This helps tailor the valuation for your fundraising goals.";
}

const tooltips: TooltipData = {
  revenue: "Your total income from all sources in the last 12 months. Include all revenue streams, subscriptions, one-time sales, etc.",
  monthlyBurnRate: "How much money you spend each month on average. Include salaries, rent, software, marketing, and all other expenses.",
  netProfitLoss: "Revenue minus expenses. Positive means profit, negative means loss. This helps us understand your current financial health.",
  fundingRaised: "Total amount of money you've raised from investors, grants, or loans since starting your business.",
  planningToRaise: "How much funding you're looking to raise in your next round. This helps tailor the valuation for your fundraising goals.",
};

export function Step2FinancialSnapshot({ onNext, onBack, initialData, onSave }: Step2Props) {
  const [showTooltip, setShowTooltip] = useState<keyof TooltipData | null>(null);
  const [skipMode, setSkipMode] = useState(initialData?.skipFinancials || false);
  const [showValues, setShowValues] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: initialData?.revenue || undefined,
      monthlyBurnRate: initialData?.monthlyBurnRate || undefined,
      netProfitLoss: initialData?.netProfitLoss || undefined,
      fundingRaised: initialData?.fundingRaised || undefined,
      planningToRaise: initialData?.planningToRaise || undefined,
      skipFinancials: initialData?.skipFinancials || false,
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Autosave functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave(watchedValues);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedValues, onSave]);

  const onSubmit = (data: FormData) => {
    if (skipMode) {
      onNext({ ...data, skipFinancials: true });
    } else {
      onNext(data);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const handleSkipToggle = () => {
    setSkipMode(!skipMode);
    setValue('skipFinancials', !skipMode);
  };

  const renderTooltip = (field: keyof TooltipData) => (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(field)}
        onMouseLeave={() => setShowTooltip(null)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {showTooltip === field && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg z-50"
          >
            <div className="relative">
              {tooltips[field]}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderCurrencyInput = (
    name: keyof FormData,
    label: string,
    placeholder: string,
    tooltipKey: keyof TooltipData,
    isOptional = false
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
          <span>{label}</span>
          {renderTooltip(tooltipKey)}
          {isOptional && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
          )}
        </label>
        <button
          type="button"
          className="skip-button text-xs"
          onClick={() => setValue(name, undefined)}
        >
          Clear
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
          $
        </div>
        <input
          {...register(name)}
          type="number"
          placeholder={placeholder}
          className="wizard-input w-full pl-8"
          disabled={skipMode}
        />
        {watchedValues[name] && showValues && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
            {formatCurrency(Number(watchedValues[name]))}
          </div>
        )}
      </div>
      {errors[name] && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-red-500"
        >
          {errors[name]?.message}
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="wizard-card p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <DollarSign className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 Tell us about your finances
          </h1>
          <p className="text-gray-600">
            We keep it confidential and use this to provide more accurate valuations
          </p>
        </div>

        {/* Skip Option */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">
                Not ready to share financials?
              </p>
              <p className="text-xs text-amber-700">
                You can skip this step and we'll estimate based on your industry and stage
              </p>
            </div>
            <button
              type="button"
              onClick={handleSkipToggle}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                skipMode
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-white text-amber-700 border border-amber-200'
              }`}
            >
              {skipMode ? 'Fill Details' : 'Skip This Step'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence>
            {!skipMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-700">Show values as you type</span>
                  <button
                    type="button"
                    onClick={() => setShowValues(!showValues)}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{showValues ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                {/* Revenue */}
                {renderCurrencyInput(
                  'revenue',
                  'Total Revenue (Last 12 Months)',
                  '0',
                  'revenue'
                )}

                {/* Monthly Burn Rate */}
                {renderCurrencyInput(
                  'monthlyBurnRate',
                  'Monthly Burn Rate',
                  '0',
                  'monthlyBurnRate'
                )}

                {/* Net Profit/Loss */}
                {renderCurrencyInput(
                  'netProfitLoss',
                  'Net Profit / Loss (Monthly)',
                  '0 (can be negative)',
                  'netProfitLoss',
                  true
                )}

                {/* Funding Raised */}
                {renderCurrencyInput(
                  'fundingRaised',
                  'Total Funding Raised',
                  '0',
                  'fundingRaised',
                  true
                )}

                {/* Planning to Raise */}
                {renderCurrencyInput(
                  'planningToRaise',
                  'Amount You Want to Raise',
                  '0',
                  'planningToRaise',
                  true
                )}

                {/* Helper Text */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">💡 Pro Tip</p>
                      <p className="text-sm text-blue-700">
                        Don't worry if you're not sure about exact numbers. We'll help estimate based on your industry benchmarks and stage.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {skipMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-gray-600">
                No problem! We'll estimate your financials based on your industry and stage.
              </p>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex space-x-4 pt-6">
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="wizard-button-secondary flex items-center space-x-2 px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="wizard-button-primary flex-1 py-3 text-lg font-semibold"
            >
              → Next
            </motion.button>
          </div>
        </form>

        {/* Auto-save indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your progress is automatically saved
          </p>
        </div>
      </motion.div>
    </div>
  );
}
