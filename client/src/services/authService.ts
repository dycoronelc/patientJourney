import api from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/api/v1/auth/login', credentials);
    const data = response.data;
    
    // Guardar token en localStorage
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // Registrar usuario
  register: async (userData: RegisterRequest) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      // Ignorar errores de logout
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refrescar token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken
    });
    
    const data = response.data;
    localStorage.setItem('authToken', data.access_token);
    
    return data;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('authToken');
  },
};












