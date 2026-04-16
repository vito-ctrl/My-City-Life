import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import image from '../../assets/images/download.jpg';

const AVAILABLE_INTERESTS = [
  'Music', 'Art', 'Food & Drink', 'Sports', 'Nightlife',
  'Tech', 'Culture', 'Outdoors', 'Markets', 'Theatre'
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
    age: '',
    city: '',
    image: null,
    interests: [],
    // Organizer fields
    business_name: '',
    business_type: '',
    business_location: '',
    business_description: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  // FIX 1: toggle interests in/out of the array
  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
    setErrors(prev => ({ ...prev, interests: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    const form = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === 'interests') {
        // FIX 2: append each interest individually so Laravel receives an array
        formData.interests.forEach(interest => form.append('interests[]', interest));
      } else if (formData[key] !== null && formData[key] !== '') {
        form.append(key, formData[key]);
      }
    });

    try {
      const res = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/login');
      } else if (res.status === 422) {
        // FIX 3: surface Laravel validation errors to the user
        setErrors(data.errors || {});
      } else {
        setServerError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setServerError('Network error. Please check your connection.', err);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[0.8125rem] focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all';
  const errorClass = 'text-red-400 text-xs mt-1';

  return (
    <div className="flex h-screen w-screen bg-black text-white font-inter">

      {/* Left side */}
      <div className="hidden lg:flex flex-[0_0_45%] relative overflow-hidden items-center justify-center p-12
        bg-[linear-gradient(135deg,rgba(40,85,95,0.95)_0%,rgba(75,140,160,0.85)_25%,rgba(210,145,120,0.75)_50%,rgba(235,160,140,0.65)_75%,rgba(0,0,0,0.9)_100%)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[85%]
          bg-inherit filter blur-[60px] opacity-40 z-0" />
        <img
          src={image}
          alt="Moroccan Riad"
          className="relative z-10 w-3/4 h-3/4 max-w-[500px] max-h-[600px] object-cover rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Right side */}
      <div className="flex-1 relative flex items-start justify-center p-8 md:p-12 overflow-y-auto
        bg-[linear-gradient(90deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.95)_20%,#000_40%)]">

        <div className="w-full max-w-[440px] min-h-full flex flex-col justify-center py-8">
          <h1 className="text-3xl font-semibold mb-6 tracking-tight">Create Your Account</h1>

          {/* FIX 3: global server error banner */}
          {serverError && (
            <div className="flex items-center justify-between mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <span>{serverError}</span>
              <button onClick={() => setServerError('')}><X size={16} /></button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input type="text" name="name" placeholder="Full Name" required className={inputClass} onChange={handleChange} />
                {errors.name && <p className={errorClass}>{errors.name[0]}</p>}
              </div>
              <div>
                <input type="number" name="age" placeholder="Age" min="13" max="70" required className={inputClass} onChange={handleChange} />
                {errors.age && <p className={errorClass}>{errors.age[0]}</p>}
              </div>
            </div>

            <div>
              <input type="email" name="email" placeholder="Email Address" required className={inputClass} onChange={handleChange} />
              {errors.email && <p className={errorClass}>{errors.email[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                {/* FIX 5 (frontend side): all option values are lowercase to match backend validation */}
                <select name="role" required className={`${inputClass} text-white/70 appearance-none`} onChange={handleChange}>
                  <option value="user" className="bg-zinc-900">User</option>
                  <option value="admin" className="bg-zinc-900">Admin</option>
                  <option value="Organizer" className="bg-zinc-900">Organizer</option>
                </select>
                {errors.role && <p className={errorClass}>{errors.role[0]}</p>}
              </div>
              <div>
                <input type="text" name="city" placeholder="City" required className={inputClass} onChange={handleChange} />
                {errors.city && <p className={errorClass}>{errors.city[0]}</p>}
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="Password (min 6 chars)" required minLength="6"
                  className={inputClass} onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className={errorClass}>{errors.password[0]}</p>}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="password_confirmation" placeholder="Confirm Password" required
                className={inputClass} onChange={handleChange}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* FIX 1: real interests selector, shown only for 'user' role */}
            {formData.role === 'user' && (
              <div>
                <p className="text-xs text-white/45 mb-2">Select your interests</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        formData.interests.includes(interest)
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {errors.interests && <p className={errorClass}>{errors.interests[0]}</p>}
              </div>
            )}

            {/* Organizer fields — shown only when role is 'organizer' */}
            {formData.role === 'Organizer' && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-white/45 -mb-1">Business Details</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text" name="business_name" placeholder="Business Name" required
                      className={inputClass} onChange={handleChange}
                    />
                    {errors.business_name && <p className={errorClass}>{errors.business_name[0]}</p>}
                  </div>
                  <div>
                    <select
                      name="business_type" required
                      className={`${inputClass} text-white/70 appearance-none`}
                      onChange={handleChange}
                    >
                      <option value="" className="bg-zinc-900">Business Type</option>
                      <option value="Bar" className="bg-zinc-900">Bar</option>
                      <option value="Cafe" className="bg-zinc-900">Cafe</option>
                      <option value="Restaurant" className="bg-zinc-900">Restaurant</option>
                      <option value="Event" className="bg-zinc-900">Event</option>
                    </select>
                    {errors.business_type && <p className={errorClass}>{errors.business_type[0]}</p>}
                  </div>
                </div>

                <div>
                  <input
                    type="text" name="business_location" placeholder="Business Location" required
                    className={inputClass} onChange={handleChange}
                  />
                  {errors.business_location && <p className={errorClass}>{errors.businessLocation[0]}</p>}
                </div>

                <div>
                  <textarea
                    name="business_description" placeholder="Business Description" required rows={3}
                    className={`${inputClass} resize-none`} onChange={handleChange}
                  />
                  {errors.business_description && <p className={errorClass}>{errors.business_description[0]}</p>}
                </div>
              </div>
            )}

            <div className="relative flex items-center gap-2 w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[0.8125rem] text-white/35 cursor-pointer hover:bg-white/10 transition-all">
              <ImageIcon size={18} />
              <span className="truncate">{formData.image ? formData.image.name : 'Upload Profile Image (Max 2MB)'}</span>
              <input type="file" name="image" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            </div>
            {errors.image && <p className={errorClass}>{errors.image[0]}</p>}

            <button type="submit"
              className="flex items-center justify-between w-full p-2.5 mt-4 bg-white/15 hover:bg-white/20 rounded-xl text-[0.8125rem] font-semibold transition-all">
              <span>Create Account</span>
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight size={16} strokeWidth={2.5} />
              </div>
            </button>
          </form>

          <div className="flex items-center gap-2 text-sm mt-3">
            <span className="text-white/45">Already have an account?</span>
            <a href="/login" className="text-white underline hover:opacity-70 transition-opacity">Log in</a>
          </div>

          <p className="text-[0.8125rem] text-white/35 leading-relaxed mt-3">
            By signing up you agree to MyCityLife's{' '}
            <a href="#" className="text-white/45 underline">Terms</a> and{' '}
            <a href="#" className="text-white/45 underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;