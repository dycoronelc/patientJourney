import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Por ahora, simular autenticación para desarrollo
        const token = localStorage.getItem('authToken');
        const currentUser = localStorage.getItem('user');
        
        if (token && currentUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(currentUser));
        } else {
          // Para desarrollo, autenticar automáticamente
          setIsAuthenticated(true);
          setUser({
            id: '1',
            username: 'admin',
            email: 'admin@hospital.com',
            full_name: 'Administrador',
            role: 'admin'
          });
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await authService.login(credentials);
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      // Ignorar errores de logout
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
};
