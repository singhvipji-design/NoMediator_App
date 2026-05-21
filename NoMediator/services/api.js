import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';

const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Properties
  getProperties: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/api/properties?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties.');
    }
    return response.json();
  },

  getPropertyById: async (id) => {
    const response = await fetch(`${API_URL}/api/properties/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch property details.');
    }
    return response.json();
  },

  getMyListings: async (token) => {
    const response = await fetch(`${API_URL}/api/properties/my-listings`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch my listings.');
    }
    return response.json();
  },

  createProperty: async (propertyData, token) => {
    const response = await fetch(`${API_URL}/api/properties`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(propertyData),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to list property.');
    }
    return response.json();
  },

  // Favorites
  getFavorites: async (token) => {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch favorite properties.');
    }
    return response.json();
  },

  toggleFavorite: async (propertyId, token) => {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ propertyId }),
    });
    if (!response.ok) {
      throw new Error('Failed to toggle favorite status.');
    }
    return response.json();
  },

  // Visits
  getVisits: async (token) => {
    const response = await fetch(`${API_URL}/api/visits`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch visits.');
    }
    return response.json();
  },

  scheduleVisit: async (propertyId, visitDate, visitTime, token) => {
    const response = await fetch(`${API_URL}/api/visits`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ propertyId, visitDate, visitTime }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to schedule visit.');
    }
    return response.json();
  },

  // Inquiries
  createInquiry: async (propertyId, token) => {
    const response = await fetch(`${API_URL}/api/inquiries`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ propertyId }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit contact owner request.');
    }
    return response.json();
  },
};
