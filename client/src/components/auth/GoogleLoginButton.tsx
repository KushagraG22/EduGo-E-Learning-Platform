import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, HelpCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleLoginButtonProps {
  role?: UserRole;
  text?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  role = 'student',
  text = 'Continue with Google',
  onSuccess,
  onError,
  className = '',
}) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const gsiInitializedRef = useRef<boolean>(false);
  const gsiButtonRef = useRef<HTMLDivElement>(null);

  // Fetch backend Google configuration status on mount
  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      try {
        const res = await api.get('/auth/config');
        if (mounted && res.data?.success) {
          setGoogleClientId(res.data.googleClientId || '');
          setIsConfigured(Boolean(res.data.isGoogleConfigured && res.data.googleClientId));
        }
      } catch (err) {
        if (mounted) {
          setIsConfigured(false);
        }
      }
    };
    fetchConfig();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle Google Identity Services (GSI) credential response
  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      const msg = 'Google authentication response did not contain credential.';
      if (onError) onError(msg);
      return;
    }

    setLoading(true);
    try {
      const result = await googleLogin(response.credential, role);
      if (result.success) {
        if (onSuccess) onSuccess();
        const storedUser = JSON.parse(localStorage.getItem('edugo_user') || '{}');
        if (storedUser.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const msg = result.message || 'Google authentication failed.';
        if (onError) onError(msg);
      }
    } catch (err: any) {
      const msg = err?.message || 'Unexpected error during Google login.';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initialize GSI if client ID is configured and script is available
  useEffect(() => {
    if (!isConfigured || !googleClientId || gsiInitializedRef.current) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        gsiInitializedRef.current = true;
      } catch (e) {
        // GSI initialization error handled gracefully
      }
    }
  }, [isConfigured, googleClientId, role]);

  const handleButtonClick = async () => {
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }

    setLoading(true);
    try {
      // If GSI prompt is available, try prompt first
      if (window.google?.accounts?.id && gsiInitializedRef.current) {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to OAuth popup/redirect flow via backend
            triggerOAuthRedirect();
          }
        });
      } else {
        await triggerOAuthRedirect();
      }
    } catch (err: any) {
      setLoading(false);
      if (onError) onError(err?.message || 'Could not initiate Google authentication');
    }
  };

  const triggerOAuthRedirect = async () => {
    try {
      const res = await api.get(`/auth/google/url?role=${role}`);
      if (res.data?.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        setLoading(false);
        if (onError) onError('Could not retrieve Google OAuth authorization URL.');
      }
    } catch (err: any) {
      setLoading(false);
      setShowConfigModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        id="google-login-btn"
        onClick={handleButtonClick}
        disabled={loading}
        aria-label={text}
        className={`w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{loading ? 'Authenticating with Google...' : text}</span>
      </button>

      {/* Hidden container for Google GSI fallback rendering */}
      <div ref={gsiButtonRef} className="hidden" aria-hidden="true" />

      {/* Setup Guidance Modal if Google OAuth is not configured in environment */}
      {showConfigModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-setup-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="google-setup-title" className="text-base font-bold text-slate-900">
                  Google OAuth Configuration Required
                </h3>
                <p className="text-xs text-slate-500">
                  Google Sign-In is fully implemented in code and ready for credentials.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-semibold text-slate-800">
                To connect real Google accounts in your local or production environment:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-600">
                <li>
                  Go to{' '}
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-brand-700">
                    console.cloud.google.com
                  </span>{' '}
                  and open <strong>APIs & Services &gt; Credentials</strong>.
                </li>
                <li>
                  Create an <strong>OAuth 2.0 Client ID</strong> (Web application).
                </li>
                <li>
                  Add Authorized JavaScript origins:{' '}
                  <code className="bg-white px-1 py-0.5 rounded border font-mono text-slate-800">
                    http://localhost:5173
                  </code>
                </li>
                <li>
                  Add Authorized redirect URIs:{' '}
                  <code className="bg-white px-1 py-0.5 rounded border font-mono text-slate-800">
                    http://localhost:5173/auth/google/callback
                  </code>
                </li>
                <li>
                  Add <code className="bg-white px-1 py-0.5 rounded border font-mono text-slate-800">GOOGLE_CLIENT_ID</code> and{' '}
                  <code className="bg-white px-1 py-0.5 rounded border font-mono text-slate-800">GOOGLE_CLIENT_SECRET</code> to your{' '}
                  <code className="font-mono">server/.env</code> file.
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Email/Password login is currently active and fully functional.
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
