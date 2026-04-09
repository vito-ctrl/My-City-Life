import React from 'react';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';

const ActivityCard = ({ item, type = 'activity', onClick }) => {
  // Determine display properties based on the data structure from Laravel
  const title = item.title || item.name;
  const description = item.description || item.type;
  const image = item.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800";
  
  const isFree = item.is_free === 1 || item.is_free === true;
  const badgeText = type === 'activity' ? (isFree ? 'FREE' : `${item.price} MAD`) : 'BUSINESS';
  const badgeColor = isFree ? 'bg-green-500/90' : 'bg-orange-500/90';

  return (
    <div 
      onClick={onClick}
      className="group bg-white/5 border border-white/5 rounded-[32px] overflow-hidden hover:-translate-y-2 hover:border-white/10 transition-all duration-300 cursor-pointer"
    >
      <div className="h-[280px] relative overflow-hidden">
        <span className={`absolute top-5 right-5 z-20 ${badgeColor} text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md shadow-lg`}>
          {badgeText}
        </span>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
      </div>
      
      <div className="p-8 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black tracking-widest uppercase">
            <FiMapPin />
            <span>{item.location || 'City Center'}</span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">{title}</h3>
          <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{description}</p>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">View Details</span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500 transition-all">
            <FiArrowRight className="text-white group-hover:scale-110" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;