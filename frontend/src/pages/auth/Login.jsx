import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import Riad from '../../assets/images/Morocca_Riad_with_Mosaic.jpg'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type' : 'Application/json',
          'Accept' : 'Application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await res.json();
      if(res.ok){
        console.log("res ok :)", data);
        navigate('/');
        localStorage.setItem(data.token, "token");
      }else{
        console.error("there is a problem in response : ", res);
      }
    }catch(error) {
      console.error("error : ", error);
    }
  };

  const handleOAuth = (provider) => {
    // provider.preventDefault();
    console.log('hi');
    window.location.href = `http://127.0.0.1:8000/api/auth/${provider}/redirect`;
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white font-inter overflow-hidden">
      
      {/* Left side - Decorative Image Side (Moroccan Riad Theme) */}
      <div className="hidden lg:flex flex-[0_0_45%] relative overflow-hidden items-center justify-center p-12 
        bg-[linear-gradient(135deg,rgba(21,50,55,0.95)_0%,rgba(35,107,115,0.85)_25%,rgba(45,140,145,0.75)_50%,rgba(90,120,100,0.65)_75%,rgba(0,0,0,0.9)_100%)]">
        
        {/* Glow/Blur Layer behind image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[85%] 
          bg-inherit filter blur-[60px] opacity-40 z-0"></div>
        
        <img 
          src={Riad}
          alt="Moroccan Riad" 
          className="relative z-10 w-3/4 h-3/4 max-w-[500px] max-h-[600px] object-cover rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        />
        
        {/* <div className="absolute bottom-12 left-12 text-[0.75rem] text-white/25 tracking-wider">
          Image generated using reference architecture images
        </div> */}
      </div>

      {/* Right side - Form Side */}
      <div className="flex-1 relative flex items-center justify-center p-8 md:p-12 
        bg-[linear-gradient(90deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.95)_20%,#000_40%)]">
        
        {/* Logo */}
        {/* <div className="absolute top-12 left-8 md:left-12">
          <span className="px-3.5 py-2 border-[1.5px] border-white/30 rounded-md text-base font-semibold tracking-tight">
            MyCityLife
          </span>
        </div> */}

        {/* Back Button */}
        {/* <button className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white/80 transition-all">
          <ArrowLeft size={16} />
        </button> */}

        <div className="w-full max-w-[420px]">
          <h1 className="text-3xl font-semibold mb-6 tracking-tight">Sign In to MyCityLife</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              required 
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[0.8125rem] focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
              onChange={handleChange}
            />

            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                required
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[0.8125rem] focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                onChange={handleChange}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end -mt-2">
              <a href="#" className="text-[0.875rem] text-white/50 hover:text-white/80 transition-colors">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="flex items-center justify-between w-full p-2.5 mt-3 bg-white/15 hover:bg-white/20 rounded-xl text-[0.8125rem] font-semibold transition-all">
              <span>Sign In</span>
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight size={16} strokeWidth={2.5} />
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-1 text-white/30 text-sm">
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <span>or continue with</span>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/45">Don't have an account?</span>
            <a href="/register" className="text-white underline hover:opacity-70 transition-opacity">Sign up</a>
          </div>

          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="text-white/45">Forget password ?</span>
            <a href="/ForgetPassword" className="text-white underline hover:opacity-70 transition-opacity">Reset </a>
          </div>
          
            {/* Social Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button type="button" onClick={() => handleOAuth('google')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[0.8125rem] hover:bg-white/10 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[0.8125rem] hover:bg-white/10 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;