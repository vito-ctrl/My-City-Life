import React, { useEffect, useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5"; 
import { AiOutlineLike } from "react-icons/ai";

import { API_BASE_URL } from '../../utils/auth';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800";

const getImageUrl = (item) => {
  if (Array.isArray(item.image_urls) && item.image_urls.length > 0) {
    return item.image_urls[0];
  }

  if (typeof item.image === 'string') {
    const trimmedImage = item.image.trim();

    if (trimmedImage.startsWith('http://') || trimmedImage.startsWith('https://')) {
      return trimmedImage;
    }

    try {
      const parsedImages = JSON.parse(trimmedImage);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        const firstImage = parsedImages[0];
        if (typeof firstImage === 'string' && firstImage.length > 0) {
          if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
            return firstImage;
          }

          const normalizedImage = firstImage.replace(/^\/?storage\//, '');
          return `${API_BASE_URL}/storage/${normalizedImage}`;
        }
      }
    } catch (error) {
      if (trimmedImage.length > 0) {
        const normalizedImage = trimmedImage.replace(/^\/?storage\//, '');
        return `${API_BASE_URL}/storage/${normalizedImage}`;
      }
    }
  }

  return FALLBACK_IMAGE;
};

const ActivityCard = ({ item, type , onClick, onFavoriteChange }) => {
  const [liked, setLiked] = useState(Boolean(item.liked));
  const [favorited, setFavorited] = useState(Boolean(item.favorited));


  const title = item.title || item.name;
  const description = item.description || item.type;
  const image = getImageUrl(item);
  
  const isFree = item.is_free === 1 || item.is_free === true;
  const badgeText = type === 'activities'
    ? (isFree ? 'FREE' : item.price ? `${item.price} MAD` : 'PAID')
    : (item.type || 'Business');
  const badgeColor = type === 'activities'
    ? (isFree ? 'bg-green-500/90' : 'bg-orange-500/90')
    : 'bg-sky-500/90';

  const token = localStorage.getItem('token');
  // console.log("token", token);

  useEffect(() => {
    setLiked(Boolean(item.liked));
    setFavorited(Boolean(item.favorited));
  }, [item.id, item.liked, item.favorited]);

  // Function to handle favorite click
  const handleFavorite = async(e) => {
    e.stopPropagation();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/favorite/${type}/${item.id}`, {
        method: 'POST',
        headers: {
          'Authorization' : `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      const data = await response.json();
      setFavorited(Boolean(data.favorite));
      onFavoriteChange?.(Boolean(data.favorite), item);
    } catch (err) {
      console.error("favorite error : ", err);
    }

  };

  const handleLike = async(e) => {
    e.stopPropagation();
    if (!token) return;

    try{
      const response = await fetch(`${API_BASE_URL}/api/like/${type}/${item.id}`, {
        method: 'POST',
        headers: {
          'Authorization' : `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();
      setLiked(Boolean(data.liked));
    }catch(err){
      console.error("like error : ", err);
    }
  } 

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
            <span>{item.location || item.city || 'City Center'}</span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">{title}</h3>
          <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{description}</p>
        </div>
        {token ? 
        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">View Details</span>
          <div className='flex gap-3'>
            {/* Favorite Button */}
            <button 
              onClick={handleFavorite}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                favorited 
                ? 'bg-orange-500 text-white' 
                : 'bg-white/5 text-orange-500 hover:bg-white/10'
              }`}
            >
              {favorited ? <IoHeartSharp size={20} /> : <IoHeartOutline size={20} />}
            </button>

            <button 
              onClick={handleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                liked 
                ? 'bg-orange-500 text-white' 
                : 'bg-white/5 text-orange-500 hover:bg-white/10'
              }`}
            >
              {liked ? <AiOutlineLike size={20} /> : <AiOutlineLike size={20} />}
            </button>
          </div>
        </div>
        : 
        null }
      </div>
    </div>
  );
};

export default ActivityCard;
