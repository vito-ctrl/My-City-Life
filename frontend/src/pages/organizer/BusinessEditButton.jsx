import React from 'react';
import { FiEdit3 } from 'react-icons/fi';

const BusinessEditButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2.5 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-xl hover:text-white hover:border-zinc-600 transition-all"
      aria-label="Edit business"
      title="Edit business"
    >
      <FiEdit3 size={14} />
    </button>
  );
};

export default BusinessEditButton;
