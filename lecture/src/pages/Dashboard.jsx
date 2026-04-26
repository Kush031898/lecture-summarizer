import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileVideo, Sparkles, CheckCircle2, AlertTriangle, ExternalLink, TrendingUp, BookOpen, Flame } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';

const Dashboard = () => {
    // states: "idle", "uploading", "processing", "result"
    const [appState, setAppState] = useState('idle');
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [lectureId, setLectureId] = useState(null);
    const [activeTab, setActiveTab] = useState('summary'); // 'transcript', 'summary', 'quiz'
    const [parsedSummary, setParsedSummary] = useState({ transcript: '', summary: '', quiz: '' });
    
    // Stats & History
    const [stats, setStats] = useState({ total: 0, successful: 0, streak: 0 });
    
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/profile/history');
                if (response.data.success) {
                    const data = response.data.data;
                    const total = data.length;
                    const successful = data.filter(item => item.status === 'Completed').length;
                    let streak = 0;
                    if (data.length > 0) {
                        const dates = [...new Set(data.map(item => new Date(item.createdAt).toDateString()))];
                        streak = dates.length; // Active study days
                    }
                    setStats({ total, successful, streak });
                }
            } catch (error) {
                console.error("Failed to fetch history for stats", error);
            }
        };
        fetchHistory();
    }, []);

    const parseMarkdown = (markdown) => {
        const sections = { transcript: '', summary: '', quiz: '' };

        // Use a regex to extract text between headings. 
        // We look for # TRANSCRIPT and capture everything until # SUMMARY, # QUIZ, or end of string.
        const transcriptMatch = markdown.match(/# TRANSCRIPT\s*([\s\S]*?)(?=# SUMMARY|# QUIZ|$)/i);
        const summaryMatch = markdown.match(/# SUMMARY\s*([\s\S]*?)(?=# TRANSCRIPT|# QUIZ|$)/i);
        const quizMatch = markdown.match(/# QUIZ\s*([\s\S]*?)(?=# TRANSCRIPT|# SUMMARY|$)/i);

        sections.transcript = transcriptMatch ? transcriptMatch[1].trim() : "";
        sections.summary = summaryMatch ? summaryMatch[1].trim() : markdown; // Fallback to raw markdown if parsing fails
        sections.quiz = quizMatch ? quizMatch[1].trim() : "";

        return sections;
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/*': ['.mp4', '.mov'],
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file || !title) {
            return toast.error("Please provide a title and select a file.");
        }

        const formData = new FormData();
        formData.append('videoTitle', title);
        formData.append('uploadLecture', file);

        setAppState('uploading');

        try {
            const response = await api.post('/summarizer/summary', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000 // 5 minutes timeout for upload
            });

            if (response.data.success) {
                setLectureId(response.data.lectureId);
                setAppState('processing');
                toast.success("Upload complete. Processing started.");
            } else {
                toast.error(response.data.message || "Upload failed");
                setAppState('idle');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong during upload");
            setAppState('idle');
        }
    };

    useEffect(() => {
        let interval;
        if (appState === 'processing' && lectureId) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/summarizer/status/${lectureId}`);
                    if (res.data.success) {
                        if (res.data.status === 'Completed') {
                            const rawText = res.data.summary;
                            setParsedSummary(parseMarkdown(rawText));
                            setAppState('result');
                            clearInterval(interval);
                            toast.success("Summary generated successfully!");
                        } else if (res.data.status === 'Failed') {
                            setAppState('idle');
                            clearInterval(interval);
                            toast.error("Processing failed. Please try again.");
                        }
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [appState, lectureId]);

    const resetApp = () => {
        setAppState('idle');
        setFile(null);
        setTitle('');
        setLectureId(null);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <AnimatePresence mode="wait">
                {/* IDLE STATE */}
                {appState === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2">Upload Lecture</h2>
                            <p className="text-slate-400">Upload your video or audio lecture and let our AI generate a comprehensive summary.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Lecture Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Introduction to Machine Learning"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-400'}`}>
                                        {file ? <FileVideo className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        {file ? (
                                            <p className="text-lg font-medium text-white">{file.name}</p>
                                        ) : (
                                            <>
                                                <p className="text-lg font-medium text-white">Drag & drop your file here</p>
                                                <p className="text-sm text-slate-400 mt-1">or click to browse from your computer</p>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">Supports MP4, MOV, MP3, WAV (Max 500MB)</p>
                                </div>
                            </div>

                            {file && file.size > 100 * 1024 * 1024 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm text-orange-200">
                                            This file is larger than 100MB. Processing might take a long time. We highly recommend compressing it first.
                                        </p>
                                    </div>
                                    <a
                                        href="https://cloudconvert.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Compress Now
                                    </a>
                                </motion.div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || !title}
                                className="w-full bg-primary hover:bg-primaryHover disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Generate Summary
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* UPLOADING / PROCESSING STATE */}
                {(appState === 'uploading' || appState === 'processing') && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="min-h-[400px] flex flex-col items-center justify-center bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                            <div className="relative bg-surface border-2 border-primary rounded-full p-6">
                                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {appState === 'uploading' ? 'Uploading Lecture...' : 'Gemini is analyzing...'}
                        </h2>
                        <p className="text-slate-400 text-center max-w-md">
                            {appState === 'uploading'
                                ? 'Please wait while your file is securely uploaded to the cloud.'
                                : 'Our AI is carefully watching and extracting the most important insights from your lecture. This may take a few minutes.'}
                        </p>
                    </motion.div>
                )}

                {/* RESULT STATE */}
                {appState === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
                    >
                        <div className="bg-white/5 border-b border-white/10 p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    Processing Complete
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">{title}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('transcript')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transcript' ? 'bg-primary text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                >
                                    Transcript
                                </button>
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-primary text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                >
                                    Summary
                                </button>
                                <button
                                    onClick={() => setActiveTab('quiz')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'quiz' ? 'bg-primary text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                >
                                    Quiz
                                </button>
                                <button
                                    onClick={resetApp}
                                    className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg text-sm font-medium transition-colors ml-2"
                                >
                                    Start Over
                                </button>
                            </div>
                        </div>
                        <div className="p-8 prose prose-invert prose-primary max-w-none">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <ReactMarkdown>
                                        {activeTab === 'transcript' ? parsedSummary.transcript || "No transcript available." :
                                            activeTab === 'summary' ? parsedSummary.summary || "No summary available." :
                                                activeTab === 'quiz' ? parsedSummary.quiz || "No quiz available." : ""}
                                    </ReactMarkdown>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="text-center mt-8">
                Made with Love by Kush Mantoo(Author)
                <div className="flex justify-center gap-4 mt-4">
                    <a href="https://github.com/Kush031898" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                        <FaGithub className="w-6 h-6" />
                    </a>
                    <a href="https://linkedin.com/in/kush-mantoo-7503a1253" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                        <FaLinkedin className="w-6 h-6" />
                    </a>
                </div>
            </div>
        </div>

    );
};

export default Dashboard;
