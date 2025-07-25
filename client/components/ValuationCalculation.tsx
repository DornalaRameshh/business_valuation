import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calculator, DollarSign, TrendingUp, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { apiService, CalculateResponse } from '@/lib/api';

interface ValuationCalculationProps {
  userID: string;
  recommendedMethods?: string[];
  selectedMethod?: string;
  onCalculationComplete?: (result: CalculateResponse) => void;
}

const valuationMethods = [
  'DCF',
  'Comparable Company Analysis',
  'Precedent Transactions',
  'Revenue Multiple',
  'Asset-Based Valuation',
  'Risk Factor Summation',
  'Berkus Method',
  'First Chicago Method',
];

export function ValuationCalculation({ 
  userID, 
  recommendedMethods = [], 
  selectedMethod: initialMethod,
  onCalculationComplete 
}: ValuationCalculationProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(initialMethod || '');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<CalculateResponse | null>(null);

  const handleCalculate = async () => {
    if (!selectedMethod) {
      setError('Please select a valuation method.');
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      const calculationResult = await apiService.calculateValuation({
        userID,
        valuationID: `val_${Date.now()}`, // Generate a unique ID
        method: selectedMethod
      });
      
      setResult(calculationResult);
      onCalculationComplete?.(calculationResult);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate valuation. Please try again.';
      setError(errorMessage);
    } finally {
      setIsCalculating(false);
    }
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

  const getMethodColor = (method: string): string => {
    if (recommendedMethods.includes(method)) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Valuation Calculation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="method">Select Valuation Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a valuation method" />
                </SelectTrigger>
                <SelectContent>
                  {valuationMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      <div className="flex items-center justify-between w-full">
                        <span>{method}</span>
                        {recommendedMethods.includes(method) && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {recommendedMethods.length > 0 && (
              <div className="space-y-3">
                <Label>Recommended Methods</Label>
                <div className="grid gap-2">
                  {recommendedMethods.map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedMethod === method
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method}</span>
                        <Badge className={getMethodColor(method)}>
                          Recommended
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleCalculate}
              disabled={!selectedMethod || isCalculating}
              className="w-full"
              size="lg"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating Valuation...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Valuation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Valuation Complete</h3>
            </div>

            <Separator />

            {/* Main Valuation Result */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Company Valuation</span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(result.valuation)}
              </div>
              <Badge variant="outline" className="mt-2">
                {result.method}
              </Badge>
            </div>

            <Separator />

            {/* Valuation Details */}
            {result.details && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Calculation Details</span>
                </h4>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid gap-3 text-sm">
                    {typeof result.details === 'object' ? (
                      Object.entries(result.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span>
                            {typeof value === 'number' ? formatCurrency(value) : String(value)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p>{String(result.details)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setSelectedMethod('');
                  setError('');
                }}
                className="flex-1"
              >
                Calculate Again
              </Button>
              <Button
                onClick={() => {
                  const valuationData = {
                    valuation: result.valuation,
                    method: result.method,
                    details: result.details,
                    timestamp: new Date().toISOString()
                  };
                  
                  const blob = new Blob([JSON.stringify(valuationData, null, 2)], {
                    type: 'application/json'
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `valuation-${result.method.toLowerCase().replace(/\s+/g, '-')}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex-1"
              >
                Export Results
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
