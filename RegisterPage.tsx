import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from './supabaseClient';

const { Link } = ReactRouterDOM as any;

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            dob: dob,
            mobile_number: mobile,
          },
        },
      });

      if (error) {
        throw error;
      }
      if (data.user) {
        setSuccessMessage('Registration successful! Please check your email for a confirmation link to complete the process.');
      } else {
         throw new Error("Registration failed. Please try again.");
      }

    } catch (err: any) {
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
        setLoading(false);
    }
  };
  
  if (successMessage) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-250px)] bg-slate-50 p-4">
            <div className="max-w-lg w-full space-y-6 bg-white p-10 rounded-3xl shadow-2xl border border-slate-200/50 text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-cyan-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                 <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Confirm Your Email
                </h2>
                <p className="text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">{successMessage}</p>
                 <p className="text-sm text-slate-600">
                    We've sent a confirmation link to <span className="font-semibold text-slate-800">{email}</span>. Click it to activate your account.
                </p>
                 <Link to="/login" className="inline-block mt-6 px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                    Back to Login
                </Link>
            </div>
        </div>
    );
  }

  return (
     <div className="flex items-center justify-center min-h-[calc(100vh-250px)] bg-slate-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200/50">
            {/* Left side with brand/welcome message */}
            <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-center">
                 <h1 className="text-4xl font-black tracking-tighter">Join Us Today!</h1>
                 <p className="mt-4 opacity-80 max-w-sm">Create an account to simplify access to government services and manage all your applications in one place.</p>
            </div>

            {/* Right side with the form */}
            <div className="p-8 sm:p-14">
                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Already a member?{' '}
                        <Link to="/login" className="font-semibold text-cyan-600 hover:underline">
                        Sign In
                        </Link>
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                        <input type="date" placeholder="Date of Birth" required value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition text-slate-500" />
                    </div>
                     <input type="tel" placeholder="Mobile Number" required value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                     <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                     <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                     <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center border border-red-200">{error}</p>}

                    <div className="pt-4">
                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 disabled:bg-slate-400 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/40"
                        >
                        {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default RegisterPage;