// src/utils/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

/**
 * Fonction générique pour interagir avec l'API FastAPI.
 * Gère automatiquement l'ajout du token JWT et le parsing JSON.
 * 
 * @param {string} endpoint - Le chemin de l'endpoint (ex: '/auth/login')
 * @param {object} options - Options fetch (method, body, etc.)
 * @returns {Promise<any>} - La réponse JSON ou lève une erreur
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Déconnexion automatique si le token est expiré ou invalide
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      // On déclenche un événement personnalisé pour que le AuthContext puisse réagir
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.detail || response.statusText || 'Erreur réseau';
      // Cas particulier pour FastAPI où `detail` peut être un tableau (erreurs de validation Pydantic)
      const message = Array.isArray(errorMessage) 
        ? errorMessage.map(e => e.msg).join(', ') 
        : errorMessage;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
