import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
import ActivityCard from './ActivityCard';
import CheckoutForm from './CheckoutForm';
import { loadStripe } from '@stripe/stripe-js';

// Get this from: https://dashboard.stripe.com/test/apikeys
const stripePromise = loadStripe('pk_test_51SzwOVGdDU7xpwkZg9ZX5XxV0eorcO2gih2cmmjePTuhQYeX8jg6Sn0WPpm5SVp4ZIoPLO4qwb8ABjgBrNI8Q2Op009lAhdX4A');

// const stripePromise = loadStripe('pk_test_your_public_key_here');

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/activities')
            .then(res => {
            // Access the .data property inside the paginated response
            setActivities(res.data.data); 
            })
            .catch(err => console.error("Could not fetch activities", err));
    }, []);
    console.log(activities);
    
  const startBooking = async (activity) => {
    console.log(localStorage.getItem('token'));
    try {
      // 1. Create the booking record in Laravel
      const bookingRes = await axios.post('http://127.0.0.1:8000/api/bookings', { activity_id: activity.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // 2. Get Payment Intent secret
      const intentRes = await axios.post(`http://127.0.0.1:8000/api/bookings/${bookingRes.data.id}/payment-intent`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setClientSecret(intentRes.data.client_secret);
      setSelectedBooking(activity);
    } catch (err) {
      console.error("Booking failed", err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Activities</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Add a check to ensure activities is an array before mapping */}
      {Array.isArray(activities) && activities.map(act => (
        <ActivityCard key={act.id} activity={act} onBook={startBooking} />
      ))}
      
      {activities.length === 0 && <p>No activities found.</p>}
    </div>

      {/* Payment Modal */}
      {selectedBooking && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Complete Booking</h2>
            <p className="mb-4 text-gray-600">Paying for: <strong>{selectedBooking.title}</strong></p>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>

            <button 
              onClick={() => setSelectedBooking(null)} 
              className="mt-4 text-gray-400 hover:text-gray-600 text-sm w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;