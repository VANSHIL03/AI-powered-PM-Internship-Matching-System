import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses to handle 401s gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, token might be expired
      // Do not hard reload if testing demo accounts
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  getDemoCredentials: () => apiClient.get('/auth/demo-credentials'),
};

export const studentsAPI = {
  getProfile: () => apiClient.get('/students/profile'),
  updateProfile: (data) => apiClient.put('/students/profile', data),
  uploadResume: (formData) => apiClient.post('/students/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  analyzePortfolio: (formData) => apiClient.post('/students/analyze-portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMatches: () => apiClient.get('/students/matches'),
  applyInternship: (id) => apiClient.post(`/students/apply/${id}`),
  getApplications: () => apiClient.get('/students/applications'),
};

export const companiesAPI = {
  getProfile: () => apiClient.get('/companies/profile'),
  updateProfile: (data) => apiClient.put('/companies/profile', data),
  getInternships: () => apiClient.get('/companies/internships'),
  createInternship: (data) => apiClient.post('/companies/internships', data),
  updateInternship: (id, data) => apiClient.put(`/companies/internships/${id}`, data),
  getCandidates: (internshipId) => apiClient.get(`/companies/candidates/${internshipId}`),
  getAllocatedInterns: () => apiClient.get('/companies/allocated-interns'),
};

export const internshipsAPI = {
  getAll: (params) => apiClient.get('/internships', { params }),
  getById: (id) => apiClient.get(`/internships/${id}`),
  getSectors: () => apiClient.get('/internships/sectors'),
  getLocations: () => apiClient.get('/internships/locations'),
  analyzePortfolio: (formData) => apiClient.post('/internships/analyze-portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const allocationsAPI = {
  getWeights: () => apiClient.get('/allocations/weights'),
  updateWeights: (weights) => apiClient.put('/allocations/weights', weights),
  getRules: () => apiClient.get('/allocations/rules'),
  updateRules: (rules) => apiClient.put('/allocations/rules', rules),
  runAllocation: (data) => apiClient.post('/allocations/run', data),
  publishAllocation: (runId) => apiClient.post(`/allocations/publish/${runId}`),
  resetAllocations: () => apiClient.post('/allocations/reset'),
  getRuns: () => apiClient.get('/allocations/runs'),
  getRunDetail: (runId) => apiClient.get(`/allocations/runs/${runId}`),
  getUnallocated: (runId) => apiClient.get(`/allocations/unallocated/${runId}`),
  getExportCsvUrl: (runId) => `${API_BASE}/allocations/export-csv/${runId}`,
};

export const analyticsAPI = {
  getOverview: () => apiClient.get('/analytics/overview'),
};

export default apiClient;
