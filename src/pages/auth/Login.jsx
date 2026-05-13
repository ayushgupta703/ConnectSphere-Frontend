import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layers } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) clearError();
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await login(formData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="h-screen w-full bg-dark-950 flex overflow-hidden selection:bg-primary-500/30">
      {/* Left Branding Area */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-dark-900 border-r border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 text-3xl font-black text-gray-100 tracking-tighter">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <span className="text-white text-2xl">C</span>
          </div>
          ConnectSphere
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Connect with your world.
          </h1>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed">
            Join a vibrant community of creators, thinkers, and explorers. Share your story in a beautifully immersive space today.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-gray-600 font-medium">
          © {new Date().getFullYear()} ConnectSphere. All rights reserved.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 relative overflow-y-auto no-scrollbar bg-dark-950">
        <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-md w-full space-y-8 glass-card p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10 relative z-10">
          <div className="text-center">
            <div className="lg:hidden mx-auto w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] mb-6">
              <span className="text-white text-3xl font-black">C</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold text-gray-100 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to ConnectSphere to see what's happening
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm text-center border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <Input
                id="email"
                name="email"
                type="email"
                required
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                id="password"
                name="password"
                type="password"
                required
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-900 text-gray-500 rounded-full border border-white/5 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              className="w-full h-12 gap-3 font-semibold hover:bg-white/5 border border-white/5"
              onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary-400 hover:text-primary-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
