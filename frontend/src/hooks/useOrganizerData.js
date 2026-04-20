import { useState, useEffect, useCallback } from 'react';
import { GeneralStatistics } from '../services/statistic/general'; 

const useOrganizerData = () => {
  const API_BASE = 'http://127.0.0.1:8000/api';
  
  const [stats, setStats] = useState({ 
    total_activities: 0, 
    total_bookings: 0, 
    total_revenue: 0, 
    total_businesses: 0 
  });

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token'); // Get fresh token on every fetch
    if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      // Parallel fetch: Stats and Bookings
      const [statsData, bookingsRes] = await Promise.all([
        GeneralStatistics(), 
        fetch(`${API_BASE}/organizer/bookings`, { headers }),
      ]);

      if (!bookingsRes.ok) {
        throw new Error('Failed to load bookings.');
      }

      const bookingsData = await bookingsRes.json();

      setStats(statsData || {});
      
      // Sort by newest first
      const sorted = [...bookingsData].sort((a, b) => 
        new Date(b.created_at || b.booking_date) - new Date(a.created_at || a.booking_date)
      );
      
      setAllBookings(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // token removed from deps to prevent infinite loops, handled inside

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    stats, 
    allBookings, 
    recentBookings: allBookings.slice(0, 5),
    loading, 
    error, 
    refetch: fetchData 
  };
};

export default useOrganizerData;