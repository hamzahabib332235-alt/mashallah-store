import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { store } = useWholesaleStore();

  const [username, setUsername] = useState('hamzahabib');
  const [password, setPassword] = useState('242006');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminQuickLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const res = store.authenticate('hamzahabib', '242006');
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Authentication failed');
        setIsLoading(false);
      }
    }, 200);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const res = store.authenticate(username, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Invalid credentials');
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 font-sans select-none">
      {/* Background radial ambient lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-7 shadow-2xl backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-950/60 font-black text-xl">
            MW
          </div>
          <h1 className="mt-3 text-xl font-black tracking-tight text-white uppercase">
            MASHAALLAH WHOLESALE
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Shop Management, POS & Khata Accounts System
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-2.5 py-0.5 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
            <Sparkles className="h-3 w-3" />
            <span>Admin Security Gateway</span>
          </div>
        </div>

        {/* Highlighted Admin Credentials Banner */}
        <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Administrator Credentials
            </span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
              Active
            </span>
          </div>

          <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Admin Name:</span>
              <span className="font-bold text-white">Hamza Habib</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Username:</span>
              <span className="font-mono font-bold text-emerald-400">hamzahabib</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Password:</span>
              <span className="font-mono font-bold text-emerald-400">242006</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAdminQuickLogin}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs shadow-md shadow-emerald-950/40 gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            Sign In as Hamza Habib (1-Click)
          </Button>
        </div>

        {/* Separator */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Or Manual Credentials Login
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleFormLogin} className="space-y-3.5">
          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <UserIcon className="h-3 w-3 text-slate-400" />
              <span>Username</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="hamzahabib"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Password / Security PIN</span>
            </Label>
            <Input
              type="password"
              required
              placeholder="242006"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-xs"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-500/40 p-2 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 text-xs border border-slate-700 gap-1.5 mt-2"
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
            {isLoading ? 'Verifying...' : 'Log In to Dashboard'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-5 text-center text-[10px] text-slate-500">
          MASHAALLAH WHOLESALE • Commercial POS & Accounting
        </div>
      </div>
    </div>
  );
};
