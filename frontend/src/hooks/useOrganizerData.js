import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api';

/**
 * useOrganizerData
 *
 * A custom hook that fetches all data the Organizer dashboard needs.
 * By putting the fetch logic here, both OrganizerDashboard and
 * OrganizerBookings can use it without copy-pasting the same code.
 *
 * Returns:
 *   - stats:          { total_activities, total_bookings, total_revenue }
 *   - recentBookings: The 5 most recent bookings (for the dashboard overview)
 *   - allBookings:    Every incoming booking (for the full bookings page)
 *   - loading:        true while the data is being fetched
 *   - error:          an error message string, or null if everything is fine
 *   - refetch:        a function you can call to reload the data (e.g. after confirming a booking)
 */
const useOrganizerData = () => {
  const [stats, setStats]               = useState({ total_activities: 0, total_bookings: 0, total_revenue: 0 });
  const [recentBookings, setRecent]     = useState([]);
  const [allBookings, setAllBookings]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      // Run both requests at the same time so the page loads faster
      const [dashRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE}/organizer/dashboard`, { headers }),
        fetch(`${API_BASE}/organizer/bookings`,  { headers }),
      ]);

      if (!dashRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to load organizer data. Please try again.');
      }

      const dashData     = await dashRes.json();
      const bookingsData = await bookingsRes.json();

      setStats(dashData.stats);
      setRecent(dashData.recent_bookings);
      setAllBookings(bookingsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch data when the hook is first used
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, recentBookings, allBookings, loading, error, refetch: fetchData };
};

export default useOrganizerData;
