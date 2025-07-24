import axios from 'axios';

// FastAPI backend URL - update this to your actual backend URL
const FASTAPI_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 60000, // 60 seconds for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('FastAPI Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('FastAPI Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('FastAPI Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export interface WizardData {
  step1?: {
    businessName: string;
    country: string;
    industry: string;
    stage: string;
    isLaunched: boolean;
  };
  step2?: {
    revenue?: number;
    monthlyBurnRate?: number;
    netProfitLoss?: number;
    fundingRaised?: number;
    planningToRaise?: number;
    skipFinancials?: boolean;
  };
  step3?: {
    customerCount?: number;
    growthRate?: number;
    growthPeriod?: string;
    uniqueValue?: string;
    competitors?: string;
    skipTraction?: boolean;
  };
  step4?: {
    linkedinUrl?: string;
    crunchbaseUrl?: string;
    websiteUrl?: string;
    uploadedFiles?: any[];
    skipExtras?: boolean;
  };
}

export interface ValuationReport {
  businessSummary: {
    summary: string;
    stageAssessment: string;
    keyStrengths: string[];
    weaknessesOrRisks: string[];
  };
  recommendedMethods: {
    recommendedMethods: Array<{
      method: string;
      confidence: number;
      reason: string;
    }>;
  };
  calculations: Array<{
    method: string;
    valuationRange: {
      lower: number;
      upper: number;
    };
    explanation: string;
    calculation: string;
    narrative: string;
  }>;
  competitorAnalysis: {
    competitors: string[];
    competitorBenchmarks: any[];
    commentary: string;
  };
  strategicContext: string;
  finalValuation: {
    finalRange: {
      lower: number;
      upper: number;
    };
    methodComparisons: string;
    justification: string;
    recommendations: string[];
  };
}

// Transform wizard data to backend format
function transformWizardDataToBackend(wizardData: WizardData): any {
  const payload: any = {
    // Basic company information
    companyName: wizardData.step1?.businessName || 'Unknown Company',
    country: wizardData.step1?.country || 'Unknown',
    industry: wizardData.step1?.industry || 'other',
    stage: wizardData.step1?.stage || 'idea',
    isLaunched: wizardData.step1?.isLaunched || false,
  };

  // Financial data
  if (wizardData.step2 && !wizardData.step2.skipFinancials) {
    payload.revenue = wizardData.step2.revenue || 0;
    payload.monthlyBurnRate = wizardData.step2.monthlyBurnRate || 0;
    payload.netProfitLoss = wizardData.step2.netProfitLoss || 0;
    payload.fundingRaised = wizardData.step2.fundingRaised || 0;
    payload.planningToRaise = wizardData.step2.planningToRaise || 0;
  }

  // Traction data
  if (wizardData.step3 && !wizardData.step3.skipTraction) {
    payload.customerCount = wizardData.step3.customerCount || 0;
    payload.growthRate = wizardData.step3.growthRate || 0;
    payload.growthPeriod = wizardData.step3.growthPeriod || 'monthly';
    payload.uniqueValue = wizardData.step3.uniqueValue || '';
    payload.competitors = wizardData.step3.competitors || '';
  }

  // Additional data
  if (wizardData.step4 && !wizardData.step4.skipExtras) {
    payload.linkedinUrl = wizardData.step4.linkedinUrl || '';
    payload.crunchbaseUrl = wizardData.step4.crunchbaseUrl || '';
    payload.websiteUrl = wizardData.step4.websiteUrl || '';
    payload.uploadedFiles = wizardData.step4.uploadedFiles || [];
  }

  return payload;
}

export const fastapiService = {
  async generateValuationReport(wizardData: WizardData): Promise<ValuationReport> {
    try {
      const payload = transformWizardDataToBackend(wizardData);
      console.log('Sending payload to FastAPI:', payload);
      
      const response = await api.post<ValuationReport>('/valuation-report', payload);
      return response.data;
    } catch (error: any) {
      console.error('FastAPI valuation error:', error);
      
      // Enhanced error handling
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Backend server is not running. Please start your FastAPI server on port 8000.');
      } else if (error.response?.status === 500) {
        const detail = error.response?.data?.detail;
        if (typeof detail === 'object' && detail.error) {
          throw new Error(`AI Analysis Error: ${detail.error}`);
        }
        throw new Error('Internal server error occurred during analysis.');
      } else if (error.response?.status === 422) {
        throw new Error('Invalid data format sent to backend.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Analysis is taking longer than expected. Please try again.');
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to generate valuation report');
    }
  },

  async testConnection(): Promise<boolean> {
    try {
      // Test if FastAPI backend is running
      const response = await fetch(`${FASTAPI_BASE_URL}/docs`);
      return response.ok;
    } catch (error) {
      console.error('FastAPI connection test failed:', error);
      return false;
    }
  }
};
