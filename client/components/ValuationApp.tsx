import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Upload, FileText, Brain, Calculator } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { StartupInfoForm } from './StartupInfoForm';
import { AIRecommendation } from './AIRecommendation';
import { ValuationCalculation } from './ValuationCalculation';
import { ApiTest } from './ApiTest';
import { StartupInput, UploadResponse, RecommendResponse, CalculateResponse } from '@/lib/api';

interface AppState {
  userID: string;
  uploadedDocument?: UploadResponse;
  startupInfo?: StartupInput;
  recommendations?: RecommendResponse;
  valuation?: CalculateResponse;
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Upload Document', icon: Upload, description: 'Upload your business document' },
  { id: 2, name: 'Business Info', icon: FileText, description: 'Provide startup information' },
  { id: 3, name: 'AI Analysis', icon: Brain, description: 'Get AI recommendations' },
  { id: 4, name: 'Calculate', icon: Calculator, description: 'Calculate valuation' },
];

export function ValuationApp() {
  const [state, setState] = useState<AppState>({
    userID: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    currentStep: 1,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleUploadSuccess = (result: UploadResponse) => {
    updateState({ 
      uploadedDocument: result,
      currentStep: Math.max(state.currentStep, 2)
    });
  };

  const handleStartupInfoSuccess = (data: StartupInput) => {
    updateState({ 
      startupInfo: data,
      currentStep: Math.max(state.currentStep, 3)
    });
  };

  const handleRecommendationMethodSelect = (method: string) => {
    updateState({ currentStep: Math.max(state.currentStep, 4) });
  };

  const handleCalculationComplete = (result: CalculateResponse) => {
    updateState({ valuation: result });
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < state.currentStep) return 'completed';
    if (stepId === state.currentStep) return 'current';
    return 'upcoming';
  };

  const isStepAccessible = (stepId: number) => {
    return stepId <= state.currentStep;
  };

  const getProgressPercentage = () => {
    return ((state.currentStep - 1) / (steps.length - 1)) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-800">
            AI-Powered Startup Valuation Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get professional startup valuations using AI analysis and multiple valuation methodologies
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progress</CardTitle>
              <Badge variant="outline">
                Step {state.currentStep} of {steps.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={getProgressPercentage()} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center text-center p-3 rounded-lg transition-colors ${
                      status === 'completed'
                        ? 'bg-green-50 text-green-700'
                        : status === 'current'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className={`p-2 rounded-full mb-2 ${
                      status === 'completed'
                        ? 'bg-green-100'
                        : status === 'current'
                        ? 'bg-primary/20'
                        : 'bg-muted'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{step.name}</span>
                    <span className="text-xs opacity-75">{step.description}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Debug Card */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-orange-800 mb-2">Debug Mode</h3>
            <p className="text-sm text-orange-700 mb-3">
              Use this to test API connectivity and diagnose form submission issues.
            </p>
            <ApiTest />
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={state.currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {steps.map((step) => (
              <TabsTrigger
                key={step.id}
                value={step.id.toString()}
                disabled={!isStepAccessible(step.id)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {step.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="1" className="space-y-4">
            <FileUpload
              userID={state.userID}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(error) => console.error('Upload error:', error)}
            />
            {state.uploadedDocument && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Document uploaded successfully!
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    File stored at: {state.uploadedDocument.bucket}/{state.uploadedDocument.key}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="2" className="space-y-4">
            <StartupInfoForm
              userID={state.userID}
              onSubmitSuccess={handleStartupInfoSuccess}
              onSubmitError={(error) => console.error('Form error:', error)}
            />
            {state.startupInfo && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Business information saved successfully!
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="3" className="space-y-4">
            <AIRecommendation
              userID={state.userID}
              bucket={state.uploadedDocument?.bucket}
              key={state.uploadedDocument?.key}
              onMethodSelect={handleRecommendationMethodSelect}
              disabled={!state.uploadedDocument || !state.startupInfo}
            />
          </TabsContent>

          <TabsContent value="4" className="space-y-4">
            <ValuationCalculation
              userID={state.userID}
              recommendedMethods={state.recommendations?.recommendedMethods}
              onCalculationComplete={handleCalculationComplete}
            />
          </TabsContent>
        </Tabs>

        {/* Results Summary */}
        {state.valuation && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-center">Valuation Complete</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                ${state.valuation.valuation.toLocaleString()}
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {state.valuation.method}
              </Badge>
              <p className="text-muted-foreground">
                Your startup valuation has been calculated using professional methodologies
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
