import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Axios } from '../Api/Api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if(!localStorage.getItem("auth")) return
    const userData = async () => {
      try{
        const response = await Axios.get("/auth/profile");
        setUser(response.data.user)
      }catch{
        localStorage.removeItem('auth');
      }
    }
    userData()
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

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
