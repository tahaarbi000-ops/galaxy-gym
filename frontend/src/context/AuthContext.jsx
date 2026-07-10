import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Axios } from '../Api/Api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const userData = async () => {
    try {
      if (!localStorage.getItem("auth")) {
        setLoading(false);
        return;
      }

      const response = await Axios.get("/auth/profile");
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("auth");
    } finally {
      setLoading(false);
    }
  };

  userData();
}, []);

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

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem("auth")
  }

  const value = useMemo(() => ({ user, login, logout,loading }), [user,loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
