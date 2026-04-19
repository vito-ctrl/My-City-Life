import React, {useEffect, useState} from 'react'
import { GetReservations, StoreReservationItem } from '../../services/reservation/reservation'

const BusinessManager = () => {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    price: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      capacity: Number(formData.capacity),
      price: Number(formData.price)
    };

    const res = await StoreReservationItem(data, 2);
    console.log(res);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      
      <input
        type="text"
        name="name"
        placeholder="Name (e.g. vip)"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="number"
        name="capacity"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded"
      >
        Submit
      </button>

    </form>
  );
}

export default BusinessManager