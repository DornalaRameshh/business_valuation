import axios from 'axios';

// FastAPI backend URL configuration
const getBackendURL = () => {
  // Check if we're in development or production
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    // Local development - connect to local FastAPI server
    return 'http://127.0.0.1:8000';
  } else {
    // Production/Cloud deployment - default to demo mode to avoid CORS issues
    return 'demo';
  }
};

const FASTAPI_BASE_URL = getBackendURL();

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

// Demo data fallback
const generateDemoReport = (wizardData: WizardData): ValuationReport => {
  const businessName = wizardData.step1?.businessName || 'Demo Company';
  const industry = wizardData.step1?.industry || 'saas';

  return {
    businessSummary: {
      summary: `${businessName} is a ${industry} startup with promising market potential. The company demonstrates strong fundamentals and is positioned well within its industry sector.`,
      stageAssessment: 'Growth',
      keyStrengths: [
        'Strong market opportunity',
        'Experienced founding team',
        'Clear value proposition',
        'Scalable business model'
      ],
      weaknessesOrRisks: [
        'Competitive market landscape',
        'Customer acquisition costs',
        'Market timing considerations'
      ]
    },
    recommendedMethods: {
      recommendedMethods: [
        { method: 'Revenue Multiple', confidence: 0.85, reason: 'Strong revenue metrics available' },
        { method: 'DCF Analysis', confidence: 0.78, reason: 'Predictable cash flow patterns' },
        { method: 'Market Comparable', confidence: 0.72, reason: 'Good comparable companies exist' }
      ]
    },
    calculations: [
      {
        method: 'Revenue Multiple',
        valuationRange: { lower: 8, upper: 12 },
        explanation: 'Based on industry revenue multiples and growth projections',
        calculation: 'Annual Revenue × Industry Multiple (4-6x) × Growth Factor (2x)',
        narrative: 'This method values the company based on revenue multiples from comparable companies.'
      },
      {
        method: 'DCF Analysis',
        valuationRange: { lower: 10, upper: 15 },
        explanation: 'Discounted cash flow analysis over 5-year period',
        calculation: 'NPV of projected cash flows with 12% discount rate',
        narrative: 'DCF provides intrinsic value based on projected cash generation capability.'
      }
    ],
    competitorAnalysis: {
      competitors: ['CompetitorA', 'CompetitorB', 'CompetitorC'],
      competitorBenchmarks: [],
      commentary: 'The competitive landscape shows healthy market dynamics with room for multiple players.'
    },
    strategicContext: 'This valuation reflects strong growth potential in a expanding market. The company is well-positioned to capture market share and scale operations effectively.',
    finalValuation: {
      finalRange: { lower: 9, upper: 14 },
      methodComparisons: 'Revenue multiple and DCF methods show convergent ranges',
      justification: 'Valuation reflects current metrics with growth potential upside',
      recommendations: [
        'Focus on customer acquisition efficiency',
        'Strengthen unit economics',
        'Build strategic partnerships',
        'Prepare for next funding round'
      ]
    }
  };
};

let currentBackendUrl = FASTAPI_BASE_URL;

export const fastapiService = {
  setBackendUrl(url: string) {
    currentBackendUrl = url;
    api.defaults.baseURL = url === 'demo' ? '' : url;
  },

  async generateValuationReport(wizardData: WizardData): Promise<ValuationReport> {
    // Demo mode
    if (currentBackendUrl === 'demo') {
      console.log('Using demo mode - generating mock report');
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateDemoReport(wizardData);
    }

    try {
      const payload = transformWizardDataToBackend(wizardData);
      console.log('Sending payload to FastAPI:', payload);

      const response = await api.post<ValuationReport>('/valuation-report', payload);
      return response.data;
    } catch (error: any) {
      console.error('FastAPI valuation error:', error);

      // Enhanced error handling with CORS-specific messages
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Cannot connect to backend server. This might be due to CORS restrictions when connecting from a cloud deployment to localhost. Try using Demo Mode instead.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Backend server is not running. Please start your FastAPI server or use Demo Mode.');
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
    if (currentBackendUrl === 'demo') {
      return true;
    }

    try {
      // Test if FastAPI backend is running with a shorter timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${currentBackendUrl}/docs`, {
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error: any) {
      console.error('FastAPI connection test failed:', error);

      // Log specific error types for debugging
      if (error.name === 'AbortError') {
        console.error('Connection test timed out');
      } else if (error.message?.includes('Failed to fetch')) {
        console.error('CORS or network error - likely cross-origin issue');
      }

      return false;
    }
  }
};
