"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center flex-grow items-center px-4 py-12 md:h-[70vh]">
      <div className="glass-panel p-6 md:p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">Join Sociality</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-200">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
            <input 
              type="text" required 
              className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={username} onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input 
              type="email" required 
              className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={email} onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input 
              type="password" required 
              className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-[#b58c63] text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm md:text-base text-slate-500">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
