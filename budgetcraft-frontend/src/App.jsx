// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function MainApp() {
  const { token, loading, logout } = useAuth();
  const [isRegisterView, setIsRegisterView] = useState(false);

  if (loading) return null;

  const handleSwitchToRegister = () => {
    if (token) {
      logout();
    }
    setIsRegisterView(true);
  };

  const handleSwitchToLogin = () => {
    if (token) {
      logout();
    }
    setIsRegisterView(false);
  };

  if (token) {
    return <Dashboard />;
  }

  return isRegisterView ? (
    <Register onSwitchToLogin={handleSwitchToLogin} />
  ) : (
    <Login onSwitchToRegister={handleSwitchToRegister} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}