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
      } catch (e) { }
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
    <nav className="glass-panel sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between mx-2 md:mx-4 mt-2 md:mt-4 rounded-2xl">
      <Link href="/" className="text-xl md:text-2xl font-bold text-foreground hover:text-primary transition-colors">
        DataBlog
      </Link>
      <div className="flex items-center space-x-4 md:space-x-6 text-sm md:text-base">
        <Link href="/" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1 md:gap-2">
          <Home className="w-5 h-5" /> <span className="hidden sm:inline">Feed</span>
        </Link>
        {userId ? (
          <>
            <Link href="/create" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1 md:gap-2">
              <PenSquare className="w-5 h-5" /> <span className="hidden sm:inline">Post</span>
            </Link>
            <Link href={`/profile/${userId}`} className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1 md:gap-2">
              <UserIcon className="w-5 h-5" /> <span className="hidden sm:inline">Profile</span>
            </Link>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 md:gap-2">
              <LogOut className="w-5 h-5" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <div className="space-x-2 md:space-x-4">
            <Link href="/login" className="text-slate-600 hover:text-primary transition-colors">Login</Link>
            <Link href="/signup" className="bg-primary hover:bg-[#b58c63] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
