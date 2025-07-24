import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, ArrowLeft, Upload, FileText, Link, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { FileUpload } from '../FileUpload';
import { AIRecommendation } from '../AIRecommendation';
import { ValuationCalculation } from '../ValuationCalculation';
import { UploadResponse, RecommendResponse, CalculateResponse } from '@/lib/api';

interface Step4Props {
  onBack: () => void;
  onComplete: (data: any) => void;
  userID: string;
  startupData: any;
}

export function Step4AIEnhanced({ onBack, onComplete, userID, startupData }: Step4Props) {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedDocument, setUploadedDocument] = useState<UploadResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);
  const [valuation, setValuation] = useState<CalculateResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleUploadSuccess = (result: UploadResponse) => {
    setUploadedDocument(result);
    setActiveTab('analyze');
    setError('');
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleMethodSelect = (method: string) => {
    setActiveTab('calculate');
  };

  const handleCalculationComplete = (result: CalculateResponse) => {
    setValuation(result);
    onComplete({
      uploadedDocument,
      recommendations,
      valuation: result,
      startupData
    });
  };

  const canAnalyze = uploadedDocument !== null;
  const canCalculate = recommendations !== null;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            AI-Enhanced Magic
          </CardTitle>
          <p className="text-slate-600 mt-2">Upload or link anything that can help us help you 🤖✨</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 rounded-lg p-1">
              <TabsTrigger 
                value="upload" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
                {uploadedDocument && <CheckCircle className="h-4 w-4 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger 
                value="analyze" 
                disabled={!canAnalyze}
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm disabled:opacity-50"
              >
                <Brain className="h-4 w-4" />
                <span>Analyze</span>
                {recommendations && <CheckCircle className="h-4 w-4 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger 
                value="calculate" 
                disabled={!canCalculate}
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>Calculate</span>
                {valuation && <CheckCircle className="h-4 w-4 text-green-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 mt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Business Plans</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Pitch Decks</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 rounded-full">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Financial Reports</span>
                  </div>
                </div>
              </div>

              <FileUpload
                userID={userID}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />

              {uploadedDocument && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Document uploaded successfully! 🎉</p>
                      <p className="text-sm text-green-600">Ready for AI analysis</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analyze" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">AI Analysis & Recommendations</h3>
                  <p className="text-slate-600">
                    Our AI will analyze your document and startup information to provide personalized valuation method recommendations.
                  </p>
                </div>

                <AIRecommendation
                  userID={userID}
                  bucket={uploadedDocument?.bucket}
                  key={uploadedDocument?.key}
                  onMethodSelect={handleMethodSelect}
                />
              </div>
            </TabsContent>

            <TabsContent value="calculate" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Calculate Your Valuation</h3>
                  <p className="text-slate-600">
                    Choose from AI-recommended methods or select your preferred valuation approach.
                  </p>
                </div>

                <ValuationCalculation
                  userID={userID}
                  recommendedMethods={recommendations?.recommendedMethods}
                  onCalculationComplete={handleCalculationComplete}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Progress Indicator */}
          <div className="bg-white/50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center space-x-2 ${uploadedDocument ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`w-2 h-2 rounded-full ${uploadedDocument ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <span>Document Upload</span>
              </div>
              <div className={`flex items-center space-x-2 ${recommendations ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`w-2 h-2 rounded-full ${recommendations ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <span>AI Analysis</span>
              </div>
              <div className={`flex items-center space-x-2 ${valuation ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`w-2 h-2 rounded-full ${valuation ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <span>Valuation</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 h-12 border-slate-300 text-slate-600 hover:bg-slate-50 transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Traction
            </Button>
            
            {!valuation ? (
              <Button
                disabled
                className="flex-1 h-12 bg-gradient-to-r from-indigo-300 to-purple-300 text-white font-medium rounded-lg opacity-50 cursor-not-allowed"
              >
                Complete Steps Above
              </Button>
            ) : (
              <Button
                onClick={() => onComplete({ uploadedDocument, recommendations, valuation, startupData })}
                className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                View Complete Results 🎉
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
