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
      {/* Left Branding Area */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 bg-[#080808] border-r border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-600/10 blur-[140px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full animate-aurora [animation-delay:-10s]" />
        
        <div className="relative z-10 flex items-center gap-4 text-4xl font-black text-gray-100 tracking-tighter group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
            <span className="text-white text-3xl">C</span>
          </div>
          ConnectSphere
        </div>
        
        <div className="relative z-10 max-w-xl">
          <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tight">
            Connect with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">your world.</span>
          </h1>
          <p className="mt-8 text-xl text-gray-400 leading-relaxed max-w-md font-light">
            Join a vibrant community of creators, thinkers, and explorers. Share your story in a beautifully immersive space today.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-gray-600 font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} ConnectSphere. Crafted for creators.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto no-scrollbar bg-[#050505]">
        <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        
        <div className="max-w-md w-full space-y-8 glass-card p-10 sm:p-12 rounded-[3rem] shadow-premium relative z-10 group/card">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[3rem]" />
          
          <div className="text-center relative z-10">
            <div className="lg:hidden mx-auto w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow mb-8 transition-transform duration-500 hover:rotate-12">
              <span className="text-white text-4xl font-black">C</span>
            </div>
            <h2 className="text-4xl font-black text-gray-100 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-3 text-base text-gray-400 font-light">
              Sign in to ConnectSphere to see what's happening
            </p>
          </div>

          <form className="mt-10 space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm text-center border border-red-500/20 animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Input
                id="email"
                name="email"
                type="email"
                required
                label="Email Address"
                placeholder="name@example.com"
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

            <Button type="submit" className="w-full h-14 text-lg font-black tracking-wide" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-10 relative z-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-[#0a0a0a] text-gray-500 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-[0.2em]">Or continue with</span>
            </div>
          </div>

          <div className="mt-8 relative z-10">
            <Button
              type="button"
              variant="secondary"
              className="w-full h-14 gap-4 font-bold hover:bg-white/[0.08] border border-white/10"
              onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
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
              Google
            </Button>
          </div>

          <div className="mt-10 text-center relative z-10">
            <p className="text-sm text-gray-400 font-light">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-primary-400 hover:text-primary-300 transition-all hover:tracking-wide">
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
