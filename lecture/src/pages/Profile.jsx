import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, GraduationCap, Building, Loader2, Save, History, ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        gender: '',
        about: '',
        college: '',
        year: '',
        dateOfBirth: '',
        contactNumber: ''
    });

    const [history, setHistory] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await api.get('/profile/getProfile');
                if (response.data.success) {
                    const details = response.data.data.additionalDetails || {};
                    setFormData({
                        gender: details.gender || '',
                        about: details.about || '',
                        college: details.college || '',
                        year: details.year || '',
                        dateOfBirth: details.dateOfBirth || '',
                        contactNumber: details.contactNumber || ''
                    });
                }

                const historyRes = await api.get('/profile/history');
                if (historyRes.data.success) {
                    setHistory(historyRes.data.data);
                }
            } catch (error) {
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/profile/updateProfile', formData);
            if (response.data.success) {
                toast.success("Profile updated successfully!");
            } else {
                toast.error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("Error updating profile");
        } finally {
            setSaving(false);
        }
    };

    const parseMarkdown = (markdown) => {
        const sections = { transcript: '', summary: '', quiz: '' };
        if (!markdown) return sections;
        const transcriptMatch = markdown.match(/# TRANSCRIPT\s*([\s\S]*?)(?=# SUMMARY|# QUIZ|$)/i);
        const summaryMatch = markdown.match(/# SUMMARY\s*([\s\S]*?)(?=# TRANSCRIPT|# QUIZ|$)/i);
        const quizMatch = markdown.match(/# QUIZ\s*([\s\S]*?)(?=# TRANSCRIPT|# SUMMARY|$)/i);
        
        sections.transcript = transcriptMatch ? transcriptMatch[1].trim() : "";
        sections.summary = summaryMatch ? summaryMatch[1].trim() : markdown; 
        sections.quiz = quizMatch ? quizMatch[1].trim() : "";
        
        return sections;
    };

    const toggleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            setActiveTab('summary');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            {/* Profile Form Card */}
            <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-8 border-b border-white/10 flex items-center gap-4 bg-white/5">
                    <div className="p-4 bg-primary/20 rounded-full text-primary">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">Your Profile</h2>
                        <p className="text-slate-400 mt-1">Manage your personal information and preferences.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-sm text-slate-400">Account Status</p>
                            <p className="text-lg font-medium text-green-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span> Active
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            >
                                <option value="" className="bg-slate-800">Select Gender</option>
                                <option value="Male" className="bg-slate-800">Male</option>
                                <option value="Female" className="bg-slate-800">Female</option>
                                <option value="Prefer Not To Say" className="bg-slate-800">Prefer Not To Say</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Contact Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    placeholder="+91"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">College / University</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    placeholder="Enter your college name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Year of Study</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder="e.g. 3rd Year"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">About</label>
                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Tell us a little bit about yourself..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primaryHover disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* History Section */}
            <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-8 border-b border-white/10 flex items-center gap-4 bg-white/5">
                    <div className="p-4 bg-indigo-500/20 rounded-full text-indigo-400">
                        <History className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">Summary History</h2>
                        <p className="text-slate-400 mt-1">Review your past generated lectures and summaries.</p>
                    </div>
                </div>

                <div className="p-8">
                    {history.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                            <p className="text-slate-400">You haven't generated any summaries yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => {
                                const parsed = parseMarkdown(item.generatedSummary);
                                const isExpanded = expandedId === item._id;

                                return (
                                    <div key={item._id} className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all">
                                        <div 
                                            onClick={() => toggleExpand(item._id)}
                                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white">{item.videoTitle}</h3>
                                                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {item.status === 'Completed' ? (
                                                    <span className="flex items-center gap-1 text-sm font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                                                        <CheckCircle2 className="w-4 h-4" /> Completed
                                                    </span>
                                                ) : item.status === 'Processing' ? (
                                                    <span className="flex items-center gap-1 text-sm font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                                                        <Clock className="w-4 h-4" /> Processing
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-sm font-medium text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full">
                                                        <AlertCircle className="w-4 h-4" /> Failed
                                                    </span>
                                                )}
                                                <div className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && item.status === 'Completed' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/10 bg-black/20"
                                                >
                                                    <div className="p-6 border-b border-white/10 flex flex-wrap gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveTab('transcript'); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transcript' ? 'bg-primary text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                                        >
                                                            Transcript
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveTab('summary'); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-primary text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                                        >
                                                            Summary
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveTab('quiz'); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'quiz' ? 'bg-primary text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                                        >
                                                            Quiz
                                                        </button>
                                                    </div>
                                                    <div className="p-6 prose prose-invert prose-primary max-w-none">
                                                        <ReactMarkdown>
                                                            {activeTab === 'transcript' ? parsed.transcript || "No transcript available." :
                                                             activeTab === 'summary' ? parsed.summary || "No summary available." :
                                                             activeTab === 'quiz' ? parsed.quiz || "No quiz available." : ""}
                                                        </ReactMarkdown>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
