"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export default function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-white">Create a Post</h1>
      
      <div className="glass-panel p-6 rounded-2xl">
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <textarea 
              required
              rows={5}
              placeholder="What's on your mind?"
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              value={content} onChange={e => setContent(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Image URL (optional)</label>
            <input 
              type="url" 
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={imageUrl} onChange={e => setImageUrl(e.target.value)} 
            />
          </div>
          
          {imageUrl && (
            <div className="rounded-xl overflow-hidden relative w-full h-48 border border-white/10 mt-4 bg-slate-800">
              <img src={imageUrl} alt="Preview" className="object-cover w-full h-full" />
            </div>
          )}

          <div className="flex justify-end">
            <button 
              type="submit" disabled={loading || !content.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
