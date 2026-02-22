import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
            toast.success('Registration successful. Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-76px)] px-4">
            <div className="bg-[#1e293b]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md transform transition-all hover:shadow-emerald-500/10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-300">Create Account</h2>
                    <p className="text-slate-400 mt-2 text-sm">Join SecureCloud for end-to-end encryption</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-200 placeholder-slate-500"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-200 placeholder-slate-500"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-slate-200 placeholder-slate-500"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${isLoading ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/25 translateY-[-2px]'}`}
                    >
                        {isLoading ? 'Creating Account...' : 'Register Securely'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400 text-sm">
                    Already have an account? <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
