import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const BusinessDeleteButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:border-transparent transition-all"
      aria-label="Delete business"
      title="Delete business"
    >
      <FiTrash2 size={14} />
    </button>
  );
};

export default BusinessDeleteButton;
