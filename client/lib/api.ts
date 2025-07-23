import axios from 'axios';

const API_BASE_URL = 'https://p481izod3m.execute-api.us-west-1.amazonaws.com/dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  async saveInput(data: SaveInputRequest): Promise<void> {
    await api.post('/save-input', data);
  },

  async uploadDocument(userID: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getRecommendations(data: RecommendRequest): Promise<RecommendResponse> {
    const response = await api.post<RecommendResponse>('/recommend', data);
    return response.data;
  },

  async calculateValuation(data: CalculateRequest): Promise<CalculateResponse> {
    const response = await api.post<CalculateResponse>('/calculate', data);
    return response.data;
  },
};

export default api;
