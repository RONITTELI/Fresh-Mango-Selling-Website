import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  auth, 
  database,
  ref,
  push,
  update,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
} from '@/lib/firebase';
import { Loader2, User, Mail, Phone, MapPin, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from || '/';
  
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [emailLinkEmail, setEmailLinkEmail] = useState('');
  
  // Check if user is signing in with email link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = localStorage.getItem('emailForSignIn');
      if (!email) {
        email = prompt(language === 'mr' ? 'कृपया आपना ईमेल पुष्टी करा' : 'Please confirm your email for sign in');
      }
      if (email) {
        setLoading(true);
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            localStorage.removeItem('emailForSignIn');
            sendEmailVerification(auth.currentUser!).catch(err => {
              if (import.meta.env.DEV) console.error('Error sending verification:', err);
            });
            toast.success(language === 'mr' ? 'यशस्वीरित्या लॉगिन!' : 'Login successful!');
            navigate(fromPath);
          })
          .catch((error: any) => {
            if (import.meta.env.DEV) console.error('Email link sign in error:', error);
            toast.error(language === 'mr' ? 'साइन इन अयशस्वी' : 'Sign in failed');
          })
          .finally(() => setLoading(false));
      }
    }
  }, [language, navigate, fromPath]);
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form with all delivery details
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      toast.success(language === 'mr' ? 'यशस्वीरित्या लॉगिन!' : 'Login successful!');
      navigate(fromPath);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Login error:', error);
      const message = error.code === 'auth/invalid-credential' 
        ? (language === 'mr' ? 'चुकीचा ईमेल किंवा पासवर्ड' : 'Invalid email or password')
        : (language === 'mr' ? 'लॉगिन अयशस्वी' : 'Login failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLinkEmail) {
      toast.error(language === 'mr' ? 'ईमेल प्रविष्ट करा' : 'Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, emailLinkEmail, actionCodeSettings);
      localStorage.setItem('emailForSignIn', emailLinkEmail);
      setEmailLinkSent(true);
      toast.success(language === 'mr' ? 'साइन इन लिंक पाठवा!' : 'Sign in link sent! Check your email.');
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Email link error:', error);
      const message = error.code === 'auth/invalid-email'
        ? (language === 'mr' ? 'चुकीचा ईमेल' : 'Invalid email')
        : (language === 'mr' ? 'लिंक पाठवण्यात अयशस्वी' : 'Failed to send link');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Send verification email (user may not have verified yet)
      if (result.user) {
        try {
          await sendEmailVerification(result.user);
        } catch (err) {
          if (import.meta.env.DEV) console.error('Verification error:', err);
        }
        toast.success(language === 'mr' ? 'यशस्वीरित्या लॉगिन!' : 'Login successful!');
        navigate(fromPath);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Google sign in error:', error);
      const message = error.code === 'auth/popup-closed-by-user'
        ? (language === 'mr' ? 'पॉपअप बंद केले' : 'Sign in cancelled')
        : (language === 'mr' ? 'Google साइन इन अयशस्वी' : 'Google sign in failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!registerData.name || !registerData.email || !registerData.phone || 
        !registerData.address || !registerData.pincode || !registerData.password) {
      toast.error(language === 'mr' ? 'सर्व फील्ड भरा' : 'Please fill all fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error(language === 'mr' ? 'पासवर्ड जुळत नाही' : 'Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error(language === 'mr' ? 'पासवर्ड किमान 6 अक्षरांचा असावा' : 'Password must be at least 6 characters');
      return;
    }

    if (!registerData.pincode.startsWith('400')) {
      toast.error(language === 'mr' ? 'फक्त मुंबई पिनकोड स्वीकारले जाते (400XXX)' : 'Only Mumbai pincodes accepted (400XXX)');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(registerData.phone)) {
      toast.error(language === 'mr' ? 'वैध फोन नंबर प्रविष्ट करा' : 'Enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        registerData.email, 
        registerData.password
      );

      // Save user profile to database
      await push(ref(database, 'users'), {
        uid: userCredential.user.uid,
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        address: registerData.address,
        pincode: registerData.pincode,
        createdAt: new Date().toISOString(),
      });

      // Initialize role entry for the user
      await update(ref(database, `userRoles/${userCredential.user.uid}`), {
        admin: false,
        suspended: false,
      });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      toast.success(language === 'mr' ? 'खाते तयार झाले! ईमेल सत्यापित करा.' : 'Account created! Please verify your email.');
      navigate('/verify-email');
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Register error:', error);
      const message = error.code === 'auth/email-already-in-use'
        ? (language === 'mr' ? 'हा ईमेल आधीच वापरात आहे' : 'Email already in use')
        : (language === 'mr' ? 'नोंदणी अयशस्वी' : 'Registration failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto shadow-elevated border-border/50">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🥭</span>
              </div>
              <CardTitle className="font-display text-2xl md:text-3xl">
                {language === 'mr' ? 'DevgadHapus मध्ये स्वागत' : 'Welcome to DevgadHapus'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {language === 'mr' ? 'लॉगिन' : 'Login'}
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {language === 'mr' ? 'नोंदणी करा' : 'Register'}
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  {!emailLinkSent ? (
                    <div className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label htmlFor="login-email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {language === 'mr' ? 'ईमेल' : 'Email'}
                          </Label>
                          <Input
                            id="login-email"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-2"
                            placeholder="your@email.com"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="login-password" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            {language === 'mr' ? 'पासवर्ड' : 'Password'}
                          </Label>
                          <Input
                            id="login-password"
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                            className="mt-2"
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-hero text-primary-foreground font-semibold py-6"
                        >
                          {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === 'mr' ? 'लॉगिन होत आहे...' : 'Logging in...'}</>
                          ) : (
                            language === 'mr' ? 'लॉगिन करा' : 'Login'
                          )}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">{language === 'mr' ? 'किंवा' : 'Or'}</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={handleGoogleSignIn}
                        className="w-full py-6 font-semibold flex items-center justify-center gap-2"
                      >
                        <Chrome className="h-4 w-4" />
                        {language === 'mr' ? 'Google सह साइन इन करा' : 'Sign in with Google'}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={loading}
                        onClick={() => setEmailLinkSent(true)}
                        className="w-full py-6 font-semibold"
                      >
                        {language === 'mr' ? 'ईमेल लिंकसह साइन इन करा' : 'Sign in with Email Link'}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailLinkSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="email-link-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {language === 'mr' ? 'ईमेल' : 'Email'}
                        </Label>
                        <Input
                          id="email-link-email"
                          type="email"
                          value={emailLinkEmail}
                          onChange={(e) => setEmailLinkEmail(e.target.value)}
                          className="mt-2"
                          placeholder="your@email.com"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-hero text-primary-foreground font-semibold py-6"
                      >
                        {loading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === 'mr' ? 'पाठवत आहे...' : 'Sending...'}</>
                        ) : (
                          language === 'mr' ? 'साइन इन लिंक पाठवा' : 'Send Sign In Link'
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEmailLinkSent(false)}
                        className="w-full py-6 font-semibold"
                      >
                        {language === 'mr' ? 'परत जा' : 'Go Back'}
                      </Button>
                    </form>
                  )}
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {language === 'mr' ? 'पूर्ण नाव' : 'Full Name'} *
                      </Label>
                      <Input
                        id="reg-name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-2"
                        placeholder={language === 'mr' ? 'तुमचे नाव' : 'Your name'}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {language === 'mr' ? 'ईमेल' : 'Email'} *
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-2"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {language === 'mr' ? 'फोन नंबर' : 'Phone Number'} *
                      </Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-2"
                        placeholder="9876543210"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {language === 'mr' ? 'पूर्ण पत्ता' : 'Full Address'} *
                      </Label>
                      <Input
                        id="reg-address"
                        value={registerData.address}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                        className="mt-2"
                        placeholder={language === 'mr' ? 'तुमचा पूर्ण पत्ता' : 'Your complete address'}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-pincode">
                        {language === 'mr' ? 'पिनकोड (फक्त मुंबई)' : 'Pincode (Mumbai Only)'} *
                      </Label>
                      <Input
                        id="reg-pincode"
                        value={registerData.pincode}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, pincode: e.target.value }))}
                        className="mt-2"
                        placeholder="400XXX"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {language === 'mr' ? 'पासवर्ड' : 'Password'} *
                      </Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="mt-2"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-confirm-password">
                        {language === 'mr' ? 'पासवर्ड पुष्टी करा' : 'Confirm Password'} *
                      </Label>
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="mt-2"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-hero text-primary-foreground font-semibold py-6"
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {language === 'mr' ? 'नोंदणी होत आहे...' : 'Registering...'}</>
                      ) : (
                        language === 'mr' ? 'नोंदणी करा' : 'Create Account'
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted-foreground/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">{language === 'mr' ? 'किंवा' : 'Or'}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={handleGoogleSignIn}
                      className="w-full py-6 font-semibold flex items-center justify-center gap-2"
                    >
                      <Chrome className="h-4 w-4" />
                      {language === 'mr' ? 'Google सह साइन अप करा' : 'Sign up with Google'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {language === 'mr' 
                  ? 'नोंदणी करून, तुम्ही आमच्या अटी आणि शर्तींशी सहमत आहात'
                  : 'By registering, you agree to our Terms & Conditions'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;
