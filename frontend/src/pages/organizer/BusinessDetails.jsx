import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiClock, FiArrowLeft, FiImage, FiChevronRight, FiTag } from 'react-icons/fi';
// import BusinessReservationModal from './BusinessReservationModal';

const BusinessDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
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
        fetchBusiness();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500 uppercase tracking-widest text-xs">Loading...</div>;
    if (!business) return <div className="min-h-screen bg-zinc-950 text-zinc-500 flex items-center justify-center">Business Not Found</div>;

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
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter mb-4">{business.name}</h1>
                            <div className="flex flex-wrap gap-6 text-zinc-400 text-sm">
                                <span className="flex items-center gap-2"><FiMapPin className="text-amber-500" /> {business.location}</span>
                                <span className="flex items-center gap-2"><FiClock className="text-amber-500" /> {business.opening_hours || 'Contact for hours'}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</h3>
                            <p className="text-zinc-300 leading-relaxed italic">{business.description}</p>
                        </div>
                    </div>

                    {/* Right Column: CTA */}
                    <div className="space-y-6">
                        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6 shadow-xl sticky top-28">
                            <div>
                                <h4 className="text-white font-bold mb-1">Book Your Experience</h4>
                                <p className="text-xs text-zinc-500">Reserve a table or private space instantly.</p>
                            </div>
                            
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-white hover:bg-amber-500 text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-tighter"
                            >
                                Reserve Now <FiChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <BusinessReservationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                businessId={id}
                reservableItems={business.reservable_items} // Ensure your API includes this relation
            />
        </div>
    );
};

export default BusinessDetails;