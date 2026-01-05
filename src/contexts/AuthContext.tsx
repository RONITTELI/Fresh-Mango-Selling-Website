import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { auth, onAuthStateChanged, User, database, ref, onValue } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminEmailAllowlist = (
  (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
);

const isAdminEmail = (email: string | null | undefined) => {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return adminEmailAllowlist.includes(normalized);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    let roleUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsEmailVerified(nextUser?.emailVerified || false);

      if (roleUnsubscribe) {
        roleUnsubscribe();
        roleUnsubscribe = null;
      }

      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Listen for dynamic role changes from database
      const roleRef = ref(database, `userRoles/${nextUser.uid}`);
      roleUnsubscribe = onValue(roleRef, (snapshot) => {
        const roleData = snapshot.val();
        const suspended = roleData?.suspended === true;
        const adminFromDb = roleData?.admin === true && !suspended;
        const isAdminUser = (adminFromDb || isAdminEmail(nextUser.email)) && !suspended;
        setIsSuspended(suspended);
        setIsAdmin(isAdminUser);
        setLoading(false);
      }, () => {
        // On error fallback to allowlist
        setIsSuspended(false);
        setIsAdmin(isAdminEmail(nextUser.email));
        setLoading(false);
      });
    });

    return () => {
      if (roleUnsubscribe) roleUnsubscribe();
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, loading, isAdmin, isSuspended, isEmailVerified }), [user, loading, isAdmin, isSuspended, isEmailVerified]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
