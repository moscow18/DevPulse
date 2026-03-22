'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
// 👇 استدعاء محرك اللغة 👇
import { useLang } from '@/context/LanguageContext';

// ==========================================
// 🛠️ كومبوننت الرفع (VS Code Style) 
// ==========================================
function CreatePost({ onPostCreated, user }: { onPostCreated: () => void, user: any }) {
  const { t } = useLang(); // 👈 تفعيل الترجمة
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const PROGRAMMING_LANGUAGES = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 
    'rust', 'go', 'ruby', 'php', 'swift', 'kotlin', 'dart', 
    'html', 'css', 'sql', 'bash', 'shell', 'lua', 'perl', 'r', 'scala'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return toast.error(t('missing_fields'));
    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(filePath);
        uploadedImageUrl = publicUrl;
      }
      const { error } = await supabase.from('snippets').insert({
        title, code, language, difficulty, image_url: uploadedImageUrl, user_id: user.id
      });
      if (error) throw error;
      toast.success(t('snippet_deployed'));
      setTitle(''); setCode(''); setImageFile(null);
      onPostCreated();
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-10">
      {/* VS Code Header */}
      <div className="bg-white/5 border-b border-white/5 px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-mono text-slate-400">{t('new_snippet')}.{language.substring(0,3)}</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="flex-1 sm:flex-none bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-xs font-bold text-amber-400 outline-none cursor-pointer hover:bg-white/5 transition-colors">
            <option value="Beginner">{t('lvl_beginner') || 'Beginner'}</option>
            <option value="Intermediate">{t('lvl_intermediate') || 'Intermediate'}</option>
            <option value="Advanced">{t('lvl_advanced') || 'Advanced'}</option>
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex-1 sm:flex-none bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-xs font-bold text-cyan-400 outline-none cursor-pointer hover:bg-white/5 transition-colors uppercase">
            {PROGRAMMING_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>
      </div>

      <div className="p-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('what_code_do')} className="w-full bg-transparent border-b border-white/5 px-5 py-4 text-lg font-bold text-white focus:outline-none placeholder:text-slate-500 transition-colors focus:border-cyan-500/50" />
        
        {/* Editor Area */}
        <div className="flex bg-[#010409] rounded-b-xl overflow-hidden">
          <div className="hidden sm:flex flex-col text-slate-600 font-mono text-xs p-4 select-none border-r border-white/5 bg-white/[0.02]">
            {[1,2,3,4,5,6,7,8,9,10].map(num => <span key={num}>{num}</span>)}
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('write_code_here')} dir="ltr" className="w-full text-left bg-transparent p-4 h-48 font-mono text-sm text-cyan-100 focus:outline-none custom-scrollbar resize-none placeholder:text-slate-600" />
        </div>
      </div>

      <div className="bg-white/[0.02] border-t border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 w-full sm:w-auto justify-center border border-dashed border-white/20 sm:border-transparent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {imageFile ? imageFile.name : t('attach_output_img')}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </label>
        <button disabled={loading} className="w-full sm:w-auto px-8 py-2.5 bg-cyan-500 text-black font-black uppercase tracking-widest text-xs rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50">
          {loading ? t('deploying') : t('deploy_snippet')}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// 🌌 المكون الرئيسي (Home)
// ==========================================
export default function Home() {
  const router = useRouter();
  const { t } = useLang(); // 👈 تفعيل الترجمة في المكون الرئيسي
  const [posts, setPosts] = useState<any[]>([]);
  const [topDevs, setTopDevs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [feedType, setFeedType] = useState<'all' | 'following'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  const [systemStats, setSystemStats] = useState({ latency: 12, active: 342 });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        latency: Math.floor(Math.random() * 15) + 10,
        active: Math.max(120, prev.active + (Math.floor(Math.random() * 7) - 3))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getRankStyle = (rank: string) => {
    switch (rank) {
      case 'God_Mode': return 'text-[#adff2f] bg-[#adff2f]/10 border-[#adff2f]/30 shadow-[0_0_10px_rgba(173,255,47,0.2)]';
      case 'Lead_Architect': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'Senior_Node': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      default: return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  const getDiffStyle = (level: string) => {
    switch (level) {
      case 'Advanced': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Intermediate': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user ?? null;
      setUser(authUser);
      
      const { data: snippetsData } = await supabase.from('snippets').select('*').order('created_at', { ascending: false });
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const { data: likesData } = await supabase.from('likes').select('*');
      const { data: commentsData } = await supabase.from('comments').select('*');
      const { data: followsData } = await supabase.from('follows').select('*');
      const { data: vaultData } = authUser ? await supabase.from('vault').select('post_id').eq('user_id', authUser.id) : { data: [] };
      
      const followingIds = followsData?.filter(f => f.follower_id === authUser?.id).map(f => f.following_id) || [];
      
      if (authUser) {
        setStats({ 
          followers: followsData?.filter(f => f.following_id === authUser.id).length || 0, 
          following: followingIds.length 
        });
      }

      const formattedPosts = (snippetsData || [])
        .filter(post => feedType === 'following' ? followingIds.includes(post.user_id) : true)
        .map(post => ({
          ...post,
          profiles: profilesData?.find(p => p.id === post.user_id) || { full_name: 'Unknown User', avatar_url: null, rank: 'Developer' },
          likes_count: likesData?.filter(l => l.post_id === post.id).length || 0,
          is_liked: likesData?.some(l => l.post_id === post.id && l.user_id === authUser?.id) || false,
          is_saved: vaultData?.some((v: any) => v.post_id === post.id) || false,
          comments: (commentsData || []).filter(c => c.post_id === post.id).map(c => ({ ...c, user: profilesData?.find(p => p.id === c.user_id) }))
        }));
      setPosts(formattedPosts);
      setTopDevs(profilesData?.sort((a,b) => (b.rank === 'God_Mode' ? -1 : 1)).slice(0, 5) || []);
      
      if (authUser) {
        const { data: notifs } = await supabase.from('notifications').select('*, sender:profiles(full_name, avatar_url)').eq('user_id', authUser.id).order('created_at', { ascending: false });
        setNotifications(notifs || []);
      }
    } catch (err) { console.error(err); }
  }, [feedType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLike = async (postId: string, postOwnerId: string) => {
    if (!user) return toast.error(t('login_required'));
    const post = posts.find(p => p.id === postId);
    const wasLiked = post?.is_liked;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: !wasLiked, likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1 } : p));
    if (wasLiked) { await supabase.from('likes').delete().match({ user_id: user.id, post_id: postId }); }
    else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
      if (user.id !== postOwnerId) await supabase.from('notifications').insert({ user_id: postOwnerId, sender_id: user.id, type: 'like', post_id: postId });
    }
  };

  const handleSaveToVault = async (postId: string) => {
    if (!user) return toast.error(t('login_required'));
    const post = posts.find(p => p.id === postId);
    if (post?.is_saved) { await supabase.from('vault').delete().match({ user_id: user.id, post_id: postId }); toast.success(t('removed_vault')); }
    else { await supabase.from('vault').insert({ user_id: user.id, post_id: postId }); toast.success(t('saved_vault')); }
    fetchData();
  };

  const handleNotificationClick = async (n: any) => {
    try { await supabase.from('notifications').delete().eq('id', n.id); setNotifications(prev => prev.filter(notif => notif.id !== n.id)); setShowNotifPanel(false); if (n.type === 'message') router.push(`/chat/${n.sender_id}`); else if (n.post_id) router.push(`/post/${n.post_id}`); } catch (err) { console.error(err); }
  };

  const addComment = async (postId: string, postOwnerId: string) => {
    if (!commentText.trim() || !user) return;
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: commentText });
    if (!error) { if (user.id !== postOwnerId) await supabase.from('notifications').insert({ user_id: postOwnerId, sender_id: user.id, type: 'comment', post_id: postId }); setCommentText(''); fetchData(); toast.success(t('comment_added')); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('code_copied'));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* ==========================================
          💎 Navbar (Responsive & Clean)
          ========================================= */}
      <nav className="sticky top-0 z-[200] bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 w-full">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-4">
          
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <img src="/logo.jpeg" className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-cyan-500/50 transition-colors" alt="Logo" />
            <span className="hidden sm:block font-black text-2xl tracking-tighter text-white">DevPulse</span>
          </Link>
          
          <div className="relative flex-1 max-w-2xl">
            <svg className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder={t('search_devs')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0f172a] border border-white/5 rounded-full rtl:pr-11 rtl:pl-4 ltr:pl-11 ltr:pr-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all placeholder:text-slate-500" />
          </div>

          <div className="hidden xl:flex items-center gap-2">
            <Link href="/leaderboard" className="text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-colors">{t('hall_of_fame')}</Link>
            <Link href="/vault" className="text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-colors">{t('vault_link')}</Link>
            <Link href="/explore" className="text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-colors">{t('explore_link')}</Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <Link href="/create" className="hidden lg:flex items-center gap-2 text-xs font-black uppercase text-black bg-cyan-500 px-5 py-2.5 rounded-full hover:bg-cyan-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {t('deploy_btn')}
                </Link>

                {/* 🔔 Notifications */}
                <div className="relative">
                  <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="relative p-2.5 rounded-full border border-white/5 hover:bg-white/5 transition-colors focus:outline-none">
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    {notifications.length > 0 && <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-[#020617]"></span>}
                  </button>
                  {showNotifPanel && (
                    <div className="absolute rtl:left-0 ltr:right-0 mt-3 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-[300] overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <span className="font-bold text-sm text-white">{t('notifications')}</span>
                        {notifications.length > 0 && <span className="text-cyan-400 text-xs font-bold">{notifications.length} {t('new_alerts')}</span>}
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">{t('no_new_alerts')}</div> : notifications.map((n: any) => (
                          <div key={n.id} onClick={() => handleNotificationClick(n)} className="p-4 border-b border-white/5 flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <span className="text-xl">{n.type === 'like' ? '❤️' : '💬'}</span>
                            <div>
                              <p className="font-bold text-sm text-white">{n.sender?.full_name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{n.type === 'like' ? t('liked_snippet') : t('commented_snippet')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* ⚙️ Profile Dropdown */}
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 focus:outline-none p-1 rtl:pl-3 ltr:pr-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                    <img src={user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Moscow'} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute rtl:left-0 ltr:right-0 mt-3 w-56 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-5 py-3 border-b border-white/5 mb-2">
                        <p className="text-sm font-bold text-white truncate">{user.user_metadata?.full_name || t('developer_default')}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link href={`/profile/${user.id}`} className="block px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">{t('my_profile')}</Link>
                      <Link href="/settings" className="block px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">{t('settings')}</Link>
                      <button className="w-full text-left rtl:text-right px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">{t('theme_language')}</button>
                      <div className="h-px bg-white/5 my-2"></div>
                      <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="w-full text-left rtl:text-right px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors">{t('log_out')}</button>
                    </div>
                  )}
                </div>
              </>
            ) : ( 
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-black bg-cyan-500 px-6 py-2.5 rounded-full hover:bg-cyan-400 transition-colors">{t('sign_in')}</Link> 
            )}
          </div>
        </div>
      </nav>

      {/* ==========================================
          🌐 Main Grid Layout (Ultra Wide)
          ========================================= */}
      <main className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 px-4 md:px-8">
        
        {/* --- Left Sidebar --- */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
          <div className="sticky top-28 bg-[#0f172a] border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{t('top_developers')}</h3>
            <div className="space-y-2">
              {topDevs.map((dev) => (
                <div key={dev.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
                  <Link href={`/profile/${dev.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={dev.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${dev.id}`} className="w-10 h-10 rounded-full border border-white/10 object-cover group-hover:border-cyan-500 transition-colors shrink-0" />
                    <div className="min-w-0 pr-2 rtl:pl-2 rtl:pr-0">
                      <p className="text-sm font-bold text-white truncate">{dev.full_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5 truncate">{dev.rank || t('developer_default')}</p>
                    </div>
                  </Link>
                  {user && user.id !== dev.id && (
                    <Link href={`/chat/${dev.id}`} className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-cyan-500 hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100" title={t('signal_btn')}>
                      💬
                    </Link>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 border-t border-white/5 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-300">{t('system_operational')}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">{t('latency_label')} {systemStats.latency}ms | {t('active_label')} {systemStats.active}</p>
            </div>
          </div>
        </aside>

        {/* --- Middle Feed --- */}
        <section className="lg:col-span-9 xl:col-span-7">
          {user && (
            <>
              <div className="flex gap-4 mb-8">
                <button onClick={() => setFeedType('all')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${feedType === 'all' ? 'bg-white text-black shadow-lg' : 'bg-[#0f172a] border border-white/10 text-slate-400 hover:text-white'}`}>{t('global_feed')}</button>
                <button onClick={() => setFeedType('following')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${feedType === 'following' ? 'bg-white text-black shadow-lg' : 'bg-[#0f172a] border border-white/10 text-slate-400 hover:text-white'}`}>{t('following_feed')}</button>
              </div>
              <CreatePost onPostCreated={fetchData} user={user} />
            </>
          )}

          <div className="space-y-8 pb-20">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 border border-white/5 border-dashed rounded-3xl bg-[#0f172a]">
                <p className="text-slate-500 font-mono text-sm">{t('no_snippets_found')}</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="bg-[#0f172a] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden hover:border-white/10 transition-colors">
                  
                  {/* Post Header */}
                  <div className="p-6 md:p-8 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/${post.user_id}`} className="flex items-center gap-4 group/user">
                        <img src={post.profiles?.avatar_url} className="w-12 h-12 rounded-xl border border-white/10 object-cover group-hover/user:border-cyan-500 transition-colors shrink-0" />
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-black text-sm text-white group-hover/user:text-cyan-400 transition-colors">{post.profiles?.full_name}</h4>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${getRankStyle(post.profiles?.rank)}`}>{post.profiles?.rank || t('developer_default')}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{formatDistanceToNow(new Date(post.created_at))} {t('ago')}</p>
                        </div>
                      </Link>
                      
                      {user && user.id !== post.user_id && (
                        <Link href={`/chat/${post.user_id}`} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black text-[9px] font-black uppercase tracking-widest transition-all rtl:mr-2 ltr:ml-2">
                          💬 <span className="hidden lg:block">{t('signal_btn')}</span>
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {user && user.id !== post.user_id && (
                        <Link href={`/chat/${post.user_id}`} className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                          💬
                        </Link>
                      )}
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase ${getDiffStyle(post.difficulty)}`}>{post.difficulty === 'Beginner' ? t('lvl_beginner') : post.difficulty === 'Intermediate' ? t('lvl_intermediate') : post.difficulty === 'Advanced' ? t('lvl_advanced') : post.difficulty || 'Beginner'}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6 md:p-8">
                    <Link href={`/post/${post.id}`}>
                      <h3 className="text-xl md:text-2xl font-black text-white mb-6 hover:text-cyan-400 transition-colors">{post.title}</h3>
                    </Link>

                    {/* VS Code Style Display */}
                    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#010409] mb-6 shadow-inner">
                      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
                        <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{post.language}</span>
                        <button onClick={() => copyToClipboard(post.code)} className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-md">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          {t('copy_btn')}
                        </button>
                      </div>
                      <pre dir="ltr" className="p-6 text-xs md:text-sm text-cyan-50/80 font-mono overflow-x-auto custom-scrollbar leading-relaxed text-left"><code>{post.code}</code></pre>
                    </div>

                    {post.image_url && (
                      <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#010409] mb-6">
                        <img src={post.image_url} className="w-full h-auto object-cover max-h-[500px]" />
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="px-6 md:px-8 py-4 border-t border-white/5 flex items-center gap-6 bg-white/[0.01]">
                    <button onClick={() => handleLike(post.id, post.user_id)} className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.is_liked ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}>
                      <svg className="w-5 h-5" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      {post.likes_count}
                    </button>
                    
                    <button onClick={() => setOpenComments(openComments === post.id ? null : post.id)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {post.comments?.length || 0}
                    </button>

                    <button onClick={() => handleSaveToVault(post.id)} className={`rtl:mr-auto ltr:ml-auto flex items-center gap-2 text-sm font-bold transition-colors ${post.is_saved ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                      <svg className="w-5 h-5" fill={post.is_saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </button>
                  </div>

                  {/* Threaded Comments */}
                  {openComments === post.id && (
                    <div className="border-t border-white/5 bg-[#010409]">
                      {user ? ( 
                        <div className="p-6 border-b border-white/5 flex gap-4">
                          <img src={user.user_metadata?.avatar_url} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          <div className="flex-1 flex flex-col sm:flex-row gap-3">
                            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment(post.id, post.user_id)} placeholder={t('write_comment')} className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                            <button onClick={() => addComment(post.id, post.user_id)} className="bg-white text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">{t('post_btn')}</button>
                          </div>
                        </div> 
                      ) : (
                        <div className="p-6 text-center border-b border-white/5"><p className="text-sm text-slate-500">{t('signin_to_comment')}</p></div>
                      )}
                      
                      <div className="max-h-96 overflow-y-auto custom-scrollbar p-6 space-y-6">
                        {post.comments.length === 0 ? (
                          <p className="text-center text-sm text-slate-500">{t('no_comments_yet')}</p>
                        ) : (
                          post.comments.map((c: any) => ( 
                            <div key={c.id} className="flex gap-4">
                              <img src={c.user?.avatar_url} className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10" />
                              <div className="flex-1 bg-[#0f172a] border border-white/5 p-4 rounded-2xl rtl:rounded-tr-sm ltr:rounded-tl-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-sm text-white">{c.user?.full_name}</span>
                                  <span className="text-xs text-slate-500 font-mono">{formatDistanceToNow(new Date(c.created_at))} {t('ago')}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{c.content}</p>
                              </div>
                            </div> 
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* --- Right Sidebar --- */}
        <aside className="hidden xl:block xl:col-span-3">
           <div className="sticky top-28 space-y-6">
              <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/20 rotate-3">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">{t('build_share_grow')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono">{t('devpulse_desc')}</p>
                <Link href="/explore" className="block w-full bg-white/5 hover:bg-white/10 text-xs font-bold text-white py-3 rounded-xl transition-colors uppercase tracking-widest border border-white/10">{t('explore_hub')}</Link>
              </div>
           </div>
        </aside>

      </main>
    </div>
  );
}