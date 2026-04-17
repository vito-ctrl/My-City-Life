import React from 'react';
// import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0f1a] text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              MyCity<span className="text-blue-500">Life</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Discover the best activities, local businesses, and events in your city. 
              Your all-in-one platform for urban exploration and booking.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-blue-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links - Activities & Businesses */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Explore</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="/activities" className="hover:text-white transition-colors">All Activities</a></li>
              <li><a href="/businesses" className="hover:text-white transition-colors">Local Businesses</a></li>
              <li><a href="/favorites" className="hover:text-white transition-colors">My Favorites</a></li>
              <li><a href="/bookings" className="hover:text-white transition-colors">My Bookings</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0" />
                <span>123 City Center Way,<br />Marrakesh, Morocco</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>+212 5XX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span>hello@mycitylife.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to get notified about new events.</p>
            <form className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-all">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} My-City-Life Project. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;