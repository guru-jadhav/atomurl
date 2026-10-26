export const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8080`;

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('atom_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // URLs
  createShortUrl: (longUrl) => apiFetch('/api/urls', {
    method: 'POST',
    body: JSON.stringify({ longUrl })
  }),
  deleteUrl: (shortCode) => apiFetch(`/api/urls/${shortCode}`, {
    method: 'DELETE'
  }),
  getUserUrls: (limit) => apiFetch(limit ? `/api/user/urls?limit=${limit}` : '/api/user/urls'),

  // Analytics
  getAnalytics: (shortCode, pastDays = 30) => 
    apiFetch(`/api/analytical/${shortCode}?pastdays=${pastDays}`),

  // Auth & Profile
  getUserProfile: () => apiFetch('/api/user/profile'),
  updateName: (name) => apiFetch('/api/user/profile/update-name', {
    method: 'PATCH',
    body: JSON.stringify({ name })
  }),
  sendOtp: (email) => apiFetch('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  validateOtp: (email, otp) => apiFetch('/api/auth/validate-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  }),
  sendEmailChangeOtp: (email) => apiFetch('/api/user/profile/email', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  validateEmailChangeOtp: (email, otp) => apiFetch('/api/user/profile/email/validate-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  })
};
