import axios from 'axios';

const API_BASE_URL = 'https://p481izod3m.execute-api.us-west-1.amazonaws.com/dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add CORS handling
  withCredentials: false,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
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
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export interface StartupInput {
  revenue?: number;
  customers?: number;
  teamSize?: number;
  marketSize?: number;
  industry?: string;
  stage?: string;
  fundingRaised?: number;
  burnRate?: number;
  growthRate?: number;
  [key: string]: any;
}

export interface SaveInputRequest {
  userID: string;
  currentInput: StartupInput;
}

export interface UploadResponse {
  bucket: string;
  key: string;
  message: string;
}

export interface RecommendRequest {
  userID: string;
  bucket: string;
  key: string;
}

export interface RecommendResponse {
  recommendedMethods: string[];
  summary: string;
  overallStage: string;
}

export interface CalculateRequest {
  userID: string;
  valuationID: string;
  method: string;
}

export interface CalculateResponse {
  valuation: number;
  details: any;
  method: string;
}

export const apiService = {
  async testConnection(): Promise<boolean> {
    try {
      // Try a simple request to test connectivity
      const response = await fetch(`${API_BASE_URL}/save-input`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
        },
      });
      console.log('CORS preflight test:', response.status);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async saveInput(data: SaveInputRequest): Promise<void> {
    try {
      await api.post('/save-input', data);
    } catch (error: any) {
      // If Axios fails due to CORS, try native fetch
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.log('Axios failed, trying native fetch...');
        const response = await fetch(`${API_BASE_URL}/save-input`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        return;
      }
      throw error;
    }
  },

  async uploadDocument(userID: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('file', file);

    try {
      const response = await api.post<UploadResponse>('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      // If Axios fails due to CORS, try native fetch
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.log('Axios upload failed, trying native fetch...');
        const response = await fetch(`${API_BASE_URL}/upload-document`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.data || data;
      }
      throw error;
    }
  },

  async getRecommendations(data: RecommendRequest): Promise<RecommendResponse> {
    try {
      const response = await api.post<RecommendResponse>('/recommend', data);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.log('Axios recommend failed, trying native fetch...');
        const response = await fetch(`${API_BASE_URL}/recommend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return result.data || result;
      }
      throw error;
    }
  },

  async calculateValuation(data: CalculateRequest): Promise<CalculateResponse> {
    try {
      const response = await api.post<CalculateResponse>('/calculate', data);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.log('Axios calculate failed, trying native fetch...');
        const response = await fetch(`${API_BASE_URL}/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return result.data || result;
      }
      throw error;
    }
  },
};

export default api;
