import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const { verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Email missing. Please login again.');
            return navigate('/login');
        }

        setIsLoading(true);
        try {
            await verifyOTP(email, otp);
            toast.success('Login Successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-76px)] px-4">
            <div className="bg-[#1e293b]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md transform transition-all hover:shadow-cyan-500/10">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Two-Factor Authentication</h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        Please enter the OTP sent to <span className="text-slate-200 font-semibold">{email || 'your email'}</span>.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition text-slate-200 placeholder-slate-600 text-center tracking-[0.5em] text-2xl font-mono"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // only numbers
                            placeholder="------"
                            maxLength="6"
                            required
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${isLoading ? 'bg-cyan-600/50 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/25 translateY-[-2px]'}`}
                    >
                        {isLoading ? 'Verifying...' : 'Verify & Proceed'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
