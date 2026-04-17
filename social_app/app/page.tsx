"use client";

import { useEffect, useState } from 'react';
import PostCard from '@/components/PostCard';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const [authRes, postsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/posts')
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          setCurrentUserId(authData.user?.id || null);
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

    fetchUserAndPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Your Feed
      </h1>
      
      {posts.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-2xl text-slate-400">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        posts.map((post: any) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))
      )}
    </div>
  );
}
