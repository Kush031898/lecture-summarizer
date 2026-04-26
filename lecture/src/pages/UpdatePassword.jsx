import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        
        setLoading(true);
        try {
            const response = await api.post('/summarizer/reset-password', { 
                password, 
                confirmPassword, 
                token 
            });
            if (response.data.success) {
                toast.success('Password reset successfully!');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary/20 rounded-2xl mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Choose new password</h1>
                    <p className="text-slate-400 text-sm text-center">Almost done. Enter your new password and you're all set.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-8 flex justify-center">
                    <Link to="/login" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
