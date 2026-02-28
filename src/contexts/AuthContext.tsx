import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'user' | 'collector' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  cpf: string;
  role: Role;
  details?: any;
}

interface AuthContextType {
  user: User | null;
  loginWithGovBr: () => void;
  completeProfile: (role: Role, details: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginWithGovBr = () => {
    // Mock gov.br login response
    setUser({
      id: Math.random().toString(36).substring(2, 9),
      name: 'João Silva',
      cpf: '***.456.789-**',
      role: null, // Role is null initially, forcing the user to complete profile setup
    });
  };

  const completeProfile = (role: Role, details: any) => {
    if (user) {
      setUser({ ...user, role, details });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGovBr, completeProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
