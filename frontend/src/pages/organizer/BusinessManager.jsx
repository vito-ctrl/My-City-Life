import React, { useState, useEffect, useMemo } from 'react';
import {
  FiMapPin, FiX, FiSearch,
  FiBriefcase, FiPlus, FiChevronDown, FiChevronUp,
  FiCheckCircle, FiXCircle, FiClock, FiRefreshCw,
} from 'react-icons/fi';
import BusinessForm from '../../components/layout/BusinessForm';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import { UpdateReservationStatus, GetReservations } from '../../services/reservation/reservation'; // ← was missing
import BusinessEditButton from './BusinessEditButton';
import BusinessDeleteButton from './BusinessDeleteButton';

// ── Helpers ───────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10     text-red-400     border-red-500/20',
    pending:   'bg-amber-500/10   text-amber-400   border-amber-500/20',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border inline-flex items-center gap-1 ${map[status] ?? 'bg-white/5 text-zinc-500 border-zinc-800'}`}>
      {status === 'confirmed' && <FiCheckCircle size={8} />}
      {status === 'pending'   && <FiClock       size={8} />}
      {status === 'cancelled' && <FiXCircle     size={8} />}
      {status}
    </span>
  );
};

const formatDate = (str) => {
  if (!str) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(str)); }
  catch { return str; }
};

// ── Reservations panel (expanded per business) ────────────────────────────────
const ReservationsPanel = ({ businessId, token, onStatusChange }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data  = await GetReservations(businessId);
        // const data = await res.json();
        console.log(data);
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setError('Could not load reservations. hiiii');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [businessId]);

  const handleStatus = async (id, status) => {
    const res = await UpdateReservationStatus(id, status);
    console.log(res);
    if (res) {
      setItems(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      onStatusChange?.();
    }
  };

  if (loading) return (
    <div className="grid gap-2 mt-3">
      {[1,2].map(i => <div key={i} className="h-12 bg-zinc-800 rounded-xl animate-pulse" />)}
    </div>
  );

  if (error) return <p className="text-red-400 text-xs mt-3">{error}</p>;

  if (!items.length) return (
    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-4 py-4 text-center border border-dashed border-zinc-800 rounded-xl">
      No reservations yet
    </p>
  );

  return (
    <div className="mt-3 grid gap-2">
      {items.map(res => (
        <div key={res.id} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-amber-500 font-black text-[10px] flex-shrink-0">
              {res.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none mb-0.5">
                {res.user?.name ?? '—'}
                <span className="text-zinc-500 font-normal ml-1.5">→</span>
                <span className="text-zinc-300 ml-1.5">{res.reservable_item?.name ?? '—'}</span>
              </p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                {formatDate(res.start_time)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={res.status} />
            {res.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatus(res.id, 'confirmed')}
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatus(res.id, 'cancelled')}
                  className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[9px] font-black uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  Deny
                </button>
              </>
            )}
            {res.status !== 'pending' && (
              <button
                onClick={() => handleStatus(res.id, 'pending')}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase rounded-lg hover:text-white transition-all"
              >
                Re-open
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const BusinessRow = ({ business, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] overflow-hidden transition-all duration-200 hover:border-zinc-700">
      {/* Main row */}
      <div className="p-5 flex items-center gap-5">
        {/* Image */}
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 flex-shrink-0">
          {business.image && (
            <img
              src={`http://127.0.0.1:8000/storage/${JSON.parse(business.image)[0]}`}
              className="w-full h-full object-cover"
              alt={business.name}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black uppercase tracking-tight text-white truncate leading-none mb-1">
            {business.name}
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex-wrap">
            <span className="flex items-center gap-1"><FiMapPin size={10} /> {business.location}</span>
            <span className="px-2 py-0.5 bg-zinc-800 rounded text-amber-500 border border-zinc-700">{business.type}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              expanded
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            Reservations
            {expanded ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
          </button>
          <BusinessEditButton onClick={() => onEdit(business.id)} />
          <BusinessDeleteButton onClick={() => onDelete(business.id)} />
        </div>
      </div>

      {/* Reservations panel (accordion) */}
      {expanded && (
        <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-0.5">Incoming Reservations</p>
          <ReservationsPanel businessId={business.id} token={token} />
        </div>
      )}
    </div>
  );
};

const BusinessManager = () => {
  const [businesses, setBusinesses]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token    = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchMyBusinesses = async () => {
    setLoading(true);
    try {
      const res  = await fetch('http://127.0.0.1:8000/api/businesses/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyBusinesses(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this business and all its reservations?')) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/businesses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyBusinesses();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleEdit = (businessId) => {
    navigate(`/business/edit/${businessId}`);
  };

  const filtered = useMemo(
    () => businesses.filter(b => b.name?.toLowerCase().includes(searchQuery.toLowerCase())),
    [businesses, searchQuery]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <Header />

      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-amber-500/[0.04] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
              <h1 className="text-4xl font-black tracking-tighter uppercase">My Establishments</h1>
            </div>
            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-[0.3em] ml-5">
              Business Management Portal
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 text-black px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/15"
          >
            <FiPlus strokeWidth={3} size={14} />
            Register New Business
          </button>
        </div>

        {/* ── Summary strip ── */}
        {!loading && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <FiBriefcase size={13} className="text-amber-500" />
              <span className="text-sm font-black">{businesses.length}</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {businesses.length === 1 ? 'Listing' : 'Listings'}
              </span>
            </div>
            <button
              onClick={fetchMyBusinesses}
              className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-600 rounded-xl hover:text-zinc-400 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={13} />
            </button>
          </div>
        )}

        {/* ── Search ── */}
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-11 pr-5 text-xs font-bold focus:border-amber-500/50 outline-none transition-all placeholder:text-zinc-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white">
              <FiX size={13} />
            </button>
          )}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-[20px] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-[32px]">
            <FiBriefcase size={28} className="mx-auto mb-3 text-zinc-700" />
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm">
              {searchQuery ? 'No results found' : 'No businesses yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500/15 transition-all"
              >
                Register your first business
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(b => (
              <BusinessRow
                key={b.id}
                business={b}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-zinc-500 hover:text-white transition-colors"
            >
              <FiX size={28} />
            </button>
            <BusinessForm
              isPopup={true}
              onSuccess={() => { setIsModalOpen(false); fetchMyBusinesses(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManager;
