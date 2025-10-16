import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    TrendingUp,
    ArrowRight,
    Briefcase,
    Building2,
    Star,
    Award,
    Zap
} from 'lucide-react';
import UseTitle from '../../hooks/useTitle';

const JobSuggestions = () => {
    UseTitle('Gợi ý công việc phù hợp - JobVip');
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for agent filters from sessionStorage
        const agentFiltersJson = sessionStorage.getItem("agentFilters");
        
        if (agentFiltersJson) {
            try {
                const agentData = JSON.parse(agentFiltersJson);
                console.log("📦 Received agent data:", agentData);
                
                // Extract skills and jobs from agent data
                if (agentData.skills && Array.isArray(agentData.skills)) {
                    setSkills(agentData.skills);
                }
                
                if (agentData.jobs && Array.isArray(agentData.jobs)) {
                    // Transform jobs data to match component format
                    const transformedJobs = agentData.jobs.map(job => ({
                        id: job.id,
                        position_name: job.position_name,
                        company_name: job.company_name,
                        job_description: job.job_description,
                        requirements: job.requirements,
                        salary: job.salary,
                        deadline: job.deadline,
                        education_level: job.education_level,
                        benefits: job.benefits,
                        working_time: job.working_time,
                        industries: job.industries,
                        skills: job.skills,
                        addresses: job.addresses,
                        match_score: job.match_score
                    }));
                    setJobs(transformedJobs);
                }
                
                setLoading(false);
                
                // Clear after reading
                sessionStorage.removeItem("agentFilters");
            } catch (error) {
                console.error("❌ Error parsing agent filters:", error);
                setLoading(false);
            }
        } else {
            // No agent data available
            console.log("⚠️ No agent data found in sessionStorage");
            setLoading(false);
        }

        // Listen for navigation events
        const handleAgentNavigation = (event) => {
            const { filters } = event.detail;
            console.log("🔔 Agent navigation event received:", filters);
            
            if (filters) {
                // Update skills
                if (filters.skills && Array.isArray(filters.skills)) {
                    console.log("✅ Updating skills:", filters.skills);
                    setSkills(filters.skills);
                }
                
                // Update jobs
                if (filters.jobs && Array.isArray(filters.jobs)) {
                    console.log("✅ Updating jobs:", filters.jobs);
                    const transformedJobs = filters.jobs.map(job => ({
                        id: job.id,
                        position_name: job.position_name,
                        company_name: job.company_name,
                        job_description: job.job_description,
                        requirements: job.requirements,
                        salary: job.salary,
                        deadline: job.deadline,
                        education_level: job.education_level,
                        benefits: job.benefits,
                        working_time: job.working_time,
                        industries: job.industries,
                        skills: job.skills,
                        addresses: job.addresses,
                        match_score: job.match_score
                    }));
                    setJobs(transformedJobs);
                }
                
                setLoading(false);
            }
        };

        window.addEventListener('agentNavigation', handleAgentNavigation);
        return () => window.removeEventListener('agentNavigation', handleAgentNavigation);
    }, []);

    const sortJobs = (jobsList) => [...jobsList].sort((a, b) => b.match_score - a.match_score);

    const getMatchColor = (score) => {
        if (score >= 80) return 'match-excellent';
        if (score >= 60) return 'match-good';
        if (score >= 40) return 'match-average';
        return 'match-low';
    };

    const getMatchLabel = (score) => {
        if (score >= 80) return 'Rất phù hợp';
        if (score >= 60) return 'Phù hợp';
        if (score >= 40) return 'Khá phù hợp';
        return 'Ít phù hợp';
    };

    const sortedJobs = sortJobs(jobs);
    const handleViewDetail = (id) => navigate(`/job/${id}`);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 overflow-hidden">
                {/* Soft background animation */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 -left-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 -right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                </div>

                {/* Header Content */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 animate-bounce">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                        Công Việc Dành Cho Bạn
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/90 font-medium max-w-3xl mx-auto">
                        Dựa trên phân tích CV, chúng tôi tìm thấy{' '}
                        <span className="inline-flex items-center justify-center min-w-[3rem] h-10 px-4 bg-white/20 backdrop-blur-sm rounded-full font-bold">
                            {jobs.length}
                        </span>{' '}
                        công việc phù hợp
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-16">
                {/* Skills Section */}
                {!loading && skills.length > 0 && (
                    <div className="mb-8 bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Kỹ năng của bạn</h2>
                                <p className="text-sm text-gray-600">Được phát hiện từ CV của bạn</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {skills.map((skill, index) => {
                                const colors = [
                                    'from-blue-500 to-cyan-500',
                                    'from-purple-500 to-pink-500',
                                    'from-green-500 to-emerald-500',
                                    'from-orange-500 to-red-500',
                                    'from-indigo-500 to-purple-500',
                                    'from-yellow-500 to-orange-500',
                                ];
                                const bgColors = [
                                    'bg-blue-50 hover:bg-blue-100',
                                    'bg-purple-50 hover:bg-purple-100',
                                    'bg-green-50 hover:bg-green-100',
                                    'bg-orange-50 hover:bg-orange-100',
                                    'bg-indigo-50 hover:bg-indigo-100',
                                    'bg-yellow-50 hover:bg-yellow-100',
                                ];
                                const textColors = [
                                    'text-blue-700',
                                    'text-purple-700',
                                    'text-green-700',
                                    'text-orange-700',
                                    'text-indigo-700',
                                    'text-yellow-700',
                                ];
                                
                                const colorIndex = index % colors.length;
                                
                                return (
                                    <div
                                        key={index}
                                        className={`group relative ${bgColors[colorIndex]} border-2 border-transparent hover:border-purple-300 rounded-xl px-4 py-2.5 transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors[colorIndex]} animate-pulse`}></div>
                                            <span className={`font-semibold ${textColors[colorIndex]} text-sm`}>
                                                {skill}
                                            </span>
                                        </div>
                                        {/* Tooltip effect */}
                                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                                            {skill}
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Tổng số kỹ năng: <span className="text-purple-600">{skills.length}</span>
                                    </p>
                                    <p className="text-xs text-gray-600">Hồ sơ của bạn rất ấn tượng!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-sm font-bold">+{skills.length} skills</span>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600 animate-pulse" />
                        </div>
                        <p className="mt-6 text-lg text-gray-600 font-medium">
                            Đang phân tích và tìm kiếm công việc phù hợp...
                        </p>
                    </div>
                )}

                {!loading && jobs.length > 0 && (
                    <div className="space-y-6">
                        {/* Sort Header - Đã gọn gàng lại */}
                        

                        {/* Jobs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedJobs.map((job, index) => {
                                const colorClass = getMatchColor(job.match_score);
                                const gradients = {
                                    'match-excellent': 'from-emerald-500 to-green-500',
                                    'match-good': 'from-blue-500 to-purple-500',
                                    'match-average': 'from-orange-500 to-pink-500',
                                    'match-low': 'from-gray-400 to-gray-500'
                                };
                                const bgColors = {
                                    'match-excellent': 'bg-emerald-50',
                                    'match-good': 'bg-blue-50',
                                    'match-average': 'bg-orange-50',
                                    'match-low': 'bg-gray-50'
                                };
                                const textColors = {
                                    'match-excellent': 'text-emerald-700',
                                    'match-good': 'text-blue-700',
                                    'match-average': 'text-orange-700',
                                    'match-low': 'text-gray-700'
                                };

                                return (
                                    <div
                                        key={job.id}
                                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                                    >
                                        <div className={`relative h-32 bg-gradient-to-br ${gradients[colorClass]} p-6`}>
                                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${gradients[colorClass]} rounded-xl flex items-center justify-center shadow-lg`}>
                                                        <span className="text-white font-bold text-lg">{job.match_score}</span>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs text-gray-500 font-medium">Phù hợp</div>
                                                        <div className={`text-sm font-bold ${textColors[colorClass]}`}>
                                                            {getMatchLabel(job.match_score)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center gap-4 -mt-10 relative z-10">
                                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform duration-300">
                                                    <Building2 className="w-8 h-8 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                                        {job.position_name || job.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Building2 className="w-4 h-4" />
                                                        {job.company_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 font-medium">Độ phù hợp</span>
                                                    <span className={`font-bold ${textColors[colorClass]}`}>
                                                        {job.match_score}%
                                                    </span>
                                                </div>
                                                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${gradients[colorClass]} rounded-full transition-all duration-1000 ease-out`}
                                                        style={{ width: `${job.match_score}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className={`${bgColors[colorClass]} rounded-xl p-4 space-y-2`}>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 flex items-center gap-2">
                                                        <Zap className={`w-4 h-4 ${textColors[colorClass]}`} />
                                                        Cơ hội cao
                                                    </span>
                                                    <span className={`font-bold ${textColors[colorClass]}`}>
                                                        {job.match_score >= 80
                                                            ? 'Rất cao'
                                                            : job.match_score >= 60
                                                            ? 'Cao'
                                                            : 'Trung bình'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleViewDetail(job.id)}
                                                className={`w-full bg-gradient-to-r ${gradients[colorClass]} text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
                                            >
                                                <span>Xem chi tiết công việc</span>
                                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobSuggestions;
