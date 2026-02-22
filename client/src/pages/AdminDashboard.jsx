import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [userFiles, setUserFiles] = useState([]);
    const [selectedUserForFiles, setSelectedUserForFiles] = useState(null);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
        } else if (user && user.role === 'admin') {
            fetchAdminData();
        }
    }, [user, navigate]);

    const fetchAdminData = async () => {
        try {
            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data.data);

            const logsRes = await api.get('/admin/logs');
            setLogs(logsRes.data.data);
        } catch (error) {
            toast.error('Failed to fetch admin data');
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSelectAllUsers = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.map(u => u._id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleDeleteSelectedUsers = async () => {
        if (selectedUsers.length === 0) return;
        if (!window.confirm(`Are you sure you want to permanently delete ${selectedUsers.length} user(s) and ALL their files from the server?`)) return;

        try {
            await api.delete('/admin/users', { data: { userIds: selectedUsers } });
            toast.success(`${selectedUsers.length} user(s) deleted successfully`);
            setSelectedUsers([]);
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete users');
        }
    };

    const openUserFilesModal = async (u) => {
        setSelectedUserForFiles(u);
        setIsFilesModalOpen(true);
        try {
            const res = await api.get(`/admin/users/${u._id}/files`);
            setUserFiles(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch user files');
        }
    };

    const closeUserFilesModal = () => {
        setIsFilesModalOpen(false);
        setUserFiles([]);
        setSelectedUserForFiles(null);
    };

    const handleDownloadAdmin = async (fileId, fileName) => {
        const loadingToast = toast.loading('Decrypting and downloading...');
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/files/${fileId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const lastDotIndex = fileName.lastIndexOf('.');
            let downloadName = fileName;
            if (lastDotIndex !== -1) {
                downloadName = `${fileName.substring(0, lastDotIndex)}_decrypted${fileName.substring(lastDotIndex)}`;
            } else {
                downloadName = `${fileName}_decrypted`;
            }
            a.download = downloadName;

            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('File downloaded', { id: loadingToast });
        } catch (err) {
            toast.error('Failed to download file', { id: loadingToast });
        }
    };

    const handleDeleteFileAdmin = async (fileId) => {
        if (!window.confirm("Delete this user's file permanently?")) return;
        try {
            await api.delete(`/files/${fileId}`);
            toast.success('File deleted successfully');
            // refresh Modal
            if (selectedUserForFiles) {
                const res = await api.get(`/admin/users/${selectedUserForFiles._id}/files`);
                setUserFiles(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete file');
        }
    };


    return (
        <div className="min-h-[calc(100vh-80px)] p-6 md:p-10 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-purple-900/10 pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Command Center
                        </h1>
                        <p className="text-slate-400 mt-2">Manage users, oversee files, and monitor system activity.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Users Management */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-200">User Management</h2>
                            {selectedUsers.length > 0 && (
                                <button
                                    onClick={handleDeleteSelectedUsers}
                                    className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition border border-red-500/30 shadow-lg shadow-red-500/20"
                                >
                                    Delete Selected ({selectedUsers.length})
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                            <table className="min-w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-md z-10">
                                    <tr className="text-slate-400 text-sm border-b border-slate-700">
                                        <th className="p-4 rounded-tl-xl text-center">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAllUsers}
                                                checked={users.length > 0 && selectedUsers.length === users.length}
                                                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                                            />
                                        </th>
                                        <th className="p-4 font-semibold">User</th>
                                        <th className="p-4 font-semibold">Role</th>
                                        <th className="p-4 font-semibold rounded-tr-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-slate-300">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-slate-700/30 transition">
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(u._id)}
                                                    onChange={() => handleSelectUser(u._id)}
                                                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-200">{u.name}</div>
                                                <div className="text-xs text-slate-500">{u.email}</div>
                                            </td>
                                            <td className="p-4 capitalize">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => openUserFilesModal(u)}
                                                    className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition border border-blue-500/20"
                                                >
                                                    View Files
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col h-[600px]">
                        <h2 className="text-xl font-bold text-slate-200 mb-6">System Audit Logs</h2>
                        <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                            <div className="space-y-4">
                                {logs.map(log => (
                                    <div key={log._id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-orange-400 text-sm">{log.action}</span>
                                            <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="text-sm text-slate-300 truncate">User: {log.userId?.email || 'N/A'}</div>
                                        <div className="text-xs text-slate-500">IP: {log.ipAddress}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Files Modal */}
            {isFilesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-600 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/90 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-200">Files for {selectedUserForFiles?.name}</h3>
                                <p className="text-sm text-slate-400">{selectedUserForFiles?.email}</p>
                            </div>
                            <button onClick={closeUserFilesModal} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-800/50">
                            {userFiles.length > 0 ? (
                                <div className="space-y-3">
                                    {userFiles.map(f => (
                                        <div key={f._id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-2xl border border-slate-600/50 hover:border-slate-500 transition">
                                            <div className="min-w-0 pr-4">
                                                <h4 className="text-slate-200 font-semibold truncate text-sm">{f.originalName}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{(f.size / 1024).toFixed(2)} KB • {new Date(f.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleDownloadAdmin(f._id, f.originalName)}
                                                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition" title="Download">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFileAdmin(f._id)}
                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition" title="Delete">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-center py-8">This user has no encrypted files.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.8); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 1); }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
