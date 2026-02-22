import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-[calc(100vh-76px)] flex flex-col items-center justify-center px-4 relative">
            <div className="z-10 text-center max-w-3xl mx-auto">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold text-sm shadow-lg shadow-blue-500/10 backdrop-blur-sm">
                    🚀 The Ultimate Secure Cloud Storage
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                    Store Your Files with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                        Zero-Knowledge Encryption
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    SecureCloud uses AES-256 to encrypt your files locally before they ever reach our servers. Only you hold the key. Experience absolute privacy.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {user ? (
                        <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-1">
                                Get Started for Free
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all duration-300">
                                Sign In
                            </Link>
                        </>
                    )}
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2">End-to-End Encryption</h3>
                        <p className="text-slate-400 text-sm">Your files are encrypted before upload. We cannot see your data, ever.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2">Two-Factor Auth</h3>
                        <p className="text-slate-400 text-sm">Every login requires email OTP verification, guaranteeing account safety.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2">Lightning Fast</h3>
                        <p className="text-slate-400 text-sm">Built on React & Node.js for ultra-fast, responsive file handling.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
