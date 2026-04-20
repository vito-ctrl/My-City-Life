import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiMapPin, FiCalendar, FiArrowLeft, FiTag,
  FiShield, FiChevronRight, FiImage, FiSend, FiMessageSquare, FiClock
} from 'react-icons/fi';
import { getComments, postComment } from '../../services/comment';
import Paiment from '../../components/layout/Paiment';

const ActivitiesDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [fetchcomments, setFetchcommentsComments] = useState([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/api/${type}/${id}`);
        const json = await res.json();
        setItem(json.data);
        if (json.data?.image_urls?.length > 0) {
          setMainImage(json.data.image_urls[0]);
        }
        const commentsData = await getComments(type, id);
        setFetchcommentsComments(commentsData || []);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [type, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await postComment(type, id, comment);
      setComment('');
      const updatedComments = await getComments(type, id);
      setFetchcommentsComments(updatedComments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full" />
          <div className="absolute inset-0 border-t-2 border-amber-500 rounded-full animate-spin" />
        </div>
        <p className="text-zinc-500 text-sm tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-3">
      <p className="text-6xl font-bold text-zinc-800">404</p>
      <p className="text-zinc-500 tracking-widest uppercase text-sm">Activity Not Found</p>
    </div>
  );

  const startDate = new Date(item.start_date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const endDate = item.end_date
    ? new Date(item.end_date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/60 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium group"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-700 group-hover:border-amber-500 group-hover:text-amber-500 transition-all">
            <FiArrowLeft size={14} />
          </span>
          Back
        </button>
        {/* <span className="text-zinc-700">·</span>
        <span className="text-zinc-500 text-sm truncate">{item.title}</span> */}
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Hero Image + Gallery ── */}
        <section className="space-y-3">
          <div className="w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800" style={{ height: '360px' }}>
            {mainImage ? (
              <img
                src={mainImage}
                alt={item.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                <FiImage size={40} />
              </div>
            )}
          </div>

          {item.image_urls?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.image_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(url)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    mainImage === url
                      ? 'border-amber-500 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Title & Meta ── */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {item.category}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
              item.is_free
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}>
              {item.is_free ? 'Free' : `${item.price} MAD`}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
            {item.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <FiMapPin size={14} className="text-amber-500 flex-shrink-0" />
              {item.location}
            </span>
            <span className="flex items-center gap-2">
              <FiCalendar size={14} className="text-amber-500 flex-shrink-0" />
              {startDate}{endDate ? ` → ${endDate}` : ''}
            </span>
          </div>
        </section>

        <div className="border-t border-zinc-800" />

        {/* ── Description + Info Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">About this activity</h2>
            <p className="text-zinc-300 leading-relaxed text-base">
              {item.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                <FiShield size={12} className="text-amber-500" />
                Requirements
              </div>
              <p className="text-sm text-zinc-300">
                {item.requirements || 'No specific requirements'}
              </p>
            </div>

            {item.duration && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                  Duration
                </div>
                <p className="text-sm text-zinc-300">{item.duration}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800" />

        {/* ── Provider & CTA ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
              {item.user?.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">Provider</p>
              <p className="text-sm font-semibold text-white">{item.user?.name}</p>
              <p className="text-xs text-zinc-500">{item.user?.email}</p>
            </div>
          </div>

          {type === 'activities' && (
            <div className="mt-8"> {/* Removed min-h-screen which breaks the layout here */}
              <button 
                onClick={() => setIsPaymentOpen(true)}
                className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-sm px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                Confirm Booking
                <FiChevronRight size={16} />
              </button>
              
              <Paiment
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                activityId={id}
                activityPrice={item.price ?? 0}
                isFree={item.is_free}
              />
            </div>
          )}
        </div>

        {/* ── Comment Section Rebuilt ── */}
        <section className="pt-8 space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <FiMessageSquare className="text-amber-500" />
              <h2 className="text-lg font-bold text-white">Community Feed</h2>
            </div>
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em]">
              {fetchcomments.length} Comments
            </span>
          </div>

          {/* New Comment Form */}
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full h-14 pl-5 pr-16 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white placeholder:text-zinc-600 placeholder:italic focus:outline-none focus:border-amber-500/50 transition-all"
            />
            <button 
              disabled={isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 text-black rounded-xl hover:bg-white transition-all disabled:opacity-50"
            >
              <FiSend size={16} />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {fetchcomments.map((c) => (
              <div key={c.id} className="p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex gap-4 hover:border-zinc-700 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-white/5 overflow-hidden">
                    {c.user?.image ? (
                      <img src={c.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      c.user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-200">{c.user?.name}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                      <FiClock size={10} />
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed italic">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}

            {fetchcomments.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest italic">No messages yet. Start the conversation.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ActivitiesDetails;