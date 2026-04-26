import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import {
  FiActivity,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';
import Paiment from '../../components/layout/paiment/Paiment';
import { GetMyReservations } from '../../services/reservation/reservation';

const statusColors = {
  pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  confirmed: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  paid: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processingBookingId, setProcessingBookingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingsRes, incomingBookingsRes, reservationsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://127.0.0.1:8000/api/bookings?type=incoming', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        GetMyReservations(),
      ]);

      if (!bookingsRes.ok || !incomingBookingsRes.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookingsData = await bookingsRes.json();
      const incomingBookingsData = await incomingBookingsRes.json();

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setIncomingBookings(Array.isArray(incomingBookingsData) ? incomingBookingsData : []);
      setReservations(reservationsRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePaymentClick = (type, item) => {
    setSelectedPayment({ type, item });
  };

  const handlePaymentSuccess = () => {
    setSelectedPayment(null);
    fetchData();
  };

  const handleIncomingBookingAction = async (bookingId, action) => {
    if (processingBookingId) {
      return;
    }

    setProcessingBookingId(bookingId);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || `Failed to ${action} booking`);
      }

      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const activeItems = activeTab === 'bookings'
    ? bookings
    : activeTab === 'incoming'
      ? incomingBookings
      : reservations;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
            My <span className="text-orange-500">Plans</span>
          </h1>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">
            Manage your activity bookings, business reservations, and payments
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'bookings'
                ? 'bg-orange-500 text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Activity Bookings ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('incoming')}
            className={`rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'incoming'
                ? 'bg-orange-500 text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Incoming Bookings ({incomingBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'reservations'
                ? 'bg-orange-500 text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Business Reservations ({reservations.length})
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-center">
            {error}
          </div>
        ) : activeItems.length === 0 ? (
          <div className="py-20 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px]">
            {activeTab === 'bookings'
              ? <FiCalendar className="mx-auto mb-4 text-white/10" size={48} />
              : activeTab === 'incoming'
                ? <FiUsers className="mx-auto mb-4 text-white/10" size={48} />
              : <FiBriefcase className="mx-auto mb-4 text-white/10" size={48} />
            }
            <p className="text-white/20 font-bold uppercase tracking-widest">
              {activeTab === 'bookings'
                ? "You haven't booked any activities yet."
                : activeTab === 'incoming'
                  ? "No one has booked your activities yet."
                : "You haven't reserved any business spaces yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTab === 'bookings'
              ? bookings.map((booking) => (
                  <BookingItem
                    key={booking.id}
                    booking={booking}
                    onPay={() => handlePaymentClick('booking', booking)}
                  />
                ))
              : activeTab === 'incoming'
                ? incomingBookings.map((booking) => (
                    <IncomingBookingItem
                      key={booking.id}
                      booking={booking}
                      isProcessing={processingBookingId === booking.id}
                      onConfirm={() => handleIncomingBookingAction(booking.id, 'confirm')}
                      onCancel={() => handleIncomingBookingAction(booking.id, 'cancel')}
                    />
                  ))
              : reservations.map((reservation) => (
                  <ReservationItem
                    key={reservation.id}
                    reservation={reservation}
                    onPay={() => handlePaymentClick('reservation', reservation)}
                  />
                ))}
          </div>
        )}
      </main>

      {selectedPayment?.item && (
        <Paiment
          isOpen={Boolean(selectedPayment?.item)}
          recordType={selectedPayment.type}
          preConfirmedBooking={selectedPayment.item}
          onClose={() => setSelectedPayment(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

const IncomingBookingItem = ({ booking, isProcessing, onConfirm, onCancel }) => {
  return (
    <div className="group bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-full md:w-40 h-28 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center border border-white/5">
          <FiUsers size={32} className="text-orange-500/40" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              {booking.activity?.category || 'Incoming Booking'}
            </span>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColors[booking.status] || statusColors.pending}`}>
              {booking.status}
            </span>
          </div>

          <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-orange-500 transition-colors">
            {booking.activity?.title}
          </h3>

          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><FiUsers /> {booking.user?.name || 'Guest'}</span>
            <span className="flex items-center gap-1.5"><FiCalendar /> {new Date(booking.booking_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><FiUsers /> {booking.number_of_guests} Guests</span>
            <span className="flex items-center gap-1.5"><FiCreditCard /> {booking.amount} MAD</span>
          </div>
        </div>

        <div className="md:border-l border-white/5 md:pl-8 flex items-center">
          <div className="flex flex-wrap gap-3">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <FiCheckCircle /> {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-xs font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <FiXCircle /> Cancel
                </button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-xs font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <FiXCircle /> Cancel Booking
              </button>
            )}

            {booking.status === 'cancelled' && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                <FiXCircle /> Booking Cancelled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingItem = ({ booking, onPay }) => {
  const currentStatus = booking.payment_status === 'paid' ? 'paid' : booking.status;

  return (
    <div className="group bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-full md:w-40 h-28 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl flex items-center justify-center border border-white/5">
          <FiActivity size={32} className="text-orange-500/40" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              {booking.activity?.category || 'Activity'}
            </span>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColors[currentStatus]}`}>
              {currentStatus}
            </span>
          </div>

          <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-orange-500 transition-colors">
            {booking.activity?.title}
          </h3>

          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><FiCalendar /> {new Date(booking.booking_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><FiUsers /> {booking.number_of_guests} Guests</span>
            <span className="flex items-center gap-1.5"><FiCreditCard /> {booking.amount} MAD</span>
          </div>
        </div>

        <div className="md:border-l border-white/5 md:pl-8 flex items-center">
          {booking.status === 'confirmed' && booking.payment_status === 'unpaid' && (
            <button
              onClick={onPay}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-orange-400 active:scale-95 transition-all"
            >
              <FiCreditCard /> Pay Now <FiArrowRight />
            </button>
          )}
          {booking.payment_status === 'paid' && (
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <FiCheckCircle /> Payment Completed
            </div>
          )}
          {booking.status === 'pending' && (
            <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
              <FiClock /> Waiting for confirmation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReservationItem = ({ reservation, onPay }) => {
  const currentStatus = reservation.payment_status === 'paid' ? 'paid' : reservation.status;
  const reservableItem = reservation.reservable_item ?? reservation.reservableItem;
  const business = reservableItem?.business;

  return (
    <div className="group bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-full md:w-40 h-28 bg-gradient-to-br from-sky-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center border border-white/5">
          <FiBriefcase size={32} className="text-sky-300/40" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest">
              {business?.name || 'Business Reservation'}
            </span>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColors[currentStatus]}`}>
              {currentStatus}
            </span>
          </div>

          <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-orange-500 transition-colors">
            {reservableItem?.name || 'Reserved Space'}
          </h3>

          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><FiCalendar /> {new Date(reservation.start_time).toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><FiClock /> Until {new Date(reservation.end_time).toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><FiMapPin /> {business?.location || 'Business location'}</span>
            <span className="flex items-center gap-1.5"><FiCreditCard /> {Number(reservation.amount || 0).toFixed(2)} MAD</span>
          </div>
        </div>

        <div className="md:border-l border-white/5 md:pl-8 flex items-center">
          {reservation.status === 'confirmed' && reservation.payment_status === 'unpaid' && Number(reservation.amount || 0) > 0 && (
            <button
              onClick={onPay}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-orange-400 active:scale-95 transition-all"
            >
              <FiCreditCard /> Pay Now <FiArrowRight />
            </button>
          )}
          {reservation.payment_status === 'paid' && (
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <FiCheckCircle /> Reservation Confirmed
            </div>
          )}
          {reservation.status === 'pending' && (
            <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
              <FiClock /> Waiting for approval
            </div>
          )}
          {reservation.status === 'cancelled' && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
              <FiXCircle /> Reservation cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
