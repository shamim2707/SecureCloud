import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [files, setFiles] = useState([]); // state for multiple files
    const [isUploading, setIsUploading] = useState(false);
    const [myFiles, setMyFiles] = useState([]);

    useEffect(() => {
        fetchMyFiles();
    }, []);

    const fetchMyFiles = async () => {
        try {
            const res = await api.get('/files/myfiles');
            setMyFiles(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch your files');
        }
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files)); // convert FileList to array
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            return toast.error('Please select at least one file first.');
        }

        const formData = new FormData();
        files.forEach(f => {
            formData.append('files', f); // append each file under the key 'files'
        });

        setIsUploading(true);
        const loadingToast = toast.loading(`Encrypting & Uploading ${files.length} file(s)...`);

        try {
            await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Files Encrypted & Uploaded Successfully!', { id: loadingToast });
            setFiles([]);
            document.getElementById('file-upload-input').value = ""; // reset input UI
            fetchMyFiles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'File upload failed', { id: loadingToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (fileId, fileName) => {
        const loadingToast = toast.loading('Decrypting and downloading...');
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/files/${fileId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Format name as filename_decrypted.ext
            const lastDotIndex = fileName.lastIndexOf('.');
            let downloadName = fileName;
            if (lastDotIndex !== -1) {
                const name = fileName.substring(0, lastDotIndex);
                const ext = fileName.substring(lastDotIndex);
                downloadName = `${name}_decrypted${ext}`;
            } else {
                downloadName = `${fileName}_decrypted`;
            }
            a.download = downloadName;

            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('File successfully downloaded', { id: loadingToast });
        } catch (err) {
            toast.error('Failed to download file', { id: loadingToast });
        }
    };

    const handleRename = async (fileId, currentName) => {
        const newName = window.prompt("Enter new file name (including extension):", currentName);
        if (!newName || newName === currentName) return;

        try {
            await api.put(`/files/${fileId}/rename`, { newName });
            toast.success('File renamed successfully');
            fetchMyFiles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to rename file');
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("Are you sure you want to permanently delete this encrypted file?")) return;

        try {
            await api.delete(`/files/${fileId}`);
            toast.success('File deleted successfully');
            fetchMyFiles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete file');
        }
    };

    // Helper function to get extension
    const getFileExt = (filename) => {
        return filename.split('.').pop().toUpperCase();
    }

    return (
        <div className="min-h-[calc(100vh-76px)] p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-800">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Welcome, {user?.name || 'User'}
                        </h1>
                        <p className="text-slate-400 mt-2">Manage your end-to-end encrypted files securely.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="mt-4 md:mt-0 px-6 py-2.5 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-300 font-semibold shadow-lg"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="lg:col-span-1 border border-slate-700/50 p-8 rounded-3xl bg-[#1e293b]/60 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-start h-fit border-t-blue-500/30 border-t-2">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-100 text-center">Secure Vault</h2>
                        <p className="text-slate-400 text-sm text-center mb-8">Files are AES-256 encrypted before hitting the disk.</p>

                        <form onSubmit={handleUpload} className="w-full flex flex-col items-center gap-6">
                            <div className="w-full relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative bg-slate-800 rounded-xl p-4 flex justify-center items-center border border-slate-700 group-hover:border-slate-600 transition">
                                    <span className="text-slate-300 font-medium">
                                        {files.length > 0 ? `${files.length} file(s) selected` : 'Choose files to encrypt'}
                                    </span>
                                    <input
                                        id="file-upload-input"
                                        type="file"
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading || files.length === 0}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${isUploading || files.length === 0 ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 hover:shadow-emerald-500/25 translateY-[-2px]'}`}
                            >
                                {isUploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Encrypting...
                                    </span>
                                ) : 'Upload & Encrypt'}
                            </button>
                        </form>
                    </div>

                    {/* Files List Section */}
                    <div className="lg:col-span-2 border border-slate-700/50 p-8 rounded-3xl bg-[#1e293b]/60 backdrop-blur-xl shadow-2xl flex flex-col h-[600px] border-t-emerald-500/30 border-t-2 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                My Encrypted Files
                            </h2>
                            <span className="bg-slate-800 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-slate-700 font-bold">{myFiles.length} files</span>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-4 pb-4">
                            {myFiles.length > 0 ? (
                                myFiles.map((f) => (
                                    <div key={f._id} className="group flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 p-5 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition duration-300">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-slate-800 flex items-center justify-center border border-slate-700 text-blue-400 font-bold text-xs shadow-inner flex-shrink-0">
                                                {getFileExt(f.originalName)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-slate-200 font-semibold truncate text-lg" title={f.originalName}>{f.originalName}</h3>
                                                <p className="text-slate-500 text-xs mt-0.5">{(f.size / 1024).toFixed(2)} KB • {new Date(f.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4 flex-shrink-0">
                                            <button
                                                onClick={() => handleRename(f._id, f.originalName)}
                                                className="flex items-center justify-center p-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white transition duration-300 border border-slate-600/50 hover:shadow-lg group-hover:scale-105"
                                                title="Rename File"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>

                                            <button
                                                onClick={() => handleDelete(f._id)}
                                                className="flex items-center justify-center p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition duration-300 border border-red-500/20 hover:shadow-lg hover:shadow-red-500/25 group-hover:scale-105"
                                                title="Delete File"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>

                                            <button
                                                onClick={() => handleDownload(f._id, f.originalName)}
                                                className="flex items-center justify-center p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition duration-300 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25 group-hover:scale-105"
                                                title="Decrypt & Download"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                    <p className="text-lg font-medium text-slate-400">Your vault is empty</p>
                                    <p className="text-sm mt-1">Upload a file to encrypt it.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Styles for custom scrollbar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.5); 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(71, 85, 105, 0.8); 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 1); 
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;
