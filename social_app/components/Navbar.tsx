"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Home, PenSquare, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserId(data.user?.id || null);
        }
      } catch (e) {}
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUserId(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between mx-4 mt-4 rounded-2xl">
      <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Sociality
      </Link>
      <div className="flex items-center space-x-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
          <Home className="w-5 h-5" /> <span className="hidden sm:inline">Feed</span>
        </Link>
        {userId ? (
          <>
            <Link href="/create" className="hover:text-primary transition-colors flex items-center gap-2">
              <PenSquare className="w-5 h-5" /> <span className="hidden sm:inline">Post</span>
            </Link>
            <Link href={`/profile/${userId}`} className="hover:text-primary transition-colors flex items-center gap-2">
              <UserIcon className="w-5 h-5" /> <span className="hidden sm:inline">Profile</span>
            </Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2">
              <LogOut className="w-5 h-5" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <div className="space-x-4">
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link href="/signup" className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
