// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function MainApp() {
  const { token, loading, logout } = useAuth();
  const [isRegisterView, setIsRegisterView] = useState(false);

  if (loading) return null;

  const handleSwitchToRegister = () => {
    if (token) logout();
    setIsRegisterView(true);
  };

  const handleSwitchToLogin = () => {
    if (token) logout();
    setIsRegisterView(false);
  };

  if (!token) {
    return isRegisterView ? (
      <Register onSwitchToLogin={handleSwitchToLogin} />
    ) : (
      <Login onSwitchToRegister={handleSwitchToRegister} />
    );
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
