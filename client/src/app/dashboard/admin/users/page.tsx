'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { UserModal } from '@/features/users/components/UserModal';
import { cn } from '@/lib/utils';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async (searchQuery = '') => {
    setIsLoading(true);
    try {
      const token = Cookies.get('auth_token');
      const url = searchQuery 
        ? `${process.env.NEXT_PUBLIC_API_URL}/users?search=${encodeURIComponent(searchQuery)}`
        : `${process.env.NEXT_PUBLIC_API_URL}/users`;
        
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        // Fallback mock data if DB is down
        setUsers([
          { id: '1', fullName: 'John Doe', username: 'johnd', email: 'john@example.com', phone: '1234567890', role: 'USER', isBlocked: false },
          { id: '2', fullName: 'Admin User', username: 'admin', email: 'admin@example.com', phone: '0987654321', role: 'ADMIN', isBlocked: false },
        ]);
        toast.error('Database connection failed. Showing mock data.');
      } else {
        toast.error('Failed to load users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleOpenModal = (user?: any) => {
    setSelectedUser(user || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (data: any) => {
    setIsSaving(true);
    try {
      const token = Cookies.get('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (selectedUser) {
        // Edit
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.id}`, data, { headers });
        toast.success('User updated successfully');
      } else {
        // Create
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, data, { headers });
        const { emailPreviewUrl, isRealEmailSent } = response.data;
        
        if (isRealEmailSent) {
          toast.success('User created successfully! Welcome credentials email sent to their real inbox.');
        } else if (emailPreviewUrl) {
          toast((t) => (
            <div className="flex flex-col gap-1.5 p-1 text-slate-100">
              <span className="font-semibold text-emerald-400 text-sm">User created successfully!</span>
              <span className="text-xs text-slate-400">Welcome credentials email sent to developer preview mailbox.</span>
              <a 
                href={emailPreviewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-blue-400 hover:text-blue-300 underline font-bold mt-1 flex items-center gap-1"
                onClick={() => toast.dismiss(t.id)}
              >
                Click to view sent welcome email ↗
              </a>
            </div>
          ), { duration: 10000 });
        } else {
          toast.success('User created successfully! Welcome credentials dispatched.');
        }
      }
      
      handleCloseModal();
      fetchUsers(search);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot save user while offline/database is down.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to save user');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      const token = Cookies.get('auth_token');
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/block`, 
        { isBlocked: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
      setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !currentStatus } : u));
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    try {
      const token = Cookies.get('auth_token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
          <button 
            type="button" 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </form>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.fullName}</div>
                      <div className="text-xs text-slate-500">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{user.email}</div>
                      <div className="text-xs text-slate-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        user.role === 'ADMIN' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBlocked ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <ShieldAlert className="w-3.5 h-3.5" /> Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                          className={cn("p-1.5 transition-colors", user.isBlocked ? "text-red-400 hover:text-emerald-400" : "text-slate-400 hover:text-red-400")}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveUser}
        initialData={selectedUser}
        isLoading={isSaving}
      />
    </div>
  );
}
