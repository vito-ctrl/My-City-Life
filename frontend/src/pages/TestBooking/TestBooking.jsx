import React, { useState, useEffect } from 'react';

const TestBooking = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [responseLog, setResponseLog] = useState('');
  const [paymentIntentKey, setPaymentIntentKey] = useState('');

  // Fetch activities on load
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/activities');
      const data = await res.json();
      setActivities(data.data || data); // handle pagination wrapper if it exists
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleBook = async () => {
    setResponseLog('Processing booking...');
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setResponseLog('Error: No token found. Please login first!');
        return;
      }

      const res = await fetch('http://127.0.0.1:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_id: selectedActivity,
          booking_date: bookingDate,
          number_of_guests: guests
        })
      });

      const data = await res.json();
      setResponseLog(JSON.stringify(data, null, 2));

      // If it created successfully and is unpaid, we might want to get payment intent
      if (res.ok && data.payment_status === 'unpaid') {
          handlePaymentIntent(data.id, token);
      }
    } catch (error) {
      setResponseLog(`Error: ${error.message}`);
    }
  };

  const handlePaymentIntent = async (bookingId, token) => {
      try {
        setResponseLog(prev => prev + '\n\nFetching Stripe Payment Intent...');
        const res = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/payment-intent`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        setResponseLog(prev => prev + '\n\nPayment Intent Response:\n' + JSON.stringify(data, null, 2));
        if (data.client_secret) {
            setPaymentIntentKey(data.client_secret);
        }
      } catch (error) {
        setResponseLog(prev => prev + `\n\nError fetching intent: ${error.message}`);
      }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Test Booking System</h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
        <h2 className="text-xl mb-4 font-semibold text-emerald-400">Step 1: Activity Selection</h2>
        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-300">Select an Activity:</label>
          <select 
            className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-emerald-500 focus:outline-none"
            value={selectedActivity || ''}
            onChange={(e) => setSelectedActivity(e.target.value)}
          >
            <option value="">-- Choose Activity --</option>
            {Array.isArray(activities) && activities.map(act => (
              <option key={act.id} value={act.id}>
                {act.title} - {act.is_free ? 'FREE' : `${act.price} MAD`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm text-gray-300">Booking Date:</label>
            <input 
              type="datetime-local" 
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm text-gray-300">Guests:</label>
            <input 
              type="number" 
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              min="1"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleBook}
        disabled={!selectedActivity || !bookingDate}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded mb-8 transition-colors"
      >
        Submit Booking
      </button>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl mb-4 font-semibold text-blue-400">Step 2: Server Response (JSON)</h2>
        <pre className="bg-gray-950 p-4 rounded text-sm text-green-400 overflow-x-auto min-h-[100px] border border-gray-700">
          {responseLog || 'Waiting for submission...'}
        </pre>

        {paymentIntentKey && (
            <div className="mt-4 p-4 bg-indigo-900 border border-indigo-700 rounded">
                <h3 className="font-bold text-indigo-300 mb-2">💳 Stripe Intent Captured!</h3>
                <p className="text-sm text-indigo-200">Client Secret: {paymentIntentKey}</p>
                <p className="text-xs text-indigo-400 mt-2">Ready to be passed into Stripe's {"<Elements />"} provider.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default TestBooking;
