import React, { useEffect, useState } from 'react';
import { LockKeyhole, LogIn, UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Login() {
  const { hasAccount, login, register } = useAuth();
  const [mode, setMode] = useState(hasAccount ? 'login' : 'register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(hasAccount ? 'login' : 'register');
  }, [hasAccount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-[#1c1917] text-white border border-[#44403c] rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder:text-stone-500';

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-stone-200 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-[#0a0f1c] to-[#0a0f1c]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-yellow-600 to-amber-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Upwork AI</h1>
            <p className="text-sm text-stone-400">Private strategist workspace</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' ? 'Sign in' : 'Create access'}
              </h2>
              <p className="text-sm text-stone-400 mt-1">
                {mode === 'login' ? 'Continue to your dashboard' : 'Set up the first local account'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <LockKeyhole className="w-5 h-5" />
            </div>
          </div>

          {hasAccount && (
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#1c1917] border border-[#292524] mb-5">
              {['login', 'register'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError('');
                  }}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                    mode === item ? 'bg-[#292524] text-white' : 'text-stone-400 hover:text-white'
                  )}
                >
                  {item === 'login' ? 'Login' : 'New Account'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1.5">Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1.5">Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1.5">Password</label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isSubmitting ? 'Working...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
