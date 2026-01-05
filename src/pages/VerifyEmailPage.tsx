import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, sendEmailVerification } from '@/lib/firebase';
import { Mail, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const VerifyEmailPage = () => {
  const { language } = useLanguage();
  const { user, isEmailVerified, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sending, setSending] = useState(false);
  const [checked, setChecked] = useState(false);

  // Redirect to from page if email is verified
  useEffect(() => {
    if (!loading && isEmailVerified) {
      const fromPath = (location.state as { from?: string } | null)?.from || '/';
      navigate(fromPath);
    }
  }, [isEmailVerified, loading, navigate, location.state]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      toast.error(language === 'mr' ? 'कृपया पुन्हा लॉगिन करा' : 'Please log in again');
      return;
    }

    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success(
        language === 'mr'
          ? 'सत्यापन ईमेल पुन्हा पाठवली गेली!'
          : 'Verification email sent! Check your inbox.'
      );
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Resend email error:', error);
      toast.error(
        language === 'mr'
          ? 'ईमेल पुन्हा पाठवण्यात अयशस्वी'
          : 'Failed to resend email. Try again in a moment.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) {
      toast.error(language === 'mr' ? 'कृपया पुन्हा लॉगिन करा' : 'Please log in again');
      return;
    }

    setChecked(true);
    try {
      // Reload user to get latest email verification status
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        toast.success(
          language === 'mr'
            ? 'ईमेल यशस्वीरित्या सत्यापित!'
            : 'Email verified successfully!'
        );
        const fromPath = (location.state as { from?: string } | null)?.from || '/';
        navigate(fromPath);
      } else {
        toast.error(
          language === 'mr'
            ? 'ईमेल अजूनही सत्यापित नाही'
            : 'Email not verified yet. Please check your inbox.'
        );
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Verification check error:', error);
      toast.error(language === 'mr' ? 'त्रुटी आली' : 'Something went wrong');
    } finally {
      setChecked(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md w-full mx-auto shadow-elevated border-border/50">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="font-display text-2xl md:text-3xl">
                {language === 'mr' ? 'ईमेल सत्यापित करा' : 'Verify Your Email'}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 mb-2">
                  {language === 'mr'
                    ? '📬 आपल्या ईमेलला ()'
                    : '📬 We sent a verification link to'}{' '}
                  <span className="font-semibold">{user?.email}</span>
                </p>
                <p className="text-xs text-blue-700">
                  {language === 'mr'
                    ? 'कृपया लिंकवर क्लिक करा आणि तरुवा पहा'
                    : 'Click the link in the email and check back here'}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleCheckVerification}
                  disabled={checked}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {checked ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'mr' ? 'तपासत आहे...' : 'Checking...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {language === 'mr' ? 'सत्यापन तपासा' : 'Check Verification'}
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {language === 'mr' ? 'किंवा' : 'or'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleResendEmail}
                  disabled={sending}
                  variant="outline"
                  className="w-full"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'mr' ? 'पाठवत आहे...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      {language === 'mr' ? 'ईमेल पुन्हा पाठवा' : 'Resend Email'}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                {language === 'mr'
                  ? 'ईमेल मिळाली नाही? स्पॅम फोल्डर तपासा'
                  : "Didn't receive the email? Check your spam folder"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
