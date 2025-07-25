import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, X, Loader2 } from 'lucide-react';

export function ApiTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const API_BASE_URL = 'https://p481izod3m.execute-api.us-west-1.amazonaws.com/dev';

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const tests = [
      {
        name: 'CORS Preflight Check',
        test: async () => {
          const response = await fetch(`${API_BASE_URL}/save-input`, {
            method: 'OPTIONS',
            headers: {
              'Origin': window.location.origin,
              'Access-Control-Request-Method': 'POST',
              'Access-Control-Request-Headers': 'Content-Type',
            },
          });
          return { status: response.status, headers: Object.fromEntries(response.headers) };
        }
      },
      {
        name: 'Direct fetch to save-input',
        test: async () => {
          const response = await fetch(`${API_BASE_URL}/save-input`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: 'test_user',
              currentInput: { industry: 'Technology', stage: 'Growth' }
            }),
          });
          const data = await response.text();
          return { status: response.status, data, headers: Object.fromEntries(response.headers) };
        }
      },
      {
        name: 'Axios request (our current method)',
        test: async () => {
          const axios = (await import('axios')).default;
          const response = await axios.post(`${API_BASE_URL}/save-input`, {
            userID: 'test_user',
            currentInput: { industry: 'Technology', stage: 'Growth' }
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          return { status: response.status, data: response.data };
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        setResults(prev => [...prev, { name: test.name, success: true, result }]);
      } catch (error: any) {
        setResults(prev => [...prev, { 
          name: test.name, 
          success: false, 
          error: {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
          }
        }]);
      }
    }
    
    setTesting(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Connectivity Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Run API Tests'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{result.name}</span>
                </div>
                <AlertDescription className="mt-2">
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(result.success ? result.result : result.error, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
