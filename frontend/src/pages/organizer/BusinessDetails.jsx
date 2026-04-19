import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiMapPin, FiClock, FiArrowLeft, FiImage, 
    FiChevronRight, FiUsers, FiCheck, FiInfo 
} from 'react-icons/fi';
import BusinessReservationModal from '../../components/layout/ReservationModal';
import { GetReservationItem } from '../../services/reservation/reservation';

const BusinessDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reservationItem, setReservationItem] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchReservationItem = async(id) => {
            const items = await GetReservationItem(id);
            setReservationItem(items || []);
        }

        fetchReservationItem(id);
        fetchBusiness();
    }, [id]);
    
    
    const fetchBusiness = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/businesses/${id}`);
            const json = await res.json();
            setBusiness(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReserveClick = () => {
        if (!selectedItem && reservationItem.length > 0) {
            alert("Please select a table or space first.");
            return;
        }
        setIsModalOpen(true);
    };
    
    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-t-2 border-amber-500 rounded-full animate-spin" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Loading Details</p>
            </div>
        </div>
    );

    if (!business) return <div className="min-h-screen bg-zinc-950 text-zinc-500 flex items-center justify-center font-bold">Business Not Found</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/60 px-6 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 border border-zinc-800 rounded-full hover:text-amber-500 hover:border-amber-500 transition-all">
                    <FiArrowLeft size={16} />
                </button>
                <span className="text-sm font-bold tracking-tight">{business.name}</span>
            </header>

            <div className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
                {/* Hero Image */}
                <section className="h-[400px] w-full rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl relative">
                    {business.image ? (
                        <img src={business.image} className="w-full h-full object-cover" alt={business.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800"><FiImage size={48} /></div>
                    )}
                    <div className="absolute bottom-6 left-6">
                        <span className="px-4 py-1.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                            {business.type}
                        </span>
                    </div>
                </section>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Info & Items */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Business Info */}
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black text-white tracking-tighter">{business.name}</h1>
                            <div className="flex flex-wrap gap-6 text-zinc-400 text-sm">
                                <span className="flex items-center gap-2"><FiMapPin className="text-amber-500" /> {business.location}</span>
                                <span className="flex items-center gap-2"><FiClock className="text-amber-500" /> {business.opening_hours || 'Contact for hours'}</span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed italic text-sm border-l-2 border-amber-500/30 pl-4">{business.description}</p>
                        </div>

                        {/* Reservable Items Selection */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                                <FiInfo className="text-amber-500" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Available Options</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {reservationItem.map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                                            selectedItem?.id === item.id 
                                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5' 
                                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-white uppercase text-xs tracking-widest group-hover:text-amber-500 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2 text-zinc-500 text-[10px] font-bold uppercase">
                                                    <FiUsers size={12} className="text-zinc-600" />
                                                    <span>{item.capacity} Persons</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-amber-500 font-black text-lg leading-none">
                                                    {parseFloat(item.price).toFixed(0)}
                                                </span>
                                                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">MAD / Session</span>
                                            </div>
                                        </div>

                                        {selectedItem?.id === item.id && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-black">
                                                <FiCheck size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sticky Booking Card */}
                    <div className="space-y-6">
                        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6 shadow-xl sticky top-28">
                            <div>
                                <h4 className="text-white font-bold mb-1 text-sm uppercase tracking-wider">Book Experience</h4>
                                <p className="text-[11px] text-zinc-500 leading-relaxed">
                                    {selectedItem 
                                        ? `You've selected the ${selectedItem.name}. Ready to confirm?`
                                        : "Select a space from the list to begin your reservation."
                                    }
                                </p>
                            </div>
                            
                            <button 
                                onClick={handleReserveClick}
                                className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest ${
                                    selectedItem 
                                    ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20' 
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                }`}
                            >
                                {selectedItem ? 'Confirm Selection' : 'Select a Space'}
                                <FiChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <BusinessReservationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                businessId={id}
                selectedItem={selectedItem} // Pass the selected object to the modal
            />
        </div>
    );
};

export default BusinessDetails;