import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

export type RoleType = 'PROCUREMENT_OFFICER' | 'AUDITOR' | 'ADMIN';

export interface UserPersona {
  email: string;
  role: RoleType;
  fullName: string;
  designation: string;
  department: string;
  badgeColor: string;
  avatarInitials: string;
}

export const DEMO_PERSONAS: Record<RoleType, UserPersona> = {
  PROCUREMENT_OFFICER: {
    email: 'officer@bidsure.gov.in',
    role: 'PROCUREMENT_OFFICER',
    fullName: 'Rajesh Kumar',
    designation: 'GeM Procurement Scrutiny Officer',
    department: 'Directorate General of Supplies & Disposals',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    avatarInitials: 'RK',
  },
  AUDITOR: {
    email: 'auditor@bidsure.gov.in',
    role: 'AUDITOR',
    fullName: 'Sanjay Singhal',
    designation: 'CAG Procurement & Vigilance Auditor',
    department: 'Comptroller and Auditor General of India',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    avatarInitials: 'SS',
  },
  ADMIN: {
    email: 'admin@bidsure.gov.in',
    role: 'ADMIN',
    fullName: 'Dr. A. Sharma',
    designation: 'GeM System & Platform Administrator',
    department: 'Ministry of Commerce & Industry / NIC',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    avatarInitials: 'AS',
  },
};

interface AuthContextType {
  user: User | null;
  activePersona: UserPersona;
  role: RoleType;
  loading: boolean;
  login: (email: string, pass: string, roleOverride?: RoleType) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bidsure_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [role, setRole] = useState<RoleType>(() => {
    if (user?.role && DEMO_PERSONAS[user.role as RoleType]) {
      return user.role as RoleType;
    }
    const savedRole = localStorage.getItem('bidsure_role') as RoleType;
    if (savedRole && DEMO_PERSONAS[savedRole]) return savedRole;
    return 'PROCUREMENT_OFFICER';
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role && DEMO_PERSONAS[user.role as RoleType]) {
      setRole(user.role as RoleType);
      localStorage.setItem('bidsure_role', user.role);
    }
  }, [user]);

  const login = async (email: string, pass: string, roleOverride?: RoleType) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, pass);
      const effectiveRole = roleOverride || (data.user.role as RoleType);
      const updatedUser = { ...data.user, role: effectiveRole };
      localStorage.setItem('bidsure_token', data.access_token);
      localStorage.setItem('bidsure_user', JSON.stringify(updatedUser));
      localStorage.setItem('bidsure_role', effectiveRole);
      setUser(updatedUser);
      setRole(effectiveRole);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bidsure_token');
    localStorage.removeItem('bidsure_user');
    localStorage.removeItem('bidsure_role');
    setUser(null);
  };

  const activePersona = DEMO_PERSONAS[role] || DEMO_PERSONAS.PROCUREMENT_OFFICER;

  return (
    <AuthContext.Provider
      value={{
        user,
        activePersona,
        role,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
