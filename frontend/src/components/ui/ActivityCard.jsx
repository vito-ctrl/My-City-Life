import React, { useEffect, useState } from 'react';
import { FiMapPin, FiArrowRight, FiHeart } from 'react-icons/fi';
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5"; 
import { AiOutlineLike } from "react-icons/ai";
import { getActivityLikes } from '../../services/like'
import { getActivityFavorites } from '../../services/favorits'


const ActivityCard = ({ item, type = 'activity', onClick }) => {
  // let like;
  // console.log("like : ", like);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const [Favorites, setFavorites] = useState(0);
  const [favorited, setFavorited] = useState(false);


  const title = item.title || item.name;
  const description = item.description || item.type;
  const image = item.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800";
  
  const isFree = item.is_free === 1 || item.is_free === true;
  const badgeText = type === 'activity' ? (isFree ? 'FREE' : `${item.price} MAD`) : 'BUSINESS';
  const badgeColor = isFree ? 'bg-green-500/90' : 'bg-orange-500/90';

  const token = localStorage.getItem('token');
  // console.log("token", token);

  useEffect(() => {
    try{
      const fetchLikes = async () => {
        const data = await getActivityLikes(item.id);
        setLiked(data.liked);
      }

      const fetchFavorites = async () => {
        const data = await getActivityFavorites(item.id);
        setFavorited(data.favorited);
      }

      fetchLikes();
      fetchFavorites();
    } catch ( err ) {
      console.log("error in fetching likes : ", err );
    }
  }, [item.id]);

  // Function to handle favorite click
  const handleFavorite = async(e) => {
    e.stopPropagation();
    
    await fetch(`http://127.0.0.1:8000/api/favorite/activities/${item.id}`, {
      method: 'POST',
      headers: {
        'Authorization' : `Bearer ${token}`,
      }
    })
    setFavorited(!favorited);

  };

  const handleLike = async(e) => {
    e.stopPropagation();

    // console.log("hi", item);
    try{
      const res = await fetch(`http://127.0.0.1:8000/api/like/activities/${item.id}`, {
        method: 'POST',
        headers: {
          'Authorization' : `Bearer ${token}`,
        }
      });
      setLiked(!liked);
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
            <span>{item.location || 'City Center'}</span>
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
        "none" }
      </div>
    </div>
  );
};

export default ActivityCard;