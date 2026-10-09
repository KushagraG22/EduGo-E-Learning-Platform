import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setErrorMessage(
          error === 'access_denied'
            ? 'Google login was cancelled.'
            : `Google authentication failed (${error}).`
        );
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code was received from Google.');
        return;
      }

      let role: any = 'student';
      if (state) {
        try {
          const parsed = JSON.parse(state);
          if (parsed.role) role = parsed.role;
        } catch {
          // Default to student
        }
      }

      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const result = await googleLogin({ code, redirectUri, role });

        if (result.success) {
          setStatus('success');
          const storedUser = JSON.parse(localStorage.getItem('edugo_user') || '{}');
          setTimeout(() => {
            if (storedUser.role === 'teacher') {
              navigate('/teacher/dashboard');
            } else {
              navigate('/dashboard');
            }
          }, 800);
        } else {
          setStatus('error');
          setErrorMessage(result.message || 'Google authentication failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err?.message || 'Failed to authenticate with Google server.');
      }
    };

    handleAuth();
  }, [searchParams, googleLogin, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" className="justify-center" />
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          {status === 'loading' && 'Authenticating with Google...'}
          {status === 'success' && 'Welcome to EduGo!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6">
          {status === 'loading' && (
            <div className="py-6 flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
              <p className="text-sm text-slate-600">
                Verifying your credentials and establishing a secure session...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-6 flex flex-col items-center gap-3 text-emerald-600">
              <CheckCircle className="w-10 h-10" />
              <p className="text-sm font-semibold text-slate-800">
                Login successful! Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-800">Authentication Error</h4>
                  <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Return to Login
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Create an Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
