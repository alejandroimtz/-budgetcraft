// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      // ⚠️ Validación segura antes de hacer JSON.parse
      if (savedUser && savedUser !== 'undefined') {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error al parsear el usuario guardado:', e);
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    // Obtenemos token y objeto de usuario directamente de la respuesta
    const newToken = response.data.token;
    const usuario = response.data.user || response.data.usuario;

    if (!newToken) {
      throw new Error('No se recibió un token válido del servidor.');
    }

    // Guardar en Storage de forma segura
    localStorage.setItem('token', newToken);
    if (usuario) {
      localStorage.setItem('user', JSON.stringify(usuario));
    }

    setToken(newToken);
    setUser(usuario);
    return response.data;
  };

  const register = async (nombre, email, password) => {
    const response = await api.post('/auth/register', { nombre, email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);