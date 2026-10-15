import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  const { login, logout } = useAuth();
  const { success, error } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const isAdm = await login(data.email, data.password);

      if (isAdm) {
        success('Administrator Authenticated', 'Access granted to admin workspace.');
        navigate(redirectPath, { replace: true });
      } else {
        await logout();
        error(
          'Insufficient Permissions',
          'This account does not have administrator privileges. Please contact the store owner.'
        );
      }
    } catch (err: any) {
      // Error handled by auth context
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Admin Access Portal
          </h2>
          <p className="text-xs text-slate-400">
            Sign in with authorized administrator credentials to manage products, categories, and Cash on Delivery orders.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@vulmora.in"
                {...register('email')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-800 border ${
                  errors.email ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-800 border ${
                  errors.password ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Customer Website
          </a>
        </div>
      </div>
    </div>
  );
};
