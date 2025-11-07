import React from 'react';
import { Navigate } from 'react-router-dom';

function isTokenValid(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload || !payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    if (token && !isTokenValid(token)) {
      localStorage.removeItem('token');
      try { window.dispatchEvent(new Event('auth-changed')); } catch {}
    }
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
