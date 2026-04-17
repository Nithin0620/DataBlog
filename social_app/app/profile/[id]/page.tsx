"use client";

import { useEffect, useState, use } from 'react';
import PostCard from '@/components/PostCard';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';

export default function Profile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [authRes, profileRes, postsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch(`/api/users/${id}`),
          fetch(`/api/posts?userId=${id}`)
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          setCurrentUserId(authData.user?.id || null);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.error) {
            setProfile(null);
          } else {
            setProfile(profileData);
            setIsFollowing(profileData.isFollowing);
          }
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const toggleFollow = async () => {
    if (!currentUserId) return;
    setFollowLoading(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.followed);
        setProfile((prev: any) => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: prev._count.followers + (data.followed ? 1 : -1)
          }
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-xl font-semibold text-slate-300">User not found</div>;
  }

  const isOwnProfile = currentUserId === id;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="glass-panel p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl shrink-0">
          {profile.username[0].toUpperCase()}
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-1">{profile.username}</h1>
          <p className="text-slate-400 mb-4 text-sm">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          
          <div className="flex justify-center md:justify-start gap-6 text-sm">
            <div className="text-center">
              <span className="block font-bold text-lg text-white">{profile._count.posts}</span>
              <span className="text-slate-400">Posts</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg text-white">{profile._count.followers}</span>
              <span className="text-slate-400">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg text-white">{profile._count.following}</span>
              <span className="text-slate-400">Following</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          {!isOwnProfile && currentUserId && (
            <button 
              onClick={toggleFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                isFollowing 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg disabled:opacity-50'
              }`}
            >
              {isFollowing ? (
                <><UserCheck className="w-5 h-5" /> Following</>
              ) : (
                <><UserPlus className="w-5 h-5" /> Follow</>
              )}
            </button>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Posts</h2>
      
      {posts.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-2xl text-slate-400">
          No posts from this user yet.
        </div>
      ) : (
        posts.map((post: any) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))
      )}
    </div>
  );
}
