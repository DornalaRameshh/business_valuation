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
  wizardData: WizardData;
  onStartOver: () => void;
  userID: string;
}

export function ConfirmationStep({ wizardData, onStartOver, userID }: ConfirmationStepProps) {
  const [confidence, setConfidence] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [valuationReport, setValuationReport] = useState<ValuationReport | null>(null);
  const [error, setError] = useState<string>('');
  const [currentStage, setCurrentStage] = useState(1);

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

  // Generate real valuation using FastAPI backend
  useEffect(() => {
    const generateValuation = async () => {
      try {
        setIsGenerating(true);
        setError('');

        // Test connection first (but don't fail immediately)
        const canConnect = await fastapiService.testConnection();
        if (!canConnect) {
          console.warn('Backend connection test failed, attempting direct request...');
          // Don't throw error here, let the actual request handle it
        }

        // Simulate progress through stages
        const stages = [
          'Analyzing business model...',
          'Identifying valuation methods...',
          'Performing detailed calculations...',
          'Analyzing competitors...',
          'Generating strategic insights...',
          'Finalizing valuation report...'
        ];

        for (let i = 0; i < stages.length; i++) {
          setCurrentStage(i + 1);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const report = await fastapiService.generateValuationReport(wizardData);
        setValuationReport(report);
        setIsGenerating(false);
      } catch (error: any) {
        console.error('Valuation generation error:', error);
        setError(error.message);
        setIsGenerating(false);
      }
    };

    generateValuation();
  }, [wizardData]);

  const getValuationRange = () => {
    if (!valuationReport?.finalValuation?.finalRange) return null;

    const { lower, upper } = valuationReport.finalValuation.finalRange;
    return { lower: lower * 1000000, upper: upper * 1000000 }; // Convert from millions to actual values
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

    // Add valuation methods count if available
    if (valuationReport?.calculations?.length) {
      stats.push({
        icon: BarChart3,
        label: 'Methods',
        value: `${valuationReport.calculations.length} analyses`,
        color: 'text-indigo-600'
      });
    }

    return stats;
  };

  const getAnalysisStages = () => [
    'Analyzing business model...',
    'Identifying valuation methods...',
    'Performing detailed calculations...',
    'Analyzing competitors...',
    'Generating strategic insights...',
    'Finalizing valuation report...'
  ];

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
          {error ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-800">
                Analysis Error
              </h3>
              <p className="text-red-600 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={() => {
                  setError('');
                  setIsGenerating(true);
                  // Retry logic could be added here
                }}
                className="wizard-button-primary px-6 py-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : isGenerating ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {getAnalysisStages()[currentStage - 1]}
              </h3>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Stage {currentStage} of 6</span>
              </div>
              <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStage / 6) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ) : valuationReport ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Valuation Range
                </h3>
                {getValuationRange() ? (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(getValuationRange()!.lower)} - {formatCurrency(getValuationRange()!.upper)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on {valuationReport.calculations.length} valuation methods
                    </p>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-600">
                    Analysis Complete
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Professional analysis complete</span>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Detailed Results */}
        {!isGenerating && !error && valuationReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-6 mb-8"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {getSummaryStats().map((stat, index) => (
                <div key={index} className="wizard-card p-4 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Business Summary */}
            <div className="wizard-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 w-5 mr-2 text-blue-600" />
                AI Business Analysis
              </h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p>{valuationReport.businessSummary.summary}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Stage Assessment</h4>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {valuationReport.businessSummary.stageAssessment}
                  </span>
                </div>
                {valuationReport.businessSummary.keyStrengths && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Strengths</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {valuationReport.businessSummary.keyStrengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Valuation Methods */}
            <div className="wizard-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Valuation Methods Used
              </h3>
              <div className="grid gap-4">
                {valuationReport.calculations.map((calc, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{calc.method}</h4>
                      <span className="text-lg font-bold text-blue-600">
                        ${calc.valuationRange.lower}M - ${calc.valuationRange.upper}M
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{calc.explanation}</p>
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer hover:text-gray-700">View calculation details</summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                        {calc.calculation}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Context */}
            {valuationReport.strategicContext && (
              <div className="wizard-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  Strategic Investment Context
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {valuationReport.strategicContext}
                </p>
              </div>
            )}
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
              if (!valuationReport) return;

              const reportData = {
                businessName: wizardData.step1?.businessName,
                generatedAt: new Date().toISOString(),
                confidence: confidence,
                inputData: wizardData,
                valuationReport: valuationReport,
                summary: {
                  finalRange: valuationReport.finalValuation.finalRange,
                  methodsUsed: valuationReport.calculations.length,
                  stageAssessment: valuationReport.businessSummary.stageAssessment
                }
              };

              const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${wizardData.step1?.businessName || 'startup'}-valuation-report.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            disabled={isGenerating || error || !valuationReport}
            className="wizard-button-primary flex items-center justify-center space-x-2 py-3 px-6 text-lg font-semibold"
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </button>
          
          <button
            onClick={() => {
              const valRange = getValuationRange();
              const shareText = valRange
                ? `${wizardData.step1?.businessName} valuation: ${formatCurrency(valRange.lower)} - ${formatCurrency(valRange.upper)}`
                : `${wizardData.step1?.businessName} valuation analysis complete`;

              if (navigator.share) {
                navigator.share({
                  title: `${wizardData.step1?.businessName} Valuation`,
                  text: shareText,
                  url: window.location.href
                });
              } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareText);
              }
            }}
            disabled={isGenerating || error}
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
        {!isGenerating && !error && valuationReport && (
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
              <p>• Use this AI-powered valuation as a starting point for investor discussions</p>
              <p>• Review the detailed calculations and methodology for each valuation method</p>
              <p>• Consider the competitive analysis to understand your market position</p>
              <p>• Update your metrics regularly and re-run the analysis as you grow</p>
              <p>• Share these insights with advisors and potential investors</p>
            </div>

            {valuationReport.finalValuation.recommendations && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2">AI Recommendations</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {valuationReport.finalValuation.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
