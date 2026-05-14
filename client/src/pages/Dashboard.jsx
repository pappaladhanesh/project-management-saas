import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, AlertTriangle, ListTodo, Folder, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, totalProjects: 0, completionRate: 0 });
    const [chartData, setChartData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, chartRes, activityRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/chart-data'),
                    api.get('/dashboard/recent-activity')
                ]);

                setStats(statsRes.data);
                
                // Format dates for recharts
                const formattedChartData = (Array.isArray(chartRes.data) ? chartRes.data : []).map(item => ({
                    date: format(parseISO(item.date), 'MMM dd'),
                    completed: parseInt(item.count)
                }));
                setChartData(formattedChartData);
                
                setRecentActivity(Array.isArray(activityRes.data) ? activityRes.data : []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="max-w-7xl mx-auto space-y-8 p-6 animate-pulse">
            <div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-28 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl h-80 border border-gray-100 dark:border-gray-700"></div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl h-80 border border-gray-100 dark:border-gray-700"></div>
            </div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, darkBgClass }) => (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow`}>
            <div className={`p-4 rounded-xl ${bgClass} ${darkBgClass}`}>
                <Icon className={`w-8 h-8 ${colorClass}`} />
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Here's an overview of your project metrics and task progress.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Total Tasks" value={stats.totalTasks} icon={ListTodo} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-50" darkBgClass="dark:bg-blue-900/30" />
                <StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle} colorClass="text-green-600 dark:text-green-400" bgClass="bg-green-50" darkBgClass="dark:bg-green-900/30" />
                <StatCard title="Total Projects" value={stats.totalProjects} icon={Folder} colorClass="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-50" darkBgClass="dark:bg-indigo-900/30" />
                <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={TrendingUp} colorClass="text-purple-600 dark:text-purple-400" bgClass="bg-purple-50" darkBgClass="dark:bg-purple-900/30" />
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Task Completion History (Last 7 Days)</h2>
                    {chartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                            No task completion data for the last 7 days.
                        </div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} allowDecimals={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2">
                        {recentActivity.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-10">No recent activity.</p>
                        ) : (
                            <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                                {recentActivity.map(log => (
                                    <div key={log.id} className="relative pl-6">
                                        <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[6.5px] top-1.5 border-2 border-white dark:border-gray-800"></div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            <span className="font-semibold">{log.user_name}</span> updated <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.action_type.replace('_', ' ')}</span>
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                            Task: <span className="font-medium">{log.task_title}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                                            {format(new Date(log.created_at), 'MMM dd, yyyy h:mm a')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;