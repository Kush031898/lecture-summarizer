import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Key, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            return toast.error("Please enter your email address to receive an OTP.");
        }
        setSendingOtp(true);
        try {
            const response = await api.post('/summarizer/sendOtp', { email: formData.email });
            if (response.data.success) {
                toast.success('A One-Time Password has been sent to your email.');
                setOtpSent(true);
            } else {
                toast.error(response.data.message || 'Unable to send OTP. Please try again.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while sending the OTP. Please try again later.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("The passwords you entered do not match. Please try again.");
        }
        if (!formData.otp) {
            return toast.error("Please enter the One-Time Password sent to your email.");
        }
        
        setLoading(true);
        try {
            const response = await api.post('/summarizer/signup', formData);
            if (response.data.success) {
                toast.success('Your account has been created successfully. You can now log in.');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Unable to complete signup. Please verify your details.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred during signup. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
            <div className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary/20 rounded-2xl mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-slate-400 text-sm text-center">Join us to start summarizing</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                placeholder="First Name" required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                placeholder="Last Name" required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="email" name="email" value={formData.email} onChange={handleChange}
                                placeholder="Email address" required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        {!otpSent && (
                            <button 
                                type="button" onClick={handleSendOtp} disabled={sendingOtp}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                {sendingOtp ? 'Sending...' : 'Send OTP'}
                            </button>
                        )}
                    </div>
                    {otpSent && (
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" name="otp" value={formData.otp} onChange={handleChange}
                                placeholder="Enter 6-digit OTP" required maxLength="6"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="password" name="password" value={formData.password} onChange={handleChange}
                            placeholder="Password" required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                            placeholder="Confirm Password" required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !otpSent}
                        className="w-full bg-primary hover:bg-primaryHover disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-8">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primaryHover font-medium transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
