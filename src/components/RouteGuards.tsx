import { ReactElement, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface GuardProps {
  children: ReactElement;
}

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const RequireAuth = ({ children }: GuardProps) => {
  const { user, loading, isSuspended, isEmailVerified } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please log in to continue');
    }
    if (isSuspended) {
      toast.error('Your account has been suspended. Contact support.');
    }
    if (!loading && user && !isEmailVerified) {
      toast.error('Please verify your email to continue.');
    }
  }, [loading, user, isSuspended, isEmailVerified]);

  if (loading) return <LoadingState />;
  if (isSuspended) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (!isEmailVerified) return <Navigate to="/verify-email" state={{ from: location.pathname }} replace />;
  return children;
};

export const RequireAdmin = ({ children }: GuardProps) => {
  const { user, loading, isAdmin, isSuspended, isEmailVerified } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error('Admin access only');
    }
    if (isSuspended) {
      toast.error('Your account has been suspended.');
    }
    if (!loading && user && !isEmailVerified) {
      toast.error('Please verify your email first.');
    }
  }, [loading, user, isAdmin, isSuspended, isEmailVerified]);

  if (loading) return <LoadingState />;
  if (isSuspended) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (!isEmailVerified) return <Navigate to="/verify-email" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};
