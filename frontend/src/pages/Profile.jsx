import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiMail, FiUser, FiHeart, FiArrowLeft,
  FiBriefcase, FiActivity, FiDollarSign, FiBookmark, FiCheckCircle
} from 'react-icons/fi';

import Header from '../components/layout/Header';
import { fetchAllFavorites } from '../services/favorites';
import { fetchCurrentProfile } from '../services/profile';
import { GeneralStatistics } from '../services/statistic/general';

const EMPTY_FAVORITES = { activities: [], businesses: [] };

const parseInterests = (details) => {
  if (!details || Array.isArray(details)) {
    return [];
  }

  if (Array.isArray(details.interests)) {
    return details.interests.filter(Boolean);
  }

  if (typeof details.interests !== 'string' || !details.interests.trim()) {
    return [];
  }

  try {
    const parsedInterests = JSON.parse(details.interests);
    return Array.isArray(parsedInterests) ? parsedInterests.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const getAgeFromDate = (dateOfBirth) => {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return age;
};

const Profile = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState(EMPTY_FAVORITES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const [profileResult, statsResult, favoritesResult] = await Promise.allSettled([
          fetchCurrentProfile(),
          GeneralStatistics(),
          fetchAllFavorites(),
        ]);

        if (profileResult.status !== 'fulfilled' || !profileResult.value?.user) {
          throw new Error('Unable to load profile data.');
        }

        if (ignore) {
          return;
        }

        setUserData(profileResult.value.user);
        setProfileDetails(profileResult.value.details);
        setStats(statsResult.status === 'fulfilled' ? statsResult.value : null);
        setFavorites(favoritesResult.status === 'fulfilled' ? favoritesResult.value : EMPTY_FAVORITES);
        setError('');
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!ignore) {
          setError('We could not load your profile right now.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-orange-500 font-black animate-pulse tracking-[4px] uppercase text-xs">
          Loading Intelligence...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center uppercase font-black">
          {error || 'Profile Not Found'}
        </div>
      </div>
    );
  }

  const isOrganizer = userData.role?.toLowerCase() === 'organizer';
  const profileImage = userData.image
    ? userData.image
    : `https://ui-avatars.com/api/?name=${userData.name}&background=f97316&color=fff`;
  const age = getAgeFromDate(userData.date_of_birth);
  const interests = parseInterests(profileDetails);
  const businesses = Array.isArray(profileDetails) ? profileDetails : [];

  const statCards = isOrganizer
    ? [
        {
          label: 'Activities',
          value: stats?.activities?.total ?? 0,
          icon: FiActivity,
        },
        {
          label: 'Businesses',
          value: stats?.businesses?.total ?? businesses.length,
          icon: FiBriefcase,
        },
        {
          label: 'Bookings',
          value: stats?.bookings?.total ?? 0,
          icon: FiCheckCircle,
        },
        {
          label: 'Revenue',
          value: `${stats?.revenue?.total_paid_mad ?? '0.00'} MAD`,
          icon: FiDollarSign,
        },
      ]
    : [
        {
          label: 'Saved Activities',
          value: favorites.activities.length,
          icon: FiHeart,
        },
        {
          label: 'Saved Businesses',
          value: favorites.businesses.length,
          icon: FiBriefcase,
        },
        {
          label: 'Interests',
          value: interests.length,
          icon: FiBookmark,
        },
        {
          label: 'City',
          value: userData.city || 'Unknown',
          icon: FiMapPin,
        },
      ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500/30 pb-20">
      <Header />

      {/* Banner */}
      <div className="h-72 bg-gradient-to-br from-orange-600/20 via-[#121212] to-[#0a0a0a] border-b border-white/5 relative overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl hover:bg-orange-500 transition-all group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Return
          </span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8">

        {/* Profile Card */}
        <div className="relative -mt-36 flex flex-col md:flex-row items-end gap-10 mb-16">
          <div className="relative">
            <img
              src={profileImage}
              alt={userData.name}
              className="w-56 h-56 object-cover rounded-[48px] border-8 border-[#0a0a0a] shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-orange-500 p-3 rounded-2xl shadow-xl">
              <FiActivity className="text-white" size={24} />
            </div>
          </div>

          <div className="flex-1 pb-6">
            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${isOrganizer ? 'bg-blue-600' : 'bg-orange-600'}`}>
              {userData.role} Account
            </span>

            <h1 className="text-5xl font-black uppercase mt-4">
              {userData.name}
            </h1>

            <div className="flex flex-wrap gap-6 text-white/50 mt-4 text-sm">
              <span className="flex items-center gap-2"><FiMapPin /> {userData.city || 'Unknown city'}</span>
              <span className="flex items-center gap-2"><FiUser /> {age ? `${age} Years` : 'Age unavailable'}</span>
              <span className="flex items-center gap-2"><FiMail /> {userData.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  {label}
                </span>
                <Icon className="text-orange-500" size={20} />
              </div>
              <p className="text-3xl font-black tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-8">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-500">
                  {isOrganizer ? 'Business Portfolio' : 'Personal Interests'}
                </p>
                <h2 className="text-3xl font-black italic mt-3">
                  {isOrganizer ? 'Your presence in the city' : 'What you love exploring'}
                </h2>
              </div>
              {!isOrganizer && (
                <Link
                  to="/favorites"
                  className="rounded-full border border-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10"
                >
                  Open Favorites
                </Link>
              )}
            </div>

            {isOrganizer ? (
              businesses.length > 0 ? (
                <div className="space-y-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="rounded-3xl border border-white/10 bg-black/20 p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold">{business.name}</h3>
                          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-orange-500">
                            {business.type || 'Business'}
                          </p>
                        </div>
                        <p className="flex items-center gap-2 text-sm text-white/50">
                          <FiMapPin />
                          {business.location || 'Location unavailable'}
                        </p>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/60">
                        {business.description || 'Add a business description to tell visitors what makes this place special.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 p-8 text-white/50">
                  No businesses are linked to this organizer profile yet.
                </div>
              )
            ) : (
              <div className="flex flex-wrap gap-3">
                {interests.length > 0 ? (
                  interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-200"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 p-8 text-white/50 w-full">
                    No interests were added to this profile yet.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-500">
              Account Snapshot
            </p>
            <h2 className="text-3xl font-black italic mt-3 mb-8">
              Profile essentials
            </h2>

            <div className="space-y-5 text-sm text-white/70">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <span>Email</span>
                <span className="text-white">{userData.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <span>Role</span>
                <span className="text-white">{userData.role}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <span>City</span>
                <span className="text-white">{userData.city || 'Unknown city'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <span>Date of birth</span>
                <span className="text-white">{userData.date_of_birth || 'Unavailable'}</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Profile;
