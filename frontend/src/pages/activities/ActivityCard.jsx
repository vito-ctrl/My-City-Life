import React from 'react';

const ActivityCard = ({ activity, onBook }) => {
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500";
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      <img 
        src={activity.image_url || fallbackImage} 
        alt={activity.title}
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.src = fallbackImage; }} // If URL fails, use fallback
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{activity.title}</h3>
        <p className="text-gray-500 text-sm mb-4">{activity.category}</p>
        <button 
          onClick={() => onBook(activity)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Book for {activity.price} MAD
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;