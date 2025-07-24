import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, CheckCircle, TrendingUp, Users, DollarSign,
  FileText, Download, Share2, RefreshCw, Sparkles,
  ArrowRight, Clock, Target, AlertCircle, Brain,
  BarChart3, Zap, Eye
} from 'lucide-react';
import { fastapiService, ValuationReport, WizardData } from '@/lib/fastapi';

interface ConfirmationStepProps {
  wizardData: any;
  onStartOver: () => void;
  userID: string;
}

export function ConfirmationStep({ wizardData, onStartOver, userID }: ConfirmationStepProps) {
  const [confidence, setConfidence] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [mockValuation, setMockValuation] = useState<number | null>(null);

  // Calculate confidence score based on data completeness
  useEffect(() => {
    let score = 30; // Base score

    // Step 1 data
    if (wizardData.step1) {
      score += 20; // Basic info provided
    }

    // Step 2 data
    if (wizardData.step2 && !wizardData.step2.skipFinancials) {
      if (wizardData.step2.revenue !== undefined) score += 15;
      if (wizardData.step2.monthlyBurnRate !== undefined) score += 10;
      if (wizardData.step2.fundingRaised !== undefined) score += 5;
    }

    // Step 3 data
    if (wizardData.step3 && !wizardData.step3.skipTraction) {
      if (wizardData.step3.customerCount !== undefined) score += 10;
      if (wizardData.step3.growthRate !== undefined) score += 10;
      if (wizardData.step3.uniqueValue) score += 5;
    }

    // Step 4 data
    if (wizardData.step4 && !wizardData.step4.skipExtras) {
      if (wizardData.step4.uploadedFiles?.length > 0) score += 10;
      if (wizardData.step4.linkedinUrl) score += 2;
      if (wizardData.step4.websiteUrl) score += 3;
    }

    const finalScore = Math.min(score, 100);
    
    // Animate confidence meter
    const timer = setTimeout(() => {
      setConfidence(finalScore);
    }, 1000);

    return () => clearTimeout(timer);
  }, [wizardData]);

  // Generate mock valuation
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock valuation based on industry and stage
      const baseValuation = getBaseValuation();
      const adjustedValuation = adjustValuationBasedOnData(baseValuation);
      setMockValuation(adjustedValuation);
      setIsGenerating(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [wizardData]);

  const getBaseValuation = () => {
    const industry = wizardData.step1?.industry;
    const stage = wizardData.step1?.stage;

    let base = 1000000; // $1M base

    // Industry multipliers
    const industryMultipliers: Record<string, number> = {
      'saas': 3,
      'ai': 4,
      'fintech': 3.5,
      'healthtech': 2.5,
      'biotech': 2,
      'ecommerce': 1.5,
      'other': 1
    };

    // Stage multipliers
    const stageMultipliers: Record<string, number> = {
      'idea': 0.5,
      'mvp': 1,
      'launched': 2,
      'growth': 4
    };

    base *= (industryMultipliers[industry] || 1);
    base *= (stageMultipliers[stage] || 1);

    return base;
  };

  const adjustValuationBasedOnData = (base: number) => {
    let adjusted = base;

    // Revenue adjustment
    if (wizardData.step2?.revenue && wizardData.step2.revenue > 0) {
      const revenueMultiple = wizardData.step1?.industry === 'saas' ? 8 : 4;
      adjusted = Math.max(adjusted, wizardData.step2.revenue * revenueMultiple);
    }

    // Growth adjustment
    if (wizardData.step3?.growthRate && wizardData.step3.growthRate > 10) {
      adjusted *= (1 + wizardData.step3.growthRate / 100);
    }

    // Customer count adjustment
    if (wizardData.step3?.customerCount && wizardData.step3.customerCount > 1000) {
      adjusted *= 1.2;
    }

    return Math.round(adjusted);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(2)}B`;
    } else if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(2)}M`;
    } else if (amount >= 1e3) {
      return `$${(amount / 1e3).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Good Confidence';
    if (score >= 40) return 'Moderate Confidence';
    return 'Initial Estimate';
  };

  const getSummaryStats = () => {
    const stats = [];
    
    if (wizardData.step1?.businessName) {
      stats.push({ 
        icon: FileText, 
        label: 'Business', 
        value: wizardData.step1.businessName,
        color: 'text-blue-600'
      });
    }

    if (wizardData.step1?.industry) {
      stats.push({ 
        icon: Target, 
        label: 'Industry', 
        value: wizardData.step1.industry.charAt(0).toUpperCase() + wizardData.step1.industry.slice(1),
        color: 'text-purple-600'
      });
    }

    if (wizardData.step2?.revenue && wizardData.step2.revenue > 0) {
      stats.push({ 
        icon: DollarSign, 
        label: 'Revenue', 
        value: formatCurrency(wizardData.step2.revenue),
        color: 'text-green-600'
      });
    }

    if (wizardData.step3?.customerCount && wizardData.step3.customerCount > 0) {
      stats.push({ 
        icon: Users, 
        label: 'Customers', 
        value: wizardData.step3.customerCount.toLocaleString(),
        color: 'text-orange-600'
      });
    }

    return stats;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 You're all set!
          </h1>
          <p className="text-xl text-gray-600">
            Your startup valuation is being generated using AI analysis
          </p>
        </motion.div>

        {/* Confidence Meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="wizard-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Valuation Confidence
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
              {getConfidenceLabel(confidence)}
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span className="font-medium">{confidence}%</span>
              <span>100%</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-3">
            Based on the completeness and quality of your provided information
          </p>
        </motion.div>

        {/* Valuation Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="wizard-card p-8 mb-8 text-center"
        >
          {isGenerating ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Analyzing your startup...
              </h3>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">This usually takes 30-60 seconds</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Estimated Valuation
                </h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {mockValuation ? formatCurrency(mockValuation) : 'Calculating...'}
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Analysis complete</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Summary Stats */}
        {!isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {getSummaryStats().map((stat, index) => (
              <div key={index} className="wizard-card p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="font-semibold text-gray-900 text-sm truncate">
                  {stat.value}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
        >
          <button
            onClick={() => {
              // Mock download functionality
              const data = {
                valuation: mockValuation,
                confidence: confidence,
                timestamp: new Date().toISOString(),
                businessName: wizardData.step1?.businessName,
                ...wizardData
              };
              
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${wizardData.step1?.businessName || 'startup'}-valuation.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            disabled={isGenerating}
            className="wizard-button-primary flex items-center justify-center space-x-2 py-3 px-6 text-lg font-semibold"
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </button>
          
          <button
            onClick={() => {
              // Mock share functionality
              if (navigator.share) {
                navigator.share({
                  title: `${wizardData.step1?.businessName} Valuation`,
                  text: `Check out my startup valuation: ${mockValuation ? formatCurrency(mockValuation) : 'TBD'}`,
                  url: window.location.href
                });
              } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(`${wizardData.step1?.businessName} valuation: ${mockValuation ? formatCurrency(mockValuation) : 'TBD'}`);
              }
            }}
            disabled={isGenerating}
            className="wizard-button-secondary flex items-center justify-center space-x-2 py-3 px-6"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Results</span>
          </button>
          
          <button
            onClick={onStartOver}
            className="wizard-button-secondary flex items-center justify-center space-x-2 py-3 px-6"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Start Over</span>
          </button>
        </motion.div>

        {/* Next Steps */}
        {!isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-8 wizard-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ArrowRight className="w-5 h-5 mr-2 text-blue-600" />
              What's Next?
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• Use this valuation as a starting point for investor discussions</p>
              <p>• Consider getting a professional valuation for formal fundraising</p>
              <p>• Update your numbers as your business grows and re-run the analysis</p>
              <p>• Focus on the key metrics that drive value in your industry</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
