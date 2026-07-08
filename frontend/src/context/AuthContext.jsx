import { createContext, useContext, useState, useMemo, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gge_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('gge_user', JSON.stringify(user));
    else localStorage.removeItem('gge_user');
  }, [user]);

  const login = (email, password) => {
    // Authentification simulée — à remplacer par un vrai appel API
    if (email && password) {
      setUser({
        name: 'Amine Ben Salah',
        email,
        role: 'Administrateur',
        avatar: '',
      });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
