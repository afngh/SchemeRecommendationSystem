import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getAuthToken, setAuthToken } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  // Selected AP Ward Secretariat context (persisted locally for citizen session)
  const [selectedWard, setSelectedWard] = useState(() => {
    const saved = localStorage.getItem('sl_selected_ward');
    return saved ? JSON.parse(saved) : {
      district: 'Visakhapatnam',
      mandal: 'Gajuwaka',
      secretariat: 'Gajuwaka Ward 1 (1089203)'
    };
  });

  useEffect(() => {
    localStorage.setItem('sl_selected_ward', JSON.stringify(selectedWard));
  }, [selectedWard]);

  // Check auth session on startup
  useEffect(() => {
    async function loadUser() {
      const activeToken = getAuthToken();
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/api/auth/me');
        if (data && data.user) {
          setUser(data.user);
          if (data.user.district && data.user.mandal && data.user.secretariat) {
            setSelectedWard({
              district: data.user.district,
              mandal: data.user.mandal,
              secretariat: data.user.secretariat
            });
          }
        } else {
          setUser(null);
          setAuthToken('');
          setToken('');
        }
      } catch (err) {
        console.error('Session validation error:', err);
        setUser(null);
        setAuthToken('');
        setToken('');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token && data.user) {
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.district) {
        setSelectedWard({
          district: data.user.district,
          mandal: data.user.mandal,
          secretariat: data.user.secretariat
        });
      }
    }
    return data;
  };

  const signup = async (userData) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.token && data.user) {
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.district) {
        setSelectedWard({
          district: data.user.district,
          mandal: data.user.mandal,
          secretariat: data.user.secretariat
        });
      }
    }
    return data;
  };

  const sendOtp = async (mobile) => {
    return await apiFetch('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  };

  const verifyOtp = async (mobile, otpCode) => {
    const data = await apiFetch('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp_code: otpCode }),
    });

    if (data.token && data.user) {
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.district) {
        setSelectedWard({
          district: data.user.district,
          mandal: data.user.mandal,
          secretariat: data.user.secretariat
        });
      }
    }
    return data;
  };

  const logout = () => {
    setAuthToken('');
    setToken('');
    setUser(null);
  };

  const updateWard = (wardData) => {
    setSelectedWard(wardData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        selectedWard,
        setSelectedWard: updateWard,
        login,
        signup,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
