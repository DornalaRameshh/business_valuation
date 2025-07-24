import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Trophy } from 'lucide-react';
import { Step1LetsGetStarted } from './wizard/Step1LetsGetStarted';
import { Step2FinancialSnapshot } from './wizard/Step2FinancialSnapshot';
import { Step3ProductTraction } from './wizard/Step3ProductTraction';
import { Step4AIEnhanced } from './wizard/Step4AIEnhanced';

interface WizardData {
  step1?: {
    businessName: string;
    country: string;
    industry: string;
    stage: string;
    hasLaunched: boolean;
  };
  step2?: {
    revenue?: number;
    monthlyBurnRate?: number;
    netProfitLoss?: number;
    fundingRaised?: number;
    planningToRaise?: number;
  };
  step3?: {
    activeUsers?: number;
    growthRate?: number;
    differentiator?: string;
    competitors?: string;
  };
  step4?: any;
}

export function WizardValuationApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [userID] = useState(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { id: 1, name: "Let's Get Started", description: "Basic company info", color: "from-blue-400 to-green-400" },
    { id: 2, name: "Financial Snapshot", description: "Revenue & funding details", color: "from-green-400 to-blue-400" },
    { id: 3, name: "Product & Traction", description: "Users & growth metrics", color: "from-purple-400 to-green-400" },
    { id: 4, name: "AI Magic", description: "Upload docs & get valuation", color: "from-indigo-400 to-purple-400" },
  ];

  const handleStep1Next = (data: any) => {
    setWizardData(prev => ({ ...prev, step1: data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (data: any) => {
    setWizardData(prev => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  const handleStep3Next = (data: any) => {
    setWizardData(prev => ({ ...prev, step3: data }));
    setCurrentStep(4);
  };

  const handleStep4Complete = (data: any) => {
    setWizardData(prev => ({ ...prev, step4: data }));
    setIsComplete(true);
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const getProgressPercentage = () => {
    if (isComplete) return 100;
    return ((currentStep - 1) / (steps.length - 1)) * 100;
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

  if (isComplete && wizardData.step4?.valuation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Congratulations! 🎉
            </h1>
            <p className="text-xl text-slate-600">
              Your startup valuation is complete
            </p>
          </div>

          {/* Valuation Result */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-slate-800">
                {wizardData.step1?.businessName}
              </CardTitle>
              <div className="flex justify-center space-x-4 mt-4">
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  {wizardData.step1?.industry}
                </Badge>
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  {wizardData.step1?.stage}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-lg text-slate-600">Company Valuation</p>
                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {formatCurrency(wizardData.step4.valuation.valuation)}
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2 mt-4">
                  {wizardData.step4.valuation.method}
                </Badge>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {wizardData.step2?.revenue && (
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-slate-600">Annual Revenue</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {formatCurrency(wizardData.step2.revenue)}
                    </p>
                  </div>
                )}
                {wizardData.step3?.activeUsers && (
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-slate-600">Active Users</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {wizardData.step3.activeUsers.toLocaleString()}
                    </p>
                  </div>
                )}
                {wizardData.step2?.fundingRaised && (
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-slate-600">Funding Raised</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {formatCurrency(wizardData.step2.fundingRaised)}
                    </p>
                  </div>
                )}
                {wizardData.step3?.growthRate && (
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-slate-600">Growth Rate</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {wizardData.step3.growthRate}%
                    </p>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              {wizardData.step4?.recommendations?.summary && (
                <div className="mt-8 p-6 bg-white/70 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                    AI Analysis Summary
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {wizardData.step4.recommendations.summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            AI-Powered Startup Valuation
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get professional startup valuations in minutes with our AI-powered platform ✨
          </p>
        </div>

        {/* Progress Section */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-slate-800">Progress</CardTitle>
              <Badge variant="outline" className="text-sm">
                Step {currentStep} of {steps.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={getProgressPercentage()} className="w-full h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step) => {
                const isCompleted = step.id < currentStep || (step.id === currentStep && step.id === 4 && isComplete);
                const isCurrent = step.id === currentStep && !isComplete;
                const isAccessible = step.id <= currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    disabled={!isAccessible}
                    className={`p-4 rounded-lg transition-all duration-300 text-left ${
                      isCompleted
                        ? 'bg-green-100 border-green-300 text-green-800 cursor-pointer hover:bg-green-200'
                        : isCurrent
                        ? 'bg-blue-100 border-blue-300 text-blue-800 animate-pulse cursor-pointer'
                        : isAccessible
                        ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-pointer hover:bg-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    } border-2`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${step.color}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <span className="text-white font-semibold text-sm">{step.id}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs opacity-75">{step.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <Step1LetsGetStarted 
              onNext={handleStep1Next}
              initialData={wizardData.step1}
            />
          )}
          {currentStep === 2 && (
            <Step2FinancialSnapshot
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
              initialData={wizardData.step2}
            />
          )}
          {currentStep === 3 && (
            <Step3ProductTraction
              onNext={handleStep3Next}
              onBack={() => setCurrentStep(2)}
              initialData={wizardData.step3}
            />
          )}
          {currentStep === 4 && (
            <Step4AIEnhanced
              onBack={() => setCurrentStep(3)}
              onComplete={handleStep4Complete}
              userID={userID}
              startupData={wizardData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
