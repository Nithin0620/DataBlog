"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Send } from 'lucide-react';

type User = { id: string, username: string };
type Comment = { id: string, text: string, user: User };
type Like = { id: string, userId: string };

type PostProps = {
  post: {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    user: User;
    likes: Like[];
    comments: Comment[];
  };
  currentUserId: string | null;
};

export default function PostCard({ post, currentUserId }: PostProps) {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [isLiked, setIsLiked] = useState(post.likes.some(l => l.userId === currentUserId));
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const toggleLike = async () => {
    if (!currentUserId) return alert("Please log in to like posts");
    
    // Optimistic update
    const currentlyLiked = isLiked;
    setIsLiked(!currentlyLiked);
    if (currentlyLiked) {
      setLikes(likes.filter(l => l.userId !== currentUserId));
    } else {
      setLikes([...likes, { id: 'temp', userId: currentUserId }]);
    }

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id })
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      // Revert optimism
      setIsLiked(currentlyLiked);
      if (currentlyLiked) {
        setLikes([...likes, { id: 'temp', userId: currentUserId }]);
      } else {
        setLikes(likes.filter(l => l.userId !== currentUserId));
      }
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return alert("Please log in to comment");
    if (!commentText.trim()) return;

    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, text: commentText })
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setCommentText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-panel w-full rounded-2xl p-4 md:p-6 mb-6 hover-lift text-foreground">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-primary/20 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
          {post.user.username[0].toUpperCase()}
        </div>
        <div className="ml-3">
          <Link href={`/profile/${post.user.id}`} className="font-semibold text-foreground hover:underline">
            {post.user.username}
          </Link>
          <div className="text-xs text-slate-500">{formatDate(post.createdAt)}</div>
        </div>
      </div>
      
      <p className="text-sm md:text-base lg:text-lg mb-4 whitespace-pre-wrap flex-wrap break-words">{post.content}</p>
      
      {post.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden relative w-full h-48 md:h-64 sm:h-96">
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
        <button 
          onClick={toggleLike}
          className={`flex items-center gap-1.5 md:gap-2 transition-colors ${isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
        >
          <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm md:text-base">{likes.length}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 md:gap-2 text-slate-400 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">{comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
          {comments.map((comment, i) => (
            <div key={comment.id || i} className="bg-slate-100 rounded-xl p-3 text-sm flex flex-col hover:bg-slate-200 transition-colors">
              <Link href={`/profile/${comment.user.id}`} className="font-semibold text-primary hover:underline mb-1">
                {comment.user.username}
              </Link>
              <span className="text-slate-700">{comment.text}</span>
            </div>
          ))}
          
          {currentUserId && (
            <form onSubmit={submitComment} className="flex gap-2 mt-3 items-center">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..." 
                className="flex-grow bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button disabled={!commentText.trim()} type="submit" className="bg-primary hover:bg-[#b58c63] disabled:opacity-50 text-white rounded-full p-2.5 transition-colors shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
