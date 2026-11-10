import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Image, 
  Sparkles, 
  User, 
  ShieldCheck, 
  AlertTriangle,
  Share2
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function CommunityFeed() {
  const { communityPosts, handleLikePost, handleAddPost } = usePawPatrol();

  const [newPostText, setNewPostText] = useState('');
  const [authorName, setAuthorName] = useState('Dr. Anjali Nair (Villa 12)');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  const samplePhotos = [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    handleAddPost({
      author: authorName,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Resident",
      badge: "Pet Parent",
      content: newPostText,
      photo: photoUrl || null
    });

    setNewPostText('');
    setPhotoUrl('');
    setShowPhotoInput(false);
  };

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col h-full max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>Palm Meadows Community Wall</span>
          </h2>
          <p className="text-[10px] text-slate-400">Canine sightings, thank-yous & neighborhood updates</p>
        </div>
        <span className="text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
          {communityPosts.length} Posts
        </span>
      </div>

      {/* Post Composer */}
      <form onSubmit={handleSubmit} className="my-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
        <textarea
          rows="2"
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="Share a sighting, pet photo, or thank Sparky for a safe escort..."
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
        />

        {showPhotoInput && (
          <div className="space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Choose a sample photo or paste image URL:</span>
            <div className="flex gap-2">
              {samplePhotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  onClick={() => setPhotoUrl(url)}
                  className={`w-10 h-10 rounded-lg object-cover cursor-pointer border-2 transition ${photoUrl === url ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'}`}
                  alt="Sample"
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPhotoInput(!showPhotoInput)}
            className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
          >
            <Image className="w-3.5 h-3.5" />
            <span>{photoUrl ? 'Photo attached ✓' : 'Add Photo'}</span>
          </button>

          <button
            type="submit"
            disabled={!newPostText.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
          >
            <Send className="w-3 h-3" /> Post
          </button>
        </div>
      </form>

      {/* Feed Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {communityPosts.map((post) => (
          <div 
            key={post.id}
            className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-2.5 transition hover:shadow-md"
          >
            {/* Author bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{post.author}</span>
                    <span className="text-[9px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold px-1.5 py-0.2 rounded-full">
                      {post.badge || 'Resident'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{post.timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Post text */}
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {post.content}
            </p>

            {/* Attached Image */}
            {post.photo && (
              <div className="rounded-xl overflow-hidden max-h-48 border border-slate-200/50 dark:border-slate-700">
                <img
                  src={post.photo}
                  alt="Community attachment"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Likes and interaction bar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex items-center gap-1 font-semibold transition ${
                  post.isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes} Cheers</span>
              </button>

              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{post.comments?.length || 0} Replies</span>
              </span>
            </div>

            {/* Comments preview */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                {post.comments.map((c) => (
                  <div key={c.id} className="text-[11px] bg-slate-100/70 dark:bg-slate-800/60 p-2 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 mr-1.5">{c.author}:</span>
                    <span className="text-slate-600 dark:text-slate-400">{c.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

