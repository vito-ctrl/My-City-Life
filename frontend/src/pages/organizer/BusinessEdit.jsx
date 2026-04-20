import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiPlus, FiTrash2, FiLayers,
  FiUsers, FiDollarSign, FiEdit2, FiCheck, FiX,
  FiPackage,
} from 'react-icons/fi';
import BusinessForm from '../../components/layout/BusinessForm';
import {
  GetReservationItem,
  StoreReservationItem,
  UpdateReservationItem,
  DeleteReservationItem,
} from '../../services/reservation/reservation';

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_ITEM = { name: '', capacity: '', price: '' };

// ── Inline Item Editor ────────────────────────────────────────────────────────
const ItemRow = ({ item, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ name: item.name, capacity: item.capacity, price: item.price ?? '' });
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!draft.name || !draft.capacity) return;
    setSaving(true);
    const res = await onUpdate(item.id, draft);
    if (res) setEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setDraft({ name: item.name, capacity: item.capacity, price: item.price ?? '' });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-4 bg-zinc-950 border border-amber-500/20 rounded-2xl space-y-3">
        <input
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition-colors"
          placeholder="Item name"
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <FiUsers size={11} className="absolute left-3 top-3 text-zinc-600" />
            <input
              type="number"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition-colors"
              placeholder="Capacity"
              value={draft.capacity}
              onChange={e => setDraft(d => ({ ...d, capacity: e.target.value }))}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-600 text-[10px] font-bold">MAD</span>
            <input
              type="number"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition-colors"
              placeholder="Price"
              value={draft.price}
              onChange={e => setDraft(d => ({ ...d, price: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !draft.name || !draft.capacity}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiCheck size={12} /> Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black uppercase hover:text-white transition-all"
          >
            <FiX size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all">
      <div className="min-w-0">
        <p className="text-xs font-bold text-white truncate leading-none mb-0.5">{item.name}</p>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
          {item.capacity} seats
          {item.price ? ` · ${item.price} MAD` : ' · Free'}
        </p>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-zinc-600 hover:text-amber-400 transition-colors"
          title="Edit"
        >
          <FiEdit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
          title="Remove"
        >
          <FiTrash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const BusinessEdit = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [business, setBusiness] = useState(null);
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newItem, setNewItem]   = useState(EMPTY_ITEM);
  const [adding, setAdding]     = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res  = await fetch(`http://127.0.0.1:8000/api/businesses/${id}`);
        const json = await res.json();
        setBusiness(json.data);

        const itemData = await GetReservationItem(id);
        console.log("itemData", itemData);
        setItems(itemData ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.capacity) return;
    setAdding(true);
    const res = await StoreReservationItem(newItem, id);
    if (res) {
      setItems(prev => [...prev, res.data]);
      setNewItem(EMPTY_ITEM);
      setShowAddForm(false);
    }
    setAdding(false);
  };

  const handleUpdateItem = async (itemId, data) => {
    if (!UpdateReservationItem) return null; // graceful if not yet implemented
    const res = await UpdateReservationItem(itemId, data);
    if (res) {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...data } : i));
    }
    return res;
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Remove this item?')) return;
    await DeleteReservationItem(itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">

      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-amber-500/[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-widest"
        >
          <FiArrowLeft size={13} /> Back to Dashboard
        </button>

        {/* Business name breadcrumb */}
        {business && (
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
                {business.name}
              </h1>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
                {business.type} · {business.location}
              </p>
            </div>
          </div>
        )}

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Left: Business Profile Form ── */}
          <div className="lg:col-span-3">
            <div className="mb-5 flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Business Profile</p>
            </div>
            <BusinessForm initialData={business} onSuccess={() => navigate('/business/Manage')} />
          </div>

          {/* ── Right: Reservable Items ── */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sticky top-6">

              {/* Panel header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FiLayers size={14} className="text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-tight">Reservable Items</h3>
                  {items.length > 0 && (
                    <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-lg border border-zinc-700">
                      {items.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowAddForm(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    showAddForm
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {showAddForm ? <FiX size={11} /> : <FiPlus size={11} />}
                  {showAddForm ? 'Close' : 'Add'}
                </button>
              </div>

              {/* Add form (togglable) */}
              {showAddForm && (
                <form onSubmit={handleAddItem} className="space-y-2.5 mb-5 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <input
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-700"
                    placeholder="Item name (e.g. VIP Table 1)"
                    value={newItem.name}
                    onChange={e => setNewItem(d => ({ ...d, name: e.target.value }))}
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <FiUsers size={11} className="absolute left-3 top-3 text-zinc-600" />
                      <input
                        type="number"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-700"
                        placeholder="Capacity"
                        value={newItem.capacity}
                        onChange={e => setNewItem(d => ({ ...d, capacity: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-zinc-600 text-[10px] font-black">MAD</span>
                      <input
                        type="number"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-700"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={e => setNewItem(d => ({ ...d, price: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={adding || !newItem.name || !newItem.capacity}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    {adding ? 'Adding...' : 'Add Item'}
                  </button>
                </form>
              )}

              {/* Items list */}
              {items.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
                  <FiPackage size={22} className="mx-auto mb-2 text-zinc-700" />
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No items yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 text-amber-500/60 text-[10px] font-bold hover:text-amber-400 transition-colors"
                  >
                    Add your first item
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onDelete={handleDeleteItem}
                      onUpdate={handleUpdateItem}
                    />
                  ))}
                </div>
              )}

              {/* Hint */}
              {items.length > 0 && (
                <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-wider text-center mt-4">
                  Hover an item to edit or remove it
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BusinessEdit;