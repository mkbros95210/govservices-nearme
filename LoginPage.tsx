import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from './supabaseClient';

const { Link, useNavigate, useLocation } = ReactRouterDOM as any;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      navigate(from, { replace: true });

    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-250px)] bg-slate-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200/50">
            {/* Left side with brand/welcome message */}
            <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-center">
                 <h1 className="text-4xl font-black tracking-tighter">Welcome Back!</h1>
                 <p className="mt-4 opacity-80 max-w-sm">Sign in to access thousands of government services right at your fingertips.</p>
            </div>

            {/* Right side with the form */}
            <div className="p-8 sm:p-14">
                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Sign In
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-cyan-600 hover:underline">
                        Create one now
                        </Link>
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div className="relative">
                       <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                           <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                         </svg>
                       </div>
                       <input
                         id="email-address"
                         name="email"
                         type="email"
                         autoComplete="email"
                         required
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                         placeholder="Email Address"
                       />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                         </div>
                         <input
                           id="password-2"
                           name="password"
                           type="password"
                           autoComplete="current-password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                           placeholder="Password"
                         />
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <a href="#" className="text-sm font-medium text-cyan-600 hover:underline">Forgot your password?</a>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center border border-red-200">{error}</p>}

                    <div>
                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 disabled:bg-slate-400 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/40"
                        >
                        {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;