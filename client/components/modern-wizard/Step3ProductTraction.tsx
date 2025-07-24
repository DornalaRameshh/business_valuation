import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TrendingUp, ArrowLeft, Users, Zap, HelpCircle, ChevronDown, Search } from 'lucide-react';

const formSchema = z.object({
  customerCount: z.coerce.number().min(0, 'Customer count must be 0 or greater').optional(),
  growthRate: z.coerce.number().min(0, 'Growth rate must be 0 or greater').optional(),
  growthPeriod: z.string().optional(),
  uniqueValue: z.string().optional(),
  competitors: z.string().optional(),
  skipTraction: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Step3Props {
  onNext: (data: FormData) => void;
  onBack: () => void;
  initialData?: Partial<FormData>;
  onSave?: (data: Partial<FormData>) => void;
}

const growthPeriods = [
  { value: 'monthly', label: 'Monthly', description: 'Month-over-month growth' },
  { value: 'quarterly', label: 'Quarterly', description: 'Quarter-over-quarter growth' },
  { value: 'yearly', label: 'Yearly', description: 'Year-over-year growth' },
];

const commonCompetitors = [
  'Salesforce', 'HubSpot', 'Slack', 'Zoom', 'Shopify', 'Square', 'Stripe', 'Mailchimp',
  'Canva', 'Figma', 'Notion', 'Airtable', 'Monday.com', 'Asana', 'Trello', 'GitLab',
  'GitHub', 'AWS', 'Google Cloud', 'Microsoft Azure', 'Dropbox', 'Box', 'Adobe',
];

const placeholderTexts = {
  uniqueValue: [
    "Our AI processes data 10x faster than competitors...",
    "We're the only platform that combines X with Y...",
    "Our proprietary algorithm reduces costs by 50%...",
    "We solve the biggest pain point in [industry]...",
    "Our unique approach to [problem] saves customers [time/money]...",
  ],
};

export function Step3ProductTraction({ onNext, onBack, initialData, onSave }: Step3Props) {
  const [skipMode, setSkipMode] = useState(initialData?.skipTraction || false);
  const [showGrowthDropdown, setShowGrowthDropdown] = useState(false);
  const [competitorSearch, setCompetitorSearch] = useState('');
  const [showCompetitorSuggestions, setShowCompetitorSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerCount: initialData?.customerCount || undefined,
      growthRate: initialData?.growthRate || undefined,
      growthPeriod: initialData?.growthPeriod || 'monthly',
      uniqueValue: initialData?.uniqueValue || '',
      competitors: initialData?.competitors || '',
      skipTraction: initialData?.skipTraction || false,
    },
    mode: 'onChange'
  });

  const watchedValues = watch();
  const selectedGrowthPeriod = growthPeriods.find(p => p.value === watchedValues.growthPeriod);

  // Autosave functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave(watchedValues);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedValues, onSave]);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.uniqueValue.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = (data: FormData) => {
    if (skipMode) {
      onNext({ ...data, skipTraction: true });
    } else {
      onNext(data);
    }
  };

  const handleSkipToggle = () => {
    setSkipMode(!skipMode);
    setValue('skipTraction', !skipMode);
  };

  const handleGrowthPeriodSelect = (period: typeof growthPeriods[0]) => {
    setValue('growthPeriod', period.value, { shouldValidate: true });
    setShowGrowthDropdown(false);
  };

  const handleCompetitorSelect = (competitor: string) => {
    const currentCompetitors = watchedValues.competitors || '';
    const competitorList = currentCompetitors.split(',').map(c => c.trim()).filter(c => c);
    
    if (!competitorList.includes(competitor)) {
      const newValue = competitorList.length > 0 
        ? `${currentCompetitors}, ${competitor}`
        : competitor;
      setValue('competitors', newValue);
    }
    
    setCompetitorSearch('');
    setShowCompetitorSuggestions(false);
  };

  const filteredCompetitors = commonCompetitors.filter(comp =>
    comp.toLowerCase().includes(competitorSearch.toLowerCase()) &&
    !watchedValues.competitors?.includes(comp)
  );

  const formatNumber = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toLocaleString();
  };

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
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📈 Tell us how your startup is performing
          </h1>
          <p className="text-gray-600">
            Help us understand your traction and market position
          </p>
        </div>

        {/* Skip Option */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">
                Still building your product?
              </p>
              <p className="text-xs text-purple-700">
                No worries! Skip this section and we'll focus on your potential
              </p>
            </div>
            <button
              type="button"
              onClick={handleSkipToggle}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                skipMode
                  ? 'bg-purple-200 text-purple-800'
                  : 'bg-white text-purple-700 border border-purple-200'
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
                {/* Customer Count */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Customer Count or Active Users</span>
                      <div className="relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </div>
                    </label>
                    <button
                      type="button"
                      className="skip-button text-xs"
                      onClick={() => setValue('customerCount', undefined)}
                    >
                      I don't know
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      {...register('customerCount')}
                      type="number"
                      placeholder="e.g., 1,500"
                      className="wizard-input w-full"
                    />
                    {watchedValues.customerCount && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                        {formatNumber(Number(watchedValues.customerCount))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Include free users, paying customers, beta testers - any meaningful engagement
                  </p>
                  {errors.customerCount && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.customerCount.message}
                    </motion.p>
                  )}
                </div>

                {/* Growth Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Growth Rate</span>
                    </label>
                    <button
                      type="button"
                      className="skip-button text-xs"
                      onClick={() => {
                        setValue('growthRate', undefined);
                        setValue('growthPeriod', undefined);
                      }}
                    >
                      Skip for now
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        {...register('growthRate')}
                        type="number"
                        step="0.1"
                        placeholder="5"
                        className="wizard-input w-full pr-8"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowGrowthDropdown(!showGrowthDropdown)}
                        className="wizard-input w-full flex items-center justify-between"
                      >
                        <span className={selectedGrowthPeriod ? 'text-gray-900' : 'text-gray-500'}>
                          {selectedGrowthPeriod?.label || 'Period'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>

                      <AnimatePresence>
                        {showGrowthDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50"
                          >
                            {growthPeriods.map((period) => (
                              <button
                                key={period.value}
                                type="button"
                                onClick={() => handleGrowthPeriodSelect(period)}
                                className="w-full flex flex-col items-start px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <span className="font-medium text-gray-900">{period.label}</span>
                                <span className="text-xs text-gray-600">{period.description}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Rough estimate is fine! This helps us project your potential
                  </p>
                  {errors.growthRate && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.growthRate.message}
                    </motion.p>
                  )}
                </div>

                {/* Unique Value Proposition */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span>What makes your product unique?</span>
                    </label>
                    <button
                      type="button"
                      className="skip-button text-xs"
                      onClick={() => setValue('uniqueValue', '')}
                    >
                      Skip for now
                    </button>
                  </div>
                  <motion.textarea
                    key={placeholderIndex}
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    {...register('uniqueValue')}
                    placeholder={placeholderTexts.uniqueValue[placeholderIndex]}
                    className="wizard-input w-full h-24 resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Your secret sauce - what problem do you solve better than anyone else?
                  </p>
                </div>

                {/* Competitors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <span>Main Competitors</span>
                    </label>
                    <button
                      type="button"
                      className="skip-button text-xs"
                      onClick={() => setValue('competitors', '')}
                    >
                      Skip for now
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={competitorSearch}
                        onChange={(e) => {
                          setCompetitorSearch(e.target.value);
                          setShowCompetitorSuggestions(true);
                        }}
                        onFocus={() => setShowCompetitorSuggestions(true)}
                        placeholder="Search or type competitor names..."
                        className="wizard-input w-full pl-10"
                      />
                    </div>

                    <AnimatePresence>
                      {showCompetitorSuggestions && competitorSearch && filteredCompetitors.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-40 overflow-y-auto"
                        >
                          {filteredCompetitors.slice(0, 5).map((competitor) => (
                            <button
                              key={competitor}
                              type="button"
                              onClick={() => handleCompetitorSelect(competitor)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              {competitor}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <textarea
                    {...register('competitors')}
                    placeholder="e.g., Salesforce, HubSpot, or describe similar companies..."
                    className="wizard-input w-full h-20 resize-none"
                  />
                  
                  <p className="text-xs text-gray-500">
                    Direct competitors, similar companies, or alternatives customers might consider
                  </p>
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
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-gray-600">
                Perfect! We'll focus on your industry potential and stage-based metrics.
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
