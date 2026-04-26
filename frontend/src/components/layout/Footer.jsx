import { Link } from 'react-router-dom';
import ActivityIcon from '../ui/ActivityIcon';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ActivityIcon/>

              <div>
                <p className="text-lg font-black uppercase tracking-tight">
                  MYCITY<span className="text-orange-500">LIFE</span>
                </p>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                  Local moments
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/60">
              Discover activities, support local businesses, and make city life
              feel more connected.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-white">
              Explore
            </h3>

            <div className="space-y-3 text-sm text-white/60">
              <Link to="/" className="block transition hover:text-orange-500">
                Home
              </Link>
              <Link to="/favorites" className="block transition hover:text-orange-500">
                Favorites
              </Link>
              <Link to="/bookings" className="block transition hover:text-orange-500">
                My Bookings
              </Link>
              <Link to="/activity/manage" className="block transition hover:text-orange-500">
                My Activities
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-white">
              For Organizers
            </h3>

            <div className="space-y-3 text-sm text-white/60">
              <Link
                to="/organizer/dashboard"
                className="block transition hover:text-orange-500"
              >
                Organizer Dashboard
              </Link>
              <Link
                to="/business/manage"
                className="block transition hover:text-orange-500"
              >
                Manage Businesses
              </Link>
              <Link
                to="/organizer/bookings"
                className="block transition hover:text-orange-500"
              >
                Organizer Bookings
              </Link>
              <Link to="/profile" className="block transition hover:text-orange-500">
                Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} MyCityLife. Built for people who want more from their city.</p>
          <p className="uppercase tracking-[0.25em] text-white/30">Simple. Local. Human.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
