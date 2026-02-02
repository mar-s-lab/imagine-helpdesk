import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const redirectTo = searchParams.get('redirect_to') || '/';
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      if (!token || !type) {
        setError('Missing authentication parameters');
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      try {
        // Verify the OTP token from the magic link
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as 'magiclink' | 'email',
        });

        if (verifyError) {
          console.error('Verification error:', verifyError);
          setError(verifyError.message);
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Successfully authenticated, redirect to the intended destination
        navigate(redirectTo);
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <p className="text-destructive">{error}</p>
            <p className="text-muted-foreground text-sm">Redirigiendo al login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Completando autenticación...</p>
          </div>
        )}
      </div>
    </div>
  );
}
