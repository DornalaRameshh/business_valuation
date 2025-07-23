import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Brain, Lightbulb, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { apiService, RecommendResponse } from '@/lib/api';

interface AIRecommendationProps {
  userID: string;
  bucket?: string;
  key?: string;
  onMethodSelect: (method: string) => void;
  disabled?: boolean;
}

export function AIRecommendation({ 
  userID, 
  bucket, 
  key, 
  onMethodSelect, 
  disabled = false 
}: AIRecommendationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);

  const handleGetRecommendations = async () => {
    if (!bucket || !key) {
      setError('Please upload a document first to get AI recommendations.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await apiService.getRecommendations({
        userID,
        bucket,
        key
      });
      setRecommendations(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get recommendations. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const lowerStage = stage.toLowerCase();
    if (lowerStage.includes('seed') || lowerStage.includes('pre-seed')) return 'bg-blue-100 text-blue-800';
    if (lowerStage.includes('series a')) return 'bg-green-100 text-green-800';
    if (lowerStage.includes('series b') || lowerStage.includes('growth')) return 'bg-purple-100 text-purple-800';
    if (lowerStage.includes('late') || lowerStage.includes('mature')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>AI Valuation Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!recommendations ? (
          <div className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Get AI-Powered Recommendations</h3>
            <p className="text-muted-foreground mb-6">
              Our AI will analyze your uploaded document and startup information to recommend the best valuation methods for your business.
            </p>
            <Button 
              onClick={handleGetRecommendations}
              disabled={isLoading || disabled || !bucket || !key}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
            {(!bucket || !key) && (
              <p className="text-sm text-muted-foreground mt-2">
                Upload a document first to enable AI recommendations
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Business Stage */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Business Stage Assessment</span>
              </div>
              <Badge className={getStageColor(recommendations.overallStage)}>
                {recommendations.overallStage}
              </Badge>
            </div>

            <Separator />

            {/* AI Summary */}
            <div className="space-y-2">
              <h4 className="font-medium">AI Analysis Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {recommendations.summary}
              </p>
            </div>

            <Separator />

            {/* Recommended Methods */}
            <div className="space-y-4">
              <h4 className="font-medium">Recommended Valuation Methods</h4>
              <div className="grid gap-3">
                {recommendations.recommendedMethods.map((method, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h5 className="font-medium">{method}</h5>
                          <p className="text-sm text-muted-foreground">
                            {getMethodDescription(method)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMethodSelect(method)}
                          disabled={disabled}
                        >
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => setRecommendations(null)}
                className="w-full"
              >
                Get New Recommendations
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getMethodDescription(method: string): string {
  const descriptions: Record<string, string> = {
    'DCF': 'Discounted Cash Flow - Values business based on projected future cash flows',
    'Comparable Company Analysis': 'Market-based valuation using similar public companies',
    'Precedent Transactions': 'Valuation based on similar M&A transactions',
    'Revenue Multiple': 'Simple valuation using revenue multiples from comparable companies',
    'Asset-Based Valuation': 'Values company based on net asset value',
    'Risk Factor Summation': 'Adjusts pre-money valuation based on risk factors',
    'Berkus Method': 'Pre-revenue valuation method for early-stage startups',
    'First Chicago Method': 'Scenario-based valuation with weighted outcomes',
  };

  return descriptions[method] || 'Professional valuation method recommended by AI analysis';
}
